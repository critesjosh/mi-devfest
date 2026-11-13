// Tiny JSON-file store. Good enough for a single-machine demo; swap for Cloudant/SQLite later.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { Card, CardStatus, CheckedFinding } from "./schemas";

export type State = {
  compare: { findings: CheckedFinding[]; confirmed_matches: string[]; offline: boolean; at: string } | null;
  cards: Card[];
};

const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "state.json");

export function readState(): State {
  if (!existsSync(file)) return { compare: null, cards: [] };
  return JSON.parse(readFileSync(file, "utf8")) as State;
}

export function writeState(s: State) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(s, null, 2));
}

export function resetState() {
  writeState({ compare: null, cards: [] });
}

// Review states move forward one step at a time. Editing a card's content sends it back to candidate.
const NEXT: Record<CardStatus, CardStatus | null> = {
  candidate: "expert_confirmed",
  expert_confirmed: "approved",
  approved: null,
};

export function canAdvance(from: CardStatus, to: CardStatus) {
  return NEXT[from] === to;
}

export function approvedCardsFor(procedure: string, revision: string, cards: Card[]) {
  return cards.filter((c) => c.status === "approved" && c.procedure === procedure && c.procedure_revision === revision);
}
