import { normalizeWord } from "../library";

/**
 * Players module: pure list logic for the "Qui joue ?" screen (F01/E2). Kept
 * copy-free like `library/parseCsv.ts` — this returns structured reasons, not
 * French sentences, so the screen owns all display text.
 */
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

export type AddPlayerResult =
  | { ok: true; players: string[] }
  | { ok: false; reason: "max-players" | "duplicate" };

/** Appends `name` (expected already trimmed and non-empty; the caller decides what a blank submission means). */
export function addPlayer(players: string[], name: string): AddPlayerResult {
  if (players.length >= MAX_PLAYERS) return { ok: false, reason: "max-players" };
  if (players.some((p) => normalizeWord(p) === normalizeWord(name))) {
    return { ok: false, reason: "duplicate" };
  }
  return { ok: true, players: [...players, name] };
}

export function movePlayer(players: string[], index: number, direction: -1 | 1): string[] {
  const target = index + direction;
  if (target < 0 || target >= players.length) return players;
  const next = players.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function removePlayer(players: string[], index: number): string[] {
  return players.filter((_, i) => i !== index);
}

export function renamePlayer(players: string[], index: number, name: string): string[] {
  const next = players.slice();
  next[index] = name;
  return next;
}

export interface PlayerRowFlags {
  invalid: boolean;
  reason: "empty" | "duplicate" | null;
}

/**
 * Per-row validation flags. Only the later occurrence of a post-normalization
 * duplicate is flagged (matching the handoff), so renaming the earlier one
 * away clears the flag on the later one without flip-flopping which row is
 * "wrong".
 */
export function getPlayerRowFlags(players: string[]): PlayerRowFlags[] {
  const norms = players.map(normalizeWord);
  return players.map((name, i) => {
    const empty = !name.trim();
    const duplicate = !empty && norms.indexOf(norms[i]) !== i;
    const reason = empty ? "empty" : duplicate ? "duplicate" : null;
    return { invalid: empty || duplicate, reason };
  });
}

function hasInvalidRows(players: string[]): boolean {
  return getPlayerRowFlags(players).some((row) => row.invalid);
}

export function canContinue(players: string[]): boolean {
  return players.length >= MIN_PLAYERS && !hasInvalidRows(players);
}

export type ContinueBlockedReason = { kind: "too-few"; missing: number } | { kind: "invalid-rows" } | null;

export function continueBlockedReason(players: string[]): ContinueBlockedReason {
  const missing = MIN_PLAYERS - players.length;
  if (missing > 0) return { kind: "too-few", missing };
  if (hasInvalidRows(players)) return { kind: "invalid-rows" };
  return null;
}
