"use client";

import { useCallback, useEffect, useState } from "react";
import type { Card, CheckedFinding } from "@/lib/schemas";

type Role = "Veteran" | "Quality lead" | "Apprentice";
type Meta = { source?: "live" | "sample" | "none"; model?: string; error?: string };
type Compare = { findings: CheckedFinding[]; confirmed_matches: string[] } & Meta;
type AskRes = {
  in_scope: boolean; no_guidance: boolean; answer: string; missing_information: string[];
  cited_cards: { id: string; title: string; status: string }[]; cited_quotes: string[];
} & Meta;
type AppState = {
  fixtures: { instruction: string; veteran: string };
  state: { compare: { findings: CheckedFinding[]; confirmed_matches: string[]; offline: boolean } | null; cards: Card[] };
  offline: boolean; model: string;
};

const QUICK = [
  "My first bracket measured 0.002 over on the pocket. Should I bump the wear offset?",
  "What spindle speed should I run for the roughing pass?",
];

async function api<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

function Banner({ meta }: { meta: Meta }) {
  if (meta.source === "sample")
    return (
      <>
        {meta.error && <div className="banner fail">watsonx.ai call failed: {meta.error} Showing sample output.</div>}
        <div className="banner sample">Sample output (offline), not a live model call.</div>
      </>
    );
  if (meta.source === "live") return <div className="tag">Granite on watsonx.ai · {meta.model}</div>;
  return null;
}

function Highlighted({ text, quotes }: { text: string; quotes: string[] }) {
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const q of quotes) {
    const i = q ? lower.indexOf(q.toLowerCase()) : -1;
    if (i >= 0) ranges.push([i, i + q.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let pos = 0;
  ranges.forEach(([s, e], k) => {
    if (s < pos) return;
    out.push(text.slice(pos, s), <mark key={k}>{text.slice(s, e)}</mark>);
    pos = e;
  });
  out.push(text.slice(pos));
  return <pre className="src">{out}</pre>;
}

const lines = (a: string[]) => a.join("\n");
const unlines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function CardEditor({ card, role, onChange, onError }: { card: Card; role: Role; onChange: () => void; onError: (m: string) => void }) {
  const [f, setF] = useState({
    title: card.title, scope: card.scope, steps: lines(card.steps), applies_when: lines(card.applies_when),
    do_not_apply_when: lines(card.do_not_apply_when), escalate_if: lines(card.escalate_if),
  });
  const [busy, setBusy] = useState("");
  useEffect(() => {
    setF({ title: card.title, scope: card.scope, steps: lines(card.steps), applies_when: lines(card.applies_when), do_not_apply_when: lines(card.do_not_apply_when), escalate_if: lines(card.escalate_if) });
  }, [card]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const run = async (name: string, fn: () => Promise<unknown>) => {
    setBusy(name);
    try { await fn(); onChange(); } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
    setBusy("");
  };
  const save = () => run("save", () => api(`/api/cards/${card.id}`, "PUT", { edits: { title: f.title, scope: f.scope, steps: unlines(f.steps), applies_when: unlines(f.applies_when), do_not_apply_when: unlines(f.do_not_apply_when), escalate_if: unlines(f.escalate_if) } }));
  const move = (to: string) => run(to, () => api(`/api/cards/${card.id}/status`, "POST", { to }));
  return (
    <div className="panel">
      <p><span className={`status ${card.status}`}>{card.status.replace("_", " ")}</span> <span className="note">{card.procedure} {card.procedure_revision}</span></p>
      <label className="f" htmlFor={`t-${card.id}`}>Title</label>
      <input id={`t-${card.id}`} type="text" value={f.title} onChange={set("title")} />
      <label className="f" htmlFor={`sc-${card.id}`}>Scope</label>
      <input id={`sc-${card.id}`} type="text" value={f.scope} onChange={set("scope")} />
      {([["steps", "Steps (one per line)"], ["applies_when", "Applies when"], ["do_not_apply_when", "Does not apply when"], ["escalate_if", "Escalate if"]] as const).map(([k, label]) => (
        <div key={k}>
          <label className="f" htmlFor={`${k}-${card.id}`}>{label}</label>
          <textarea id={`${k}-${card.id}`} rows={3} value={f[k]} onChange={set(k)} />
        </div>
      ))}
      <label className="f">Source quotes</label>
      {card.source_quotes.map((q, i) => <blockquote key={i}><b>{q.source}:</b> {q.text}</blockquote>)}
      {card.confirmed_by && <p className="note">Confirmed by {card.confirmed_by}</p>}
      {card.approved_by && <p className="note">Approved by {card.approved_by}</p>}
      <div className="row">
        <button onClick={save} disabled={!!busy}>{busy === "save" ? "Saving..." : "Save edits"}</button>
        <button className="primary" onClick={() => move("expert_confirmed")} disabled={!!busy || card.status !== "candidate" || role !== "Veteran"}>
          {busy === "expert_confirmed" ? "Confirming..." : "Confirm my account is accurate"}
        </button>
        <button className="primary" onClick={() => move("approved")} disabled={!!busy || card.status !== "expert_confirmed" || role !== "Quality lead"}>
          {busy === "approved" ? "Approving..." : "Approve for training"}
        </button>
      </div>
      <p className="note">Saving edits sends the card back to candidate. Confirm needs the Veteran role; approve needs the Quality lead role.</p>
    </div>
  );
}

export default function Home() {
  const [app, setApp] = useState<AppState | null>(null);
  const [tab, setTab] = useState(1);
  const [role, setRole] = useState<Role>("Veteran");
  const [cmp, setCmp] = useState<Compare | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState("");
  const [ask, setAsk] = useState<AskRes | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const s = await api<AppState>("/api/state");
      setApp(s);
      setCmp((c) => c ?? (s.state.compare ? { ...s.state.compare, source: s.state.compare.offline ? "sample" : "live", model: s.model } : null));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const guard = async (name: string, fn: () => Promise<void>) => {
    setBusy(name); setError("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    setBusy("");
  };

  const findGaps = () => guard("compare", async () => { setCmp(await api<Compare>("/api/compare", "POST", {})); await load(); });
  const draft = (id: string) => guard("draft-" + id, async () => {
    const r = await api<{ card: Card } & Meta>("/api/cards", "POST", { finding_id: id, expert_answer: answers[id] || "" });
    await load();
    if (r.source === "sample" && r.error) setError(`watsonx.ai call failed: ${r.error} Showing sample output.`);
    setTab(2);
  });
  const doAsk = (q: string) => guard("ask", async () => { setAsk(await api<AskRes>("/api/ask", "POST", { question: q })); });
  const reset = () => guard("reset", async () => { await api("/api/reset", "POST", {}); setCmp(null); setAsk(null); setAnswers({}); setQuestion(""); setTab(1); await load(); });
  const pickRole = (r: Role) => { setRole(r); setTab(r === "Apprentice" ? 3 : r === "Quality lead" ? 2 : 1); };

  const cards = app?.state.cards ?? [];
  const findings = cmp?.findings ?? [];
  const vetQuotes = findings.map((f) => f.veteran_quote);
  const insQuotes = findings.map((f) => f.instruction_quote);

  return (
    <>
      <header>
        <h1>ShiftProof</h1>
        <div className="hdr-controls">
          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(e) => pickRole(e.target.value as Role)}>
            <option>Veteran</option><option>Quality lead</option><option>Apprentice</option>
          </select>
          <button onClick={reset} disabled={busy === "reset"}>{busy === "reset" ? "Resetting..." : "Reset demo"}</button>
          <span className="note">Demo roles, not real sign-in</span>
        </div>
      </header>
      <main>
        <nav className="tabs" role="tablist">
          {[["1 Compare", 1], ["2 Review", 2], ["3 Ask", 3]].map(([l, n]) => (
            <button key={n} role="tab" aria-selected={tab === n} onClick={() => setTab(n as number)}>{l}</button>
          ))}
        </nav>
        {error && <div className="banner fail" role="alert">{error}</div>}

        {tab === 1 && (
          <section>
            <div className="grid2">
              <div className="panel"><h2>Work instruction WI-114 Rev C</h2><p className="note">Fictional training fixture</p>
                {app && <Highlighted text={app.fixtures.instruction} quotes={insQuotes} />}</div>
              <div className="panel"><h2>Veteran notes</h2><p className="note">Fictional training fixture</p>
                {app && <Highlighted text={app.fixtures.veteran} quotes={vetQuotes} />}</div>
            </div>
            <div className="row" style={{ marginBottom: 16 }}>
              <button className="primary" onClick={findGaps} disabled={busy === "compare" || !app}>{busy === "compare" ? "Finding gaps..." : "Find gaps"}</button>
            </div>
            {cmp && <Banner meta={cmp} />}
            {findings.map((f) => {
              const ok = f.instruction_quote_verified && f.veteran_quote_verified;
              const mark = (v: boolean) => <span className={`chip ${v ? "ok" : "bad"}`}>{v ? "verified in source" : "quote not found in source"}</span>;
              return (
                <div key={f.id} className={`panel finding ${ok ? "" : "unverified"}`}>
                  <h3><span className="badge">{f.type}</span>{f.topic}</h3>
                  <p className="note">Instruction {f.instruction_step}</p>
                  <blockquote>{f.instruction_quote}</blockquote>{f.instruction_step !== "none" && mark(f.instruction_quote_verified)}
                  <p className="note" style={{ marginTop: 8 }}>Veteran</p>
                  <blockquote>{f.veteran_quote}</blockquote>{mark(f.veteran_quote_verified)}
                  <p style={{ marginTop: 8 }}><b>Why it matters:</b> {f.why_it_matters}</p>
                  <p><b>Follow-up:</b> {f.follow_up_question}</p>
                  {ok ? (
                    <>
                      <label className="f" htmlFor={`a-${f.id}`}>Expert answer</label>
                      <textarea id={`a-${f.id}`} rows={3} value={answers[f.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })} />
                      <div className="row"><button className="primary" onClick={() => draft(f.id)} disabled={!!busy}>{busy === "draft-" + f.id ? "Drafting..." : "Draft guide card"}</button></div>
                    </>
                  ) : <p className="err">Unverified. This finding cannot become a card.</p>}
                </div>
              );
            })}
            {cmp && cmp.confirmed_matches.length > 0 && (
              <div className="panel"><h3>Confirmed matches</h3><ul>{cmp.confirmed_matches.map((m, i) => <li key={i}>{m}</li>)}</ul></div>
            )}
          </section>
        )}

        {tab === 2 && (
          <section>
            <h2>Review guide cards</h2>
            {cards.length === 0 && <div className="panel"><p>No cards yet. Find gaps, then draft a guide card from a verified finding.</p><button onClick={() => setTab(1)}>Go to Compare</button></div>}
            {cards.some((c) => c.source_quotes.length) && app && <p className="note">Card drafts: {app.offline ? "Sample output (offline), not a live model call." : `Granite on watsonx.ai · ${app.model}`}</p>}
            {cards.map((c) => <CardEditor key={c.id} card={c} role={role} onChange={load} onError={setError} />)}
          </section>
        )}

        {tab === 3 && (
          <section>
            <h2>Ask about WI-114</h2>
            <div className="panel">
              <p className="note">Answers come only from approved guide cards.</p>
              <div className="quick">{QUICK.map((q) => <button key={q} onClick={() => { setQuestion(q); doAsk(q); }} disabled={busy === "ask"}>{q}</button>)}</div>
              <label className="f" htmlFor="q">Your question</label>
              <textarea id="q" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
              <div className="row"><button className="primary" onClick={() => doAsk(question)} disabled={busy === "ask" || !question.trim()}>{busy === "ask" ? "Asking..." : "Ask question"}</button></div>
            </div>
            {ask && (
              <div className={`panel ${ask.in_scope ? "answer-ok" : "answer-out"}`}>
                <Banner meta={ask} />
                {ask.in_scope ? <h3>Answer from approved guidance</h3> : <h3>{ask.no_guidance ? "No approved guidance yet" : "Out of scope"}</h3>}
                <p>{ask.answer}</p>
                {ask.cited_cards.map((c) => <p key={c.id}><b>Card:</b> {c.title} <span className={`status ${c.status}`}>{c.status.replace("_", " ")}</span></p>)}
                {ask.cited_quotes.length > 0 && <><p><b>Veteran's words</b></p>{ask.cited_quotes.map((q, i) => <blockquote key={i}>{q}</blockquote>)}</>}
                {ask.missing_information.length > 0 && <><p><b>Missing information</b></p><ul>{ask.missing_information.map((m, i) => <li key={i}>{m}</li>)}</ul></>}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
