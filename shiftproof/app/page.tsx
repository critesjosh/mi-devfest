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

const tagClass = (s: string) =>
  `sp-tag sp-label${s === "approved" ? " sp-tag--accept" : s === "expert_confirmed" ? " sp-tag--hold" : ""}`;

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
        {meta.error && (
          <div className="sp-banner sp-banner--fail" role="alert">
            <span className="sp-banner__stripes" />
            <span className="sp-banner__text">watsonx.ai call failed: {meta.error} Showing sample output.</span>
          </div>
        )}
        <div className="sp-banner">
          <span className="sp-banner__stripes" />
          <span className="sp-banner__text">Sample output (offline), not a live model call.</span>
        </div>
      </>
    );
  if (meta.source === "live") return <div className="sp-source sp-data">Granite on watsonx.ai · {meta.model}</div>;
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
  return <pre className="sp-quote sp-quote__text sp-src">{out}</pre>;
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
    <article className="sp-panel">
      <div className="sp-finding__head">
        <span className={tagClass(card.status)}>{card.status.replace("_", " ")}</span>
        <span className="sp-data sp-muted">{card.procedure} {card.procedure_revision}</span>
      </div>
      <div className="sp-field">
        <label className="sp-field__label" htmlFor={`t-${card.id}`}>Title</label>
        <input className="sp-field__input" id={`t-${card.id}`} type="text" value={f.title} onChange={set("title")} />
      </div>
      <div className="sp-field">
        <label className="sp-field__label" htmlFor={`sc-${card.id}`}>Scope</label>
        <input className="sp-field__input" id={`sc-${card.id}`} type="text" value={f.scope} onChange={set("scope")} />
      </div>
      {([["steps", "Steps (one per line)"], ["applies_when", "Applies when"], ["do_not_apply_when", "Does not apply when"], ["escalate_if", "Escalate if"]] as const).map(([k, label]) => (
        <div className="sp-field" key={k}>
          <label className="sp-field__label" htmlFor={`${k}-${card.id}`}>{label}</label>
          <textarea className="sp-field__input" id={`${k}-${card.id}`} rows={3} value={f[k]} onChange={set(k)} />
        </div>
      ))}
      <div className="sp-field">
        <span className="sp-field__label">Source quotes</span>
        {card.source_quotes.map((q, i) => (
          <div key={i} className="sp-quote">
            <div className="sp-quote__src"><span className="sp-label">{q.source}</span></div>
            <p className="sp-quote__text">{q.text}</p>
          </div>
        ))}
      </div>
      {card.confirmed_by && <p className="sp-note">Confirmed by {card.confirmed_by}</p>}
      {card.approved_by && <p className="sp-note">Approved by {card.approved_by}</p>}
      <div className="sp-row">
        <button className="sp-btn" onClick={save} disabled={!!busy}>{busy === "save" ? "Saving..." : "Save edits"}</button>
        <button className={`sp-btn${card.status === "candidate" ? " sp-btn--primary" : ""}`} onClick={() => move("expert_confirmed")} disabled={!!busy || card.status !== "candidate" || role !== "Veteran"}>
          {busy === "expert_confirmed" ? "Confirming..." : "Confirm my account is accurate"}
        </button>
        <button className={`sp-btn${card.status === "expert_confirmed" ? " sp-btn--primary" : ""}`} onClick={() => move("approved")} disabled={!!busy || card.status !== "expert_confirmed" || role !== "Quality lead"}>
          {busy === "approved" ? "Approving..." : "Approve for training"}
        </button>
      </div>
      <p className="sp-note">Saving edits sends the card back to candidate. Confirm needs the Veteran role; approve needs the Quality lead role.</p>
    </article>
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
      <header className="sp-header">
        <h1 className="sp-header__title">ShiftProof</h1>
        <div className="sp-header__controls">
          <label className="sp-label" htmlFor="role">Role</label>
          <select className="sp-field__input sp-header__select" id="role" value={role} onChange={(e) => pickRole(e.target.value as Role)}>
            <option>Veteran</option><option>Quality lead</option><option>Apprentice</option>
          </select>
          <button className="sp-btn sp-btn--on-granite" onClick={reset} disabled={busy === "reset"}>{busy === "reset" ? "Resetting..." : "Reset demo"}</button>
          <span className="sp-note sp-header__note">Demo roles, not real sign-in</span>
        </div>
      </header>
      <main className="sp-main">
        <nav className="sp-tabs" role="tablist">
          {([["Compare", 1], ["Review", 2], ["Ask", 3]] as const).map(([l, n]) => (
            <button key={n} className="sp-tabs__tab" role="tab" aria-selected={tab === n} onClick={() => setTab(n)}>
              <span className="sp-data">{n}</span>
              <span className="sp-label">{l}</span>
            </button>
          ))}
        </nav>
        {error && (
          <div className="sp-banner sp-banner--fail" role="alert">
            <span className="sp-banner__stripes" />
            <span className="sp-banner__text">{error}</span>
          </div>
        )}

        {tab === 1 && (
          <section className="sp-stack">
            <div className="sp-grid2">
              <div className="sp-panel">
                <h2 className="sp-heading">Work instruction WI-114 Rev C</h2>
                <p className="sp-note">Fictional training fixture</p>
                {app && <Highlighted text={app.fixtures.instruction} quotes={insQuotes} />}
              </div>
              <div className="sp-panel">
                <h2 className="sp-heading">Veteran notes</h2>
                <p className="sp-note">Fictional training fixture</p>
                {app && <Highlighted text={app.fixtures.veteran} quotes={vetQuotes} />}
              </div>
            </div>
            <div className="sp-row">
              <button className="sp-btn sp-btn--primary" onClick={findGaps} disabled={busy === "compare" || !app}>{busy === "compare" ? "Finding gaps..." : "Find gaps"}</button>
            </div>
            {cmp && <Banner meta={cmp} />}
            {findings.map((f) => {
              const ok = f.instruction_quote_verified && f.veteran_quote_verified;
              const mark = (v: boolean) => (
                <span className={`sp-stamp ${v ? "sp-stamp--ok" : "sp-stamp--bad"} sp-label`}>
                  {v ? "✓ verified in source" : "× quote not found in source"}
                </span>
              );
              return (
                <article key={f.id} className={`sp-panel sp-finding ${ok ? "" : "sp-finding--unverified"}`}>
                  <div className="sp-finding__head">
                    <span className="sp-type sp-label">{f.type}</span>
                    <span className="sp-data sp-muted">{f.instruction_step}</span>
                  </div>
                  <h3>{f.topic}</h3>
                  <div className="sp-finding__quotes">
                    <div className="sp-quote">
                      <div className="sp-quote__src">
                        <span className="sp-label">Instruction {f.instruction_step}</span>
                        {f.instruction_step !== "none" && mark(f.instruction_quote_verified)}
                      </div>
                      <p className="sp-quote__text">{f.instruction_quote}</p>
                    </div>
                    <div className="sp-quote">
                      <div className="sp-quote__src">
                        <span className="sp-label">Veteran</span>
                        {mark(f.veteran_quote_verified)}
                      </div>
                      <p className="sp-quote__text">{f.veteran_quote}</p>
                    </div>
                  </div>
                  <p className="sp-field-line"><b>Why it matters:</b> {f.why_it_matters}</p>
                  <p className="sp-field-line"><b>Follow-up:</b> {f.follow_up_question}</p>
                  {ok ? (
                    <>
                      <div className="sp-field">
                        <label className="sp-field__label" htmlFor={`a-${f.id}`}>Expert answer</label>
                        <textarea className="sp-field__input" id={`a-${f.id}`} rows={3} value={answers[f.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })} />
                      </div>
                      <div className="sp-row"><button className="sp-btn sp-btn--primary" onClick={() => draft(f.id)} disabled={!!busy}>{busy === "draft-" + f.id ? "Drafting..." : "Draft guide card"}</button></div>
                    </>
                  ) : <p className="sp-err">Unverified. This finding cannot become a card.</p>}
                </article>
              );
            })}
            {cmp && cmp.confirmed_matches.length > 0 && (
              <div className="sp-panel"><h3>Confirmed matches</h3><ul className="sp-list">{cmp.confirmed_matches.map((m, i) => <li key={i}>{m}</li>)}</ul></div>
            )}
          </section>
        )}

        {tab === 2 && (
          <section className="sp-stack">
            <h2 className="sp-title">Review guide cards</h2>
            {cards.length === 0 && (
              <div className="sp-panel">
                <p className="sp-field-line">No cards yet. Find gaps, then draft a guide card from a verified finding.</p>
                <div className="sp-row"><button className="sp-btn sp-btn--primary" onClick={() => setTab(1)}>Go to Compare</button></div>
              </div>
            )}
            {cards.some((c) => c.source_quotes.length) && app && (
              <Banner meta={{ source: app.offline ? "sample" : "live", model: app.model }} />
            )}
            {cards.map((c) => <CardEditor key={c.id} card={c} role={role} onChange={load} onError={setError} />)}
          </section>
        )}

        {tab === 3 && (
          <section className="sp-stack">
            <h2 className="sp-title">Ask about WI-114</h2>
            <div className="sp-panel">
              <p className="sp-note">Answers come only from approved guide cards.</p>
              <div className="sp-quick">{QUICK.map((q) => <button key={q} className="sp-btn sp-quick__btn" onClick={() => { setQuestion(q); doAsk(q); }} disabled={busy === "ask"}>{q}</button>)}</div>
              <div className="sp-field">
                <label className="sp-field__label" htmlFor="q">Your question</label>
                <textarea className="sp-field__input" id="q" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>
              <div className="sp-row"><button className="sp-btn sp-btn--primary" onClick={() => doAsk(question)} disabled={busy === "ask" || !question.trim()}>{busy === "ask" ? "Asking..." : "Ask question"}</button></div>
            </div>
            {ask && (
              <>
                <Banner meta={ask} />
                <section className={`sp-answer ${ask.in_scope ? "" : "sp-answer--out"}`}>
                  <div className="sp-answer__head sp-label">
                    {ask.in_scope ? "Answer from approved guidance" : ask.no_guidance ? "No approved guidance yet" : "Out of scope"}
                  </div>
                  <div className="sp-answer__body">
                    <p>{ask.answer}</p>
                    {ask.cited_cards.map((c) => (
                      <p key={c.id} className="sp-answer__card">
                        <b>Card:</b> {c.title} <span className={tagClass(c.status)}>{c.status.replace("_", " ")}</span>
                      </p>
                    ))}
                    {ask.cited_quotes.length > 0 && (
                      <>
                        <p className="sp-field-line"><b>Veteran's words</b></p>
                        {ask.cited_quotes.map((q, i) => (
                          <div key={i} className="sp-quote">
                            <div className="sp-quote__src"><span className="sp-label">Veteran</span></div>
                            <p className="sp-quote__text">{q}</p>
                          </div>
                        ))}
                      </>
                    )}
                    {ask.missing_information.length > 0 && (
                      <>
                        <p className="sp-field-line"><b>Missing information</b></p>
                        <ul className="sp-list">{ask.missing_information.map((m, i) => <li key={i}>{m}</li>)}</ul>
                      </>
                    )}
                  </div>
                </section>
              </>
            )}
          </section>
        )}
      </main>
    </>
  );
}
