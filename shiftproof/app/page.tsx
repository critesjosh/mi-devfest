"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Card, CheckedFinding } from "@/lib/schemas";
import { BrandMark } from "./Brand";
import { RobotArm } from "./RobotArm";

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

function Highlighted({ text, quotes, pad }: { text: string; quotes: string[]; pad?: boolean }) {
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
  return <pre className={`sp-quote sp-quote__text sp-src${pad ? " sp-quote--pad" : ""}`}>{out}</pre>;
}

/* Decorative only: a CNC spindle arm. No numbers, no data. Rendered inside .sp-hero__art. */

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
  const dirty = f.title !== card.title || f.scope !== card.scope || f.steps !== lines(card.steps) || f.applies_when !== lines(card.applies_when)
    || f.do_not_apply_when !== lines(card.do_not_apply_when) || f.escalate_if !== lines(card.escalate_if);
  return (
    <article className="sp-panel sp-card" aria-busy={!!busy}>
      <div className="sp-finding__head">
        <span className={tagClass(card.status)}>{card.status.replace("_", " ")}</span>
        <span className="sp-data sp-muted">{card.procedure} {card.procedure_revision}</span>
      </div>
      <div className="sp-card__form">
      <div className="sp-field">
        <label className="sp-field__label" htmlFor={`t-${card.id}`}>Title</label>
        <input className="sp-field__input" id={`t-${card.id}`} type="text" value={f.title} onChange={set("title")} />
      </div>
      <div className="sp-field">
        <label className="sp-field__label" htmlFor={`sc-${card.id}`}>Scope</label>
        <input className="sp-field__input" id={`sc-${card.id}`} type="text" value={f.scope} onChange={set("scope")} />
      </div>
      {([["steps", "Steps (one per line)"], ["applies_when", "Applies when"], ["do_not_apply_when", "Does not apply when"], ["escalate_if", "Escalate if"]] as const).map(([k, label]) => (
        <div className={`sp-field${k === "steps" || k === "escalate_if" ? " sp-card__wide" : ""}`} key={k}>
          <label className="sp-field__label" htmlFor={`${k}-${card.id}`}>{label}</label>
          <textarea className="sp-field__input" id={`${k}-${card.id}`} rows={3} value={f[k]} onChange={set(k)} />
        </div>
      ))}
      </div>
      <div className="sp-field">
        <span className="sp-field__label">Source quotes</span>
        {card.source_quotes.map((q, i) => (
          <div key={i} className={`sp-quote${/veteran/i.test(q.source) ? " sp-quote--pad" : ""}`}>
            <div className="sp-quote__src"><span className="sp-label">{q.source}</span></div>
            <p className="sp-quote__text">{q.text}</p>
          </div>
        ))}
      </div>
      {(card.confirmed_by || card.approved_by) && (
        <div className="sp-row sp-card__sign">
          {card.confirmed_by && <p className="sp-note">Confirmed by {card.confirmed_by}</p>}
          {card.approved_by && <p className="sp-note">Approved by {card.approved_by}</p>}
        </div>
      )}
      <div className="sp-row sp-card__actions">
        <button className="sp-btn" onClick={save} disabled={!!busy}>{busy === "save" ? "Saving..." : "Save edits"}</button>
        <button className={`sp-btn${card.status === "candidate" ? " sp-btn--primary" : ""}`} onClick={() => move("expert_confirmed")} disabled={!!busy || card.status !== "candidate" || role !== "Veteran"}>
          {busy === "expert_confirmed" ? "Confirming..." : "Confirm my account is accurate"}
        </button>
        <button className={`sp-btn${card.status === "expert_confirmed" ? " sp-btn--primary" : ""}`} onClick={() => move("approved")} disabled={!!busy || card.status !== "expert_confirmed" || role !== "Quality lead"}>
          {busy === "approved" ? "Approving..." : "Approve for training"}
        </button>
        {dirty && <span className="sp-note sp-card__dirty" role="status">Edits not saved</span>}
      </div>
      <p className="sp-note">Saving edits sends the card back to candidate. Confirm needs the Veteran role; approve needs the Quality lead role.</p>
    </article>
  );
}

export default function Home() {
  const [app, setApp] = useState<AppState | null>(null);
  const [tab, setTab] = useState(1);
  const [railVertical, setRailVertical] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const sync = () => setRailVertical(mq.matches);
    sync(); mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const [role, setRole] = useState<Role>("Veteran");
  const [cmp, setCmp] = useState<Compare | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState("");
  const [ask, setAsk] = useState<AskRes | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const answerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ask || !answerRef.current) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    answerRef.current.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  }, [ask]);

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

  const titles = ["Find gaps", "Review guide cards", "Ask about WI-114"];
  const ledes = [
    "Granite reads the work instruction against the veteran's notes. The app checks every quote against its source.",
    "The veteran confirms the card says what they meant. Then quality approves it for training.",
    "Ask it the way you would ask your lead.",
  ];
  const verified = findings.filter((f) => f.instruction_quote_verified && f.veteran_quote_verified).length;
  const count = (st: string) => cards.filter((c) => c.status === st).length;
  const segs = [
    { key: "candidate", label: "candidate", n: count("candidate") },
    { key: "expert_confirmed", label: "expert confirmed", n: count("expert_confirmed") },
    { key: "approved", label: "approved", n: count("approved") },
  ];

  return (
    <div className="sp-app">
      <aside className="sp-rail">
        <div className="sp-rail__brand" aria-hidden="true">
          <BrandMark size={32} tone="on-granite" />
        </div>
        <nav className="sp-tabs" role="tablist" aria-label="Steps" aria-orientation={railVertical ? "vertical" : "horizontal"}>
          {([["Compare", 1], ["Review", 2], ["Ask", 3]] as const).map(([l, n]) => (
            <button key={n} id={`sp-tab-${n}`} className="sp-tabs__tab" role="tab" aria-selected={tab === n} aria-controls={`sp-step-${n}`} tabIndex={tab === n ? 0 : -1}
              onClick={() => setTab(n)}
              onKeyDown={(e) => {
                const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? (n % 3) + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? ((n + 1) % 3) + 1 : e.key === "Home" ? 1 : e.key === "End" ? 3 : 0;
                if (!next) return;
                e.preventDefault(); setTab(next); document.getElementById(`sp-tab-${next}`)?.focus();
              }}>
              <span className="sp-data">{n}</span>
              <span className="sp-label">{l}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="sp-shell">
        <header className="sp-top">
          <p className="sp-top__doc"><span className="sp-top__name"><BrandMark size={20} />ShiftProof</span><span className="sp-data">WI-114 Rev C</span></p>
          <div className="sp-header__controls">
            <label className="sp-role" htmlFor="role">
              <span className="sp-role__label">Role</span>
              <select className="sp-field__input sp-header__select" id="role" value={role} onChange={(e) => pickRole(e.target.value as Role)}>
                <option>Veteran</option><option>Quality lead</option><option>Apprentice</option>
              </select>
            </label>
            <button className="sp-btn" onClick={reset} disabled={busy === "reset"}>{busy === "reset" ? "Resetting..." : "Reset demo"}</button>
            <span className="sp-note sp-header__note">Demo roles, not real sign-in</span>
          </div>
        </header>

        <div className="sp-hero">
          <div className="sp-hero__titles">
            <h1 className="sp-header__title">{titles[tab - 1]}</h1>
            <p className="sp-hero__lede">{ledes[tab - 1]}</p>
            {tab === 1 && <button className="sp-btn sp-btn--primary" onClick={findGaps} disabled={busy === "compare" || !app}>{busy === "compare" ? "Finding gaps..." : "Find gaps"}</button>}
          </div>
          {/* Illustration slot: about 300px wide (--hero-art). Whatever goes here stands on the sheet's top edge. */}
          <div className="sp-hero__art"><RobotArm working={busy === "compare" || busy === "ask" || busy.startsWith("draft-")} /></div>
        </div>

        <section className="sp-sheet" aria-label="Overview">
          <div className="sp-sheet__cell">
            <div className="sp-sheet__cap"><span>Gaps found</span></div>
            <div className="sp-figure__row">
              <span className="sp-figure">{cmp ? findings.length : "–"}</span>
              {findings.length > 0 && (
                <span className="sp-ticks" aria-hidden="true">
                  {findings.map((f) => {
                    const ok = f.instruction_quote_verified && f.veteran_quote_verified;
                    return <span key={f.id} className={`sp-tick${ok ? "" : " sp-tick--bad"}`}>{ok ? "✓" : "×"}</span>;
                  })}
                </span>
              )}
            </div>
            <p className="sp-note">{cmp ? `${verified} of ${findings.length} verified in source` : "Nothing compared yet. Find gaps to start."}</p>
          </div>

          <div className="sp-sheet__cell">
            <div className="sp-sheet__cap">
              <span>Guide cards</span>
              <span className="sp-tally">{segs.map((g) => <span key={g.key}><b>{g.n}</b> {g.label}</span>)}</span>
            </div>
            <ul className="sp-rack">
              {cards.length === 0 && <li className="sp-note sp-rack__empty">No cards yet.</li>}
              {cards.map((c) => (
                <li key={c.id} className={`sp-hang${c.status === "approved" ? " sp-hang--accept" : c.status === "expert_confirmed" ? " sp-hang--hold" : ""}`}>
                  <span className="sp-label">{c.status.replace("_", " ")}</span>
                  <span className="sp-hang__title">{c.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sp-sheet__cell sp-sheet__cell--source">
            <div className="sp-sheet__cap"><span>Model</span><span>IBM watsonx.ai</span></div>
            {app && (app.offline ? (
              <div className="sp-banner">
                <span className="sp-banner__stripes" />
                <span className="sp-banner__text">Sample output (offline), not a live model call.</span>
              </div>
            ) : <div className="sp-source sp-data">Granite on watsonx.ai · {app.model}</div>)}
            <p className="sp-note">Answers come only from approved guide cards.</p>
          </div>
        </section>

      <main className="sp-main">
        {error && (
          <div className="sp-banner sp-banner--fail" role="alert">
            <span className="sp-banner__stripes" />
            <span className="sp-banner__text">{error}</span>
          </div>
        )}

        {tab === 1 && (
          <section className="sp-stack sp-step" key="s1" id="sp-step-1" role="tabpanel" aria-labelledby="sp-tab-1">
            <div className="sp-grid2">
              <div className="sp-panel">
                <div className="sp-doc__head"><h2 className="sp-heading">Work instruction WI-114 Rev C</h2><p className="sp-note">Fictional training fixture</p></div>
                {app && <Highlighted text={app.fixtures.instruction} quotes={insQuotes} />}
              </div>
              <div className="sp-panel">
                <div className="sp-doc__head"><h2 className="sp-heading">Veteran notes</h2><p className="sp-note">Fictional training fixture</p></div>
                {app && <Highlighted text={app.fixtures.veteran} quotes={vetQuotes} pad />}
              </div>
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
                    <div className="sp-quote sp-quote--pad">
                      <div className="sp-quote__src">
                        <span className="sp-label">Veteran</span>
                        {mark(f.veteran_quote_verified)}
                      </div>
                      <p className="sp-quote__text">{f.veteran_quote}</p>
                    </div>
                  </div>
                  <dl className="sp-facts">
                    <dt>Why it matters</dt><dd>{f.why_it_matters}</dd>
                    <dt>Follow-up</dt><dd>{f.follow_up_question}</dd>
                  </dl>
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
          <section className="sp-stack sp-step" key="s2" id="sp-step-2" role="tabpanel" aria-labelledby="sp-tab-2">
            {cards.length === 0 && (
              <div className="sp-panel">
                <p className="sp-field-line">No cards yet. Find gaps, then draft a guide card from a verified finding.</p>
                <div className="sp-row"><button className="sp-btn sp-btn--primary" onClick={() => setTab(1)}>Go to Compare</button></div>
              </div>
            )}
            {cards.some((c) => c.source_quotes.length) && app && (
              <p className="sp-note">Card drafts: {app.offline ? "Sample output (offline), not a live model call." : `Granite on watsonx.ai · ${app.model}`}</p>
            )}
            {cards.map((c) => <CardEditor key={c.id} card={c} role={role} onChange={load} onError={setError} />)}
          </section>
        )}

        {tab === 3 && (
          <section className="sp-stack sp-step" key="s3" id="sp-step-3" role="tabpanel" aria-labelledby="sp-tab-3">
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
                <section ref={answerRef} key={`${ask.in_scope}-${ask.answer}`} className={`sp-answer ${ask.in_scope ? "" : "sp-answer--out"}`} aria-live="polite" aria-busy={busy === "ask"}>
                  <div className="sp-answer__head sp-label">
                    {ask.in_scope ? "Answer from approved guidance" : ask.no_guidance ? "No approved guidance yet" : "Out of scope"}
                  </div>
                  <div className="sp-answer__body">
                    <p className="sp-answer__lead">{ask.answer}</p>
                    {ask.cited_cards.map((c) => (
                      <p key={c.id} className="sp-answer__card">
                        <b>Card:</b> {c.title} <span className={tagClass(c.status)}>{c.status.replace("_", " ")}</span>
                      </p>
                    ))}
                    {ask.cited_quotes.length > 0 && (
                      <>
                        <p className="sp-field-line"><b>Veteran's words</b></p>
                        {ask.cited_quotes.map((q, i) => (
                          <div key={i} className="sp-quote sp-quote--pad">
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
      </div>
    </div>
  );
}
