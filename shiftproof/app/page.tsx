"use client";

import { useCallback, useEffect, useState } from "react";
import type { Card, CheckedFinding } from "@/lib/schemas";

type Role = "Veteran" | "Quality lead" | "Apprentice";
type Meta = { source?: "live" | "sample" | "none"; model?: string; error?: string };
type Compare = { findings: CheckedFinding[]; confirmed_matches: string[] } & Meta;
type AskRes = {
  in_scope: boolean;
  no_guidance: boolean;
  answer: string;
  missing_information: string[];
  cited_cards: { id: string; title: string; status: string }[];
  cited_quotes: string[];
} & Meta;
type AppState = {
  fixtures: { instruction: string; veteran: string };
  state: {
    compare: { findings: CheckedFinding[]; confirmed_matches: string[]; offline: boolean } | null;
    cards: Card[];
  };
  offline: boolean;
  model: string;
};

type MachineItem = {
  id: string;
  name: string;
  bay: string;
  sub: string;
  manual: string;
  prompt: string;
  badgeText: string;
  badgeTone: "amber" | "emerald";
};

const INITIAL_MACHINES: MachineItem[] = [
  {
    id: "haas-vf2",
    name: "Haas VF-2SS Vertical Mill",
    bay: "BAY A-1",
    sub: "Bay A-1 • Milling • Part #WI-114 Rev C",
    manual: "WI-114_Rev_C.md",
    prompt:
      "How long do you let the first bracket cool on the granite plate before checking the 4.000 in length?",
    badgeText: "Selected",
    badgeTone: "amber",
  },
  {
    id: "mazak-qt250",
    name: "Mazak Quick Turn 250",
    bay: "BAY A-2",
    sub: "Bay A-2 • Turning • Part #8821-B",
    manual: "QT250_SOP_v3.pdf",
    prompt: "How do you prevent chatter on the thin-wall aluminum sleeve (Part #8821-B)?",
    badgeText: "92% Ready",
    badgeTone: "emerald",
  },
  {
    id: "bridgeport-s1",
    name: "Bridgeport Series I Knee Mill",
    bay: "BAY B-1",
    sub: "Bay B-1 • Manual • 4 Guides",
    manual: "BP_Series1_SOP.pdf",
    prompt: "What do you listen for when shifting from back-gear to high range?",
    badgeText: "100% Ready",
    badgeTone: "emerald",
  },
  {
    id: "okuma-l300",
    name: "Okuma Genos L300",
    bay: "BAY C-1",
    sub: "Bay C-1 • Lathe • 1 Guide",
    manual: "Okuma_L300_Setup.pdf",
    prompt: "What indicator reading do you verify on soft-jaw truing before first piece?",
    badgeText: "Needs Walkthrough",
    badgeTone: "amber",
  },
];

const QUICK = [
  "My first bracket measured 0.002 over on the pocket. Should I bump the wear offset?",
  "What spindle speed should I run for the roughing pass?",
];

const BAR_HEIGHTS: [string, string, boolean][] = [
  ["52%", "38%", false],
  ["68%", "62%", false],
  ["88%", "86%", true],
  ["60%", "78%", false],
  ["42%", "32%", false],
  ["58%", "52%", false],
];

async function api<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

function Banner({ meta }: { meta: Meta }) {
  if (meta.source === "sample")
    return (
      <>
        {meta.error && (
          <div className="banner fail">
            watsonx.ai call failed: {meta.error} Showing sample output.
          </div>
        )}
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
const unlines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

function CardEditor({
  card,
  role,
  onChange,
  onError,
}: {
  card: Card;
  role: Role;
  onChange: () => void;
  onError: (m: string) => void;
}) {
  const [f, setF] = useState({
    title: card.title,
    scope: card.scope,
    steps: lines(card.steps),
    applies_when: lines(card.applies_when),
    do_not_apply_when: lines(card.do_not_apply_when),
    escalate_if: lines(card.escalate_if),
  });
  const [busy, setBusy] = useState("");
  useEffect(() => {
    setF({
      title: card.title,
      scope: card.scope,
      steps: lines(card.steps),
      applies_when: lines(card.applies_when),
      do_not_apply_when: lines(card.do_not_apply_when),
      escalate_if: lines(card.escalate_if),
    });
  }, [card]);
  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setF({ ...f, [k]: e.target.value });
  const run = async (name: string, fn: () => Promise<unknown>) => {
    setBusy(name);
    try {
      await fn();
      onChange();
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
    setBusy("");
  };
  const save = () =>
    run("save", () =>
      api(`/api/cards/${card.id}`, "PUT", {
        edits: {
          title: f.title,
          scope: f.scope,
          steps: unlines(f.steps),
          applies_when: unlines(f.applies_when),
          do_not_apply_when: unlines(f.do_not_apply_when),
          escalate_if: unlines(f.escalate_if),
        },
      })
    );
  const move = (to: string) => run(to, () => api(`/api/cards/${card.id}/status`, "POST", { to }));
  return (
    <div className="panel">
      <p>
        <span className={`status ${card.status}`}>{card.status.replace("_", " ")}</span>{" "}
        <span className="note">
          {card.procedure} {card.procedure_revision}
        </span>
      </p>
      <label className="f" htmlFor={`t-${card.id}`}>
        Title
      </label>
      <input id={`t-${card.id}`} type="text" value={f.title} onChange={set("title")} />
      <label className="f" htmlFor={`sc-${card.id}`}>
        Scope
      </label>
      <input id={`sc-${card.id}`} type="text" value={f.scope} onChange={set("scope")} />
      {(
        [
          ["steps", "Steps (one per line)"],
          ["applies_when", "Applies when"],
          ["do_not_apply_when", "Does not apply when"],
          ["escalate_if", "Escalate if"],
        ] as const
      ).map(([k, label]) => (
        <div key={k}>
          <label className="f" htmlFor={`${k}-${card.id}`}>
            {label}
          </label>
          <textarea id={`${k}-${card.id}`} rows={3} value={f[k]} onChange={set(k)} />
        </div>
      ))}
      <label className="f">Source quotes</label>
      {card.source_quotes.map((q, i) => (
        <blockquote key={i}>
          <b>{q.source}:</b> {q.text}
        </blockquote>
      ))}
      {card.confirmed_by && <p className="note">Confirmed by {card.confirmed_by}</p>}
      {card.approved_by && <p className="note">Approved by {card.approved_by}</p>}
      <div className="row">
        <button onClick={save} disabled={!!busy}>
          {busy === "save" ? "Saving..." : "Save edits"}
        </button>
        <button
          className="primary"
          onClick={() => move("expert_confirmed")}
          disabled={!!busy || card.status !== "candidate" || role !== "Veteran"}
        >
          {busy === "expert_confirmed" ? "Confirming..." : "Confirm my account is accurate"}
        </button>
        <button
          className="primary"
          onClick={() => move("approved")}
          disabled={!!busy || card.status !== "expert_confirmed" || role !== "Quality lead"}
        >
          {busy === "approved" ? "Approving..." : "Approve for training"}
        </button>
      </div>
      <p className="note note-spaced">
        Saving edits sends the card back to candidate. Confirm needs the Veteran role; approve needs
        the Quality lead role.
      </p>
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
  const [quickInput, setQuickInput] = useState("");
  const [ask, setAsk] = useState<AskRes | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const [machines, setMachines] = useState<MachineItem[]>(INITIAL_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState("haas-vf2");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMachineName, setNewMachineName] = useState("Doosan Puma 2600SY");
  const [newMachineBay, setNewMachineBay] = useState("Bay C-2 • Mill-Turn");
  const [newMachinePrompt, setNewMachinePrompt] = useState(
    "Sub-spindle synchronous handoff setup check"
  );

  const activeMachine = machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const load = useCallback(async () => {
    try {
      const s = await api<AppState>("/api/state");
      setApp(s);
      setCmp((c) =>
        c ??
        (s.state.compare
          ? { ...s.state.compare, source: s.state.compare.offline ? "sample" : "live", model: s.model }
          : null)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const guard = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setBusy("");
  };

  const findGaps = () =>
    guard("compare", async () => {
      setCmp(await api<Compare>("/api/compare", "POST", {}));
      await load();
    });
  const draft = (id: string) =>
    guard("draft-" + id, async () => {
      const r = await api<{ card: Card } & Meta>("/api/cards", "POST", {
        finding_id: id,
        expert_answer: answers[id] || "",
      });
      await load();
      if (r.source === "sample" && r.error)
        setError(`watsonx.ai call failed: ${r.error} Showing sample output.`);
      setTab(2);
    });
  const doAsk = (q: string) =>
    guard("ask", async () => {
      setAsk(await api<AskRes>("/api/ask", "POST", { question: q }));
    });
  const reset = () =>
    guard("reset", async () => {
      await api("/api/reset", "POST", {});
      setCmp(null);
      setAsk(null);
      setAnswers({});
      setQuestion("");
      setTab(1);
      await load();
    });
  const pickRole = (r: Role) => {
    setRole(r);
    setTab(r === "Apprentice" ? 3 : r === "Quality lead" ? 2 : 1);
  };

  const handleAddMachine = () => {
    if (!newMachineName.trim()) return;
    const id = "m-" + Date.now();
    const created: MachineItem = {
      id,
      name: newMachineName.trim(),
      bay: "BAY C-2",
      sub: `${newMachineBay} • Custom SOP`,
      manual: "Uploaded_SOP_v1.pdf",
      prompt: newMachinePrompt.trim() || "What unwritten checks are needed on first-piece setup?",
      badgeText: "Needs Walkthrough",
      badgeTone: "amber",
    };
    setMachines((prev) => [created, ...prev]);
    setSelectedMachineId(id);
    setShowAddModal(false);
    setTab(1);
  };

  const jumpToWorkspace = (targetTab: number) => {
    setTab(targetTab);
    const el = document.getElementById("workspace-anchor");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const cards = app?.state.cards ?? [];
  const findings = cmp?.findings ?? [];
  const vetQuotes = findings.map((f) => f.veteran_quote);
  const insQuotes = findings.map((f) => f.instruction_quote);

  return (
    <div className="kiosk-frame">
      {/* LEFT OBSIDIAN SIDEBAR: SYNCHRO BRAND MARK + MACHINE SELECTOR + SHOP OWNER CTA */}
      <aside className="kiosk-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand-row">
              <div className="synchro-star-badge" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <defs>
                    <linearGradient
                      id="synchroStarGrad"
                      x1="0"
                      y1="0"
                      x2="28"
                      y2="28"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="var(--synchro-orange)" />
                      <stop offset="100%" stopColor="var(--synchro-indigo)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M14 2C14.9 8.8 19.2 13.1 26 14C19.2 14.9 14.9 19.2 14 26C13.1 19.2 8.8 14.9 2 14C8.8 13.1 13.1 8.8 14 2Z"
                    stroke="url(#synchroStarGrad)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <span className="eyebrow">Step 1 • Equipment</span>
                <h2>Select or Add Machine</h2>
              </div>
            </div>
            <button type="button" className="btn-sky" onClick={() => setShowAddModal(true)}>
              + New Machine
            </button>
          </div>

          <div className="machine-list">
            {machines.map((m) => {
              const isSelected = m.id === activeMachine.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`machine-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedMachineId(m.id)}
                >
                  <div className="machine-item-top">
                    <span className="machine-item-name">{m.name}</span>
                    <span className={`machine-badge ${isSelected ? "amber" : m.badgeTone}`}>
                      {isSelected ? "Selected" : m.badgeText}
                    </span>
                  </div>
                  <p className="machine-item-sub">{m.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SHOP OWNER QUICK UPLOAD BOX AT BOTTOM OF SIDEBAR */}
        <div className="owner-box">
          <div className="owner-box-title">
            <span>🏭 Shop Owner Controls</span>
          </div>
          <p>
            Need to add a new machine or upload an updated work instruction PDF for gap-checking?
          </p>
          <button type="button" className="btn-owner-outline" onClick={() => setShowAddModal(true)}>
            + Add Machine / Upload Manual
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN SYNCHRO HUB STAGE */}
      <div className="kiosk-main">
        <div>
          {/* SELECTED MACHINE BANNER */}
          <header className="stage-header">
            <div>
              <div className="stage-eyebrow">ACTIVE MACHINE WORKSPACE • {activeMachine.bay}</div>
              <h1>{activeMachine.name}</h1>
            </div>

            <div className="stage-controls">
              <span className="manual-pill">
                Manual: <strong className="manual-link">{activeMachine.manual}</strong>
              </span>

              <div className="role-switcher">
                <label htmlFor="role">Role:</label>
                <select id="role" value={role} onChange={(e) => pickRole(e.target.value as Role)}>
                  <option>Veteran</option>
                  <option>Quality lead</option>
                  <option>Apprentice</option>
                </select>
              </div>

              <button onClick={reset} disabled={busy === "reset"}>
                {busy === "reset" ? "Resetting..." : "Reset demo"}
              </button>
            </div>
          </header>

          {/* SYNCHRO DRIBBBLE VISUAL STAGE: CNC ARM + DIVERGING CAPSULE BARS */}
          <div className="synchro-visual-strip" aria-hidden="true">
            <div className="synchro-twin-canvas">
              <svg viewBox="0 0 560 220" className="synchro-twin-svg" fill="none">
                <defs>
                  <linearGradient
                    id="synchroArmBody"
                    x1="150"
                    y1="20"
                    x2="360"
                    y2="210"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="var(--surface)" />
                    <stop offset="60%" stopColor="var(--line)" />
                    <stop offset="100%" stopColor="var(--line-strong)" />
                  </linearGradient>
                  <linearGradient id="synchroDarkJoint" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--synchro-obsidian-elevated)" />
                    <stop offset="100%" stopColor="var(--synchro-obsidian)" />
                  </linearGradient>
                </defs>
                <path
                  d="M180 210 L212 122 L270 136 L242 210 Z"
                  fill="url(#synchroArmBody)"
                  stroke="var(--line-strong)"
                />
                <rect
                  x="150"
                  y="62"
                  width="155"
                  height="74"
                  rx="37"
                  transform="rotate(-16 150 62)"
                  fill="url(#synchroArmBody)"
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
                <circle
                  cx="190"
                  cy="118"
                  r="30"
                  fill="url(#synchroDarkJoint)"
                  stroke="var(--synchro-orange)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="190"
                  cy="118"
                  r="18"
                  fill="var(--synchro-obsidian)"
                  stroke="var(--muted)"
                  strokeWidth="1"
                />
                <rect
                  x="228"
                  y="42"
                  width="120"
                  height="52"
                  rx="26"
                  transform="rotate(-8 228 42)"
                  fill="url(#synchroArmBody)"
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
                <rect
                  x="318"
                  y="36"
                  width="32"
                  height="44"
                  rx="8"
                  transform="rotate(-8 318 36)"
                  fill="url(#synchroDarkJoint)"
                />
                <path d="M346 42 L392 18 L404 28 L364 52 Z" fill="url(#synchroDarkJoint)" />
                <path d="M348 64 L398 72 L394 86 L344 76 Z" fill="url(#synchroDarkJoint)" />
                <rect
                  x="360"
                  y="40"
                  width="14"
                  height="18"
                  rx="4"
                  transform="rotate(-8 360 40)"
                  fill="var(--synchro-orange)"
                />
                <polyline
                  points="95,42 276,42 276,68"
                  stroke="var(--line-strong)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="276"
                  cy="68"
                  r="4"
                  fill="var(--surface)"
                  stroke="var(--synchro-orange)"
                  strokeWidth="2"
                />
                <polyline
                  points="388,26 455,26 455,75"
                  stroke="var(--line-strong)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="388"
                  cy="26"
                  r="4"
                  fill="var(--surface)"
                  stroke="var(--synchro-indigo)"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="synchro-bars-card">
              <div className="synchro-bars-grid">
                {BAR_HEIGHTS.map(([topH, botH, isActive], idx) => (
                  <div key={idx} className="synchro-bar-col">
                    <div className="synchro-bar-top">
                      <div
                        className={`bar-capsule-purple ${isActive ? "active" : ""}`}
                        style={{ height: topH }}
                      />
                    </div>
                    <div className="synchro-bar-bottom">
                      <div
                        className={`bar-capsule-orange ${isActive ? "active" : ""}`}
                        style={{ height: botH }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DUAL MODE CARDS INSIDE THE SYNCHRO HUB */}
          <div className="dual-mode-grid">
            {/* LEFT PANEL: GIVE DATA (VETERAN MODE) */}
            <div className={`mode-card veteran ${tab === 1 || tab === 2 ? "active-mode" : ""}`}>
              <div>
                <span className="mode-tag veteran">🛠️ Give Data (Veteran Mode)</span>
                <h3>Talk Through a Setup or Fix</h3>
                <p>
                  Compare your floor walkthrough against <em>{activeMachine.manual}</em>. Granite
                  flags unwritten steps and asks 2–3 follow-ups so you can confirm a guide card.
                </p>

                <div className="prompt-preview-box">
                  <div className="prompt-preview-title">🎙️ Suggested Topic from Owner:</div>
                  <p className="prompt-preview-text">&ldquo;{activeMachine.prompt}&rdquo;</p>
                </div>
              </div>

              <button
                type="button"
                className="btn-veteran-full"
                onClick={() => {
                  jumpToWorkspace(1);
                  if (!cmp) findGaps();
                }}
                disabled={busy === "compare"}
              >
                <span>
                  🎙️{" "}
                  {busy === "compare"
                    ? "Comparing SOP & Notes..."
                    : "Start Walkthrough & Find Gaps"}
                </span>
              </button>
            </div>

            {/* RIGHT PANEL: REVIEW DATA (APPRENTICE / FLOOR MODE) */}
            <div className={`mode-card apprentice ${tab === 3 ? "active-mode" : ""}`}>
              <div>
                <span className="mode-tag apprentice">👷 Review Data (Floor Mode)</span>
                <h3>Guides, Secret Steps &amp; Q&amp;A</h3>
                <p>
                  Read step-by-step instructions combining the manual with signed-off veteran
                  adjustments, or ask a troubleshooting question.
                </p>

                <div className="mini-guide-list">
                  <div className="mini-guide-item" onClick={() => jumpToWorkspace(3)}>
                    <div>
                      <strong className="mini-guide-title">
                        1. First-Article Thermal Cool-Down (WI-114)
                      </strong>
                      <div className="mini-guide-sub">
                        Warm 4 in aluminum part reads +0.002 in long
                      </div>
                    </div>
                    <span className="mini-guide-cta">Ask →</span>
                  </div>

                  <div className="mini-guide-item" onClick={() => jumpToWorkspace(2)}>
                    <div>
                      <strong className="mini-guide-title">
                        2. Hard Stop Seating &amp; Two-Depth Bore Check
                      </strong>
                      <div className="mini-guide-sub">
                        {cards.length > 0
                          ? `${cards.length} guide card(s) in Review queue`
                          : "Includes unwritten 0.001 in feeler shim check"}
                      </div>
                    </div>
                    <span className="mini-guide-cta">View →</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-apprentice-full"
                onClick={() => jumpToWorkspace(3)}
              >
                <span>📖 Open Guides &amp; Ask Question</span>
              </button>
            </div>
          </div>

          {/* ACTIVE 3-STEP SHIFTPROOF WORKSPACE */}
          <main id="workspace-anchor" className="workspace-section">
            <nav className="tabs" role="tablist">
              {[
                ["1 Compare (Give Data)", 1],
                ["2 Review (${cards.length})".replace("${cards.length}", String(cards.length)), 2],
                ["3 Ask (Review Data)", 3],
              ].map(([l, n]) => (
                <button
                  key={n}
                  role="tab"
                  aria-selected={tab === n}
                  onClick={() => setTab(n as number)}
                >
                  {l}
                </button>
              ))}
            </nav>

            {error && (
              <div className="banner fail" role="alert">
                {error}
              </div>
            )}

            {tab === 1 && (
              <section>
                <div className="grid2">
                  <div className="panel panel-flush">
                    <h2>Work instruction WI-114 Rev C</h2>
                    <p className="note">Fictional training fixture</p>
                    {app && <Highlighted text={app.fixtures.instruction} quotes={insQuotes} />}
                  </div>
                  <div className="panel panel-flush">
                    <h2>Veteran notes</h2>
                    <p className="note">Fictional training fixture</p>
                    {app && <Highlighted text={app.fixtures.veteran} quotes={vetQuotes} />}
                  </div>
                </div>

                <div className="row row-spaced-bottom">
                  <button
                    className="primary"
                    onClick={findGaps}
                    disabled={busy === "compare" || !app}
                  >
                    {busy === "compare" ? "Finding gaps..." : "Find gaps"}
                  </button>
                </div>

                {cmp && <Banner meta={cmp} />}

                {findings.map((f) => {
                  const ok = f.instruction_quote_verified && f.veteran_quote_verified;
                  const mark = (v: boolean) => (
                    <span className={`chip ${v ? "ok" : "bad"}`}>
                      {v ? "verified in source" : "quote not found in source"}
                    </span>
                  );
                  return (
                    <div key={f.id} className={`panel finding ${ok ? "" : "unverified"}`}>
                      <h3>
                        <span className="badge">{f.type}</span>
                        {f.topic}
                      </h3>
                      <p className="note">Instruction {f.instruction_step}</p>
                      <blockquote>{f.instruction_quote}</blockquote>
                      {f.instruction_step !== "none" && mark(f.instruction_quote_verified)}
                      <p className="note note-spaced">Veteran</p>
                      <blockquote>{f.veteran_quote}</blockquote>
                      {mark(f.veteran_quote_verified)}
                      <p className="note-spaced">
                        <b>Why it matters:</b> {f.why_it_matters}
                      </p>
                      <p>
                        <b>Follow-up:</b> {f.follow_up_question}
                      </p>
                      {ok ? (
                        <>
                          <label className="f" htmlFor={`a-${f.id}`}>
                            Expert answer
                          </label>
                          <textarea
                            id={`a-${f.id}`}
                            rows={3}
                            value={answers[f.id] ?? ""}
                            onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })}
                          />
                          <div className="row">
                            <button
                              className="primary"
                              onClick={() => draft(f.id)}
                              disabled={!!busy}
                            >
                              {busy === "draft-" + f.id ? "Drafting..." : "Draft guide card"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="err">Unverified. This finding cannot become a card.</p>
                      )}
                    </div>
                  );
                })}

                {cmp && cmp.confirmed_matches.length > 0 && (
                  <div className="panel">
                    <h3>Confirmed matches</h3>
                    <ul>
                      {cmp.confirmed_matches.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {tab === 2 && (
              <section>
                <h2>Review guide cards</h2>
                {cards.length === 0 && (
                  <div className="panel">
                    <p>No cards yet. Find gaps, then draft a guide card from a verified finding.</p>
                    <button onClick={() => setTab(1)}>Go to Compare</button>
                  </div>
                )}
                {cards.some((c) => c.source_quotes.length) && app && (
                  <p className="note note-bottom">
                    Card drafts:{" "}
                    {app.offline
                      ? "Sample output (offline), not a live model call."
                      : `Granite on watsonx.ai · ${app.model}`}
                  </p>
                )}
                {cards.map((c) => (
                  <CardEditor key={c.id} card={c} role={role} onChange={load} onError={setError} />
                ))}
              </section>
            )}

            {tab === 3 && (
              <section>
                <h2>Ask about WI-114</h2>
                <div className="panel">
                  <p className="note">Answers come only from approved guide cards.</p>
                  <div className="quick">
                    {QUICK.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setQuestion(q);
                          doAsk(q);
                        }}
                        disabled={busy === "ask"}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <label className="f" htmlFor="q">
                    Your question
                  </label>
                  <textarea
                    id="q"
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <div className="row">
                    <button
                      className="primary"
                      onClick={() => doAsk(question)}
                      disabled={busy === "ask" || !question.trim()}
                    >
                      {busy === "ask" ? "Asking..." : "Ask question"}
                    </button>
                  </div>
                </div>
                {ask && (
                  <div className={`panel ${ask.in_scope ? "answer-ok" : "answer-out"}`}>
                    <Banner meta={ask} />
                    {ask.in_scope ? (
                      <h3>Answer from approved guidance</h3>
                    ) : (
                      <h3>{ask.no_guidance ? "No approved guidance yet" : "Out of scope"}</h3>
                    )}
                    <p>{ask.answer}</p>
                    {ask.cited_cards.map((c) => (
                      <p key={c.id}>
                        <b>Card:</b> {c.title}{" "}
                        <span className={`status ${c.status}`}>{c.status.replace("_", " ")}</span>
                      </p>
                    ))}
                    {ask.cited_quotes.length > 0 && (
                      <>
                        <p>
                          <b>Veteran&apos;s words</b>
                        </p>
                        {ask.cited_quotes.map((q, i) => (
                          <blockquote key={i}>{q}</blockquote>
                        ))}
                      </>
                    )}
                    {ask.missing_information.length > 0 && (
                      <>
                        <p>
                          <b>Missing information</b>
                        </p>
                        <ul>
                          {ask.missing_information.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>

        {/* BOTTOM INSTANT Q&A BAR INSIDE KIOSK */}
        <footer className="kiosk-qa-footer">
          <span className="qa-footer-label">💬 Quick Apprentice Q&amp;A:</span>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder={`Ask about ${activeMachine.name} (e.g., 'Should I bump the wear offset?')...`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && quickInput.trim()) {
                setQuestion(quickInput);
                jumpToWorkspace(3);
                doAsk(quickInput);
              }
            }}
          />
          <button
            className="primary"
            onClick={() => {
              const q = quickInput.trim() || QUICK[0];
              setQuestion(q);
              jumpToWorkspace(3);
              doAsk(q);
            }}
            disabled={busy === "ask"}
          >
            Ask w/ Citations
          </button>
        </footer>
      </div>

      {/* SHOP OWNER: ADD NEW MACHINE MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <span className="modal-role-pill">🏭 Shop Owner Flow</span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <h3 className="modal-heading">Add a New Machine &amp; Baseline Manual</h3>

            <label className="f" htmlFor="m-name">
              Machine Name &amp; Model
            </label>
            <input
              id="m-name"
              type="text"
              value={newMachineName}
              onChange={(e) => setNewMachineName(e.target.value)}
            />

            <label className="f" htmlFor="m-bay">
              Bay &amp; Machine Type
            </label>
            <input
              id="m-bay"
              type="text"
              value={newMachineBay}
              onChange={(e) => setNewMachineBay(e.target.value)}
            />

            <label className="f">Upload Existing SOP / OEM Manual</label>
            <div className="modal-dropzone">
              📄 Drop PDF Manual or Work Instruction here to enable automatic gap-checking
            </div>

            <label className="f" htmlFor="m-prompt">
              High-Priority Topic for Outgoing Veteran
            </label>
            <input
              id="m-prompt"
              type="text"
              value={newMachinePrompt}
              onChange={(e) => setNewMachinePrompt(e.target.value)}
            />

            <div className="row modal-actions">
              <button type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-sky" onClick={handleAddMachine}>
                + Register Machine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
