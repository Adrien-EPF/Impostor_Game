import type { WordGroup } from "../library";

/**
 * Game-rules module: draw, role assignment, turn/victory logic, Mr. White
 * word checking (cahier des charges — "Séparation logique / affichage").
 *
 * This module must stay independent of the UI: no imports from React, from
 * `src/design-system`, or from `src/shell`. It should remain plain,
 * synchronous, dependency-light TypeScript that later tickets can unit-test
 * on its own and reuse unmodified in a V2 rewrite of the UI.
 */
export type Role = "civil" | "imposteur" | "mr-white";

/** RG02/RG03: all randomness goes through `crypto.getRandomValues`, never `Math.random`. */
function randomInt(maxExclusive: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % maxExclusive;
}

/** Fisher-Yates shuffle; does not mutate `items`. */
export function shuffle<T>(items: T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface WordDraw {
  cat: string;
  civilWord: string;
  imposteurWord: string;
}

/** RG02: draws a random group from `groups` (already filtered to retained categories) and two distinct words from it. */
export function drawGroup(groups: WordGroup[]): WordDraw {
  const group = groups[randomInt(groups.length)];
  const words = shuffle(group.words);
  return { cat: group.cat, civilWord: words[0], imposteurWord: words[1] };
}

/** RG02: builds the role list (imposteur × i, mr-white × m, civil × reste), shuffles it, and assigns in player order. */
export function assignRoles(players: string[], imposteurs: number, mrWhite: number): Record<string, Role> {
  const pool: Role[] = [
    ...Array<Role>(imposteurs).fill("imposteur"),
    ...Array<Role>(mrWhite).fill("mr-white"),
  ];
  while (pool.length < players.length) pool.push("civil");
  const shuffled = shuffle(pool);
  const roles: Record<string, Role> = {};
  players.forEach((player, i) => {
    roles[player] = shuffled[i];
  });
  return roles;
}

/** RG03: the starter is drawn uniformly among living players who are not Mr. White. */
export function pickStarter(players: string[], roles: Record<string, Role>, eliminated: string[] = []): string | null {
  const candidates = players.filter((p) => !eliminated.includes(p) && roles[p] !== "mr-white");
  return candidates.length > 0 ? candidates[randomInt(candidates.length)] : null;
}

export type Winner = "civils" | "infiltres";
export type Cause = "elimination" | "mr-white" | "parite" | "survie";

export interface VictoryResult {
  winner: Winner;
  cause: Cause;
}

export interface CheckVictoryInput {
  alivePlayers: string[];
  roles: Record<string, Role>;
  turn: number;
  /** Whether "Nombre de tours" is the active victory mode. */
  toursMode: boolean;
  /** The N target for "Nombre de tours" (`effectiveTours`); ignored when `toursMode` is false. */
  toursTarget: number;
  /** A Mr. White just guessed the civils' word correctly at their own elimination. */
  mrWhiteGuessedCorrectly: boolean;
}

/**
 * RG05, in order: (1) a correct Mr. White guess at elimination wins outright;
 * (2) no infiltré left alive wins the civils; (3) Parité — civils vivants =
 * infiltrés vivants (ADR-0002) — wins the infiltrés; (4) in "Nombre de
 * tours" mode, surviving (≥1 infiltré alive) to the end of tour N wins the
 * infiltrés; otherwise the game continues.
 */
export function checkVictory(input: CheckVictoryInput): VictoryResult | null {
  const { alivePlayers, roles, turn, toursMode, toursTarget, mrWhiteGuessedCorrectly } = input;
  if (mrWhiteGuessedCorrectly) return { winner: "infiltres", cause: "mr-white" };
  const infiltresAlive = alivePlayers.filter((p) => roles[p] !== "civil").length;
  const civilsAlive = alivePlayers.length - infiltresAlive;
  if (infiltresAlive === 0) return { winner: "civils", cause: "elimination" };
  if (civilsAlive <= infiltresAlive) return { winner: "infiltres", cause: "parite" };
  if (toursMode && turn >= toursTarget) return { winner: "infiltres", cause: "survie" };
  return null;
}

export interface TurnOutcome {
  winner: Winner | null;
  cause: Cause | null;
  /** Unchanged when the game just ended; incremented otherwise. */
  turn: number;
  /** `null` when the game just ended (RG03 only draws a starter for a turn that's actually played). */
  starter: string | null;
}

export interface ResolveTurnInput {
  players: string[];
  roles: Record<string, Role>;
  eliminated: string[];
  turn: number;
  toursMode: boolean;
  toursTarget: number;
  mrWhiteGuessedCorrectly: boolean;
}

/** Resolves the end of a turn: either the game just ended (RG05), or the next turn's starter is drawn (RG03). */
export function resolveTurn(input: ResolveTurnInput): TurnOutcome {
  const { players, roles, eliminated, turn, toursMode, toursTarget, mrWhiteGuessedCorrectly } = input;
  const alivePlayers = players.filter((p) => !eliminated.includes(p));
  const result = checkVictory({ alivePlayers, roles, turn, toursMode, toursTarget, mrWhiteGuessedCorrectly });
  if (result) return { winner: result.winner, cause: result.cause, turn, starter: null };
  return { winner: null, cause: null, turn: turn + 1, starter: pickStarter(players, roles, eliminated) };
}

/**
 * RG09: the next living, never-eliminated Mr. White still owed a Chance
 * finale attempt, in player order — or `null` once everyone's gone. A
 * result already recorded in `mrWhiteGuesses` (win or miss, at elimination
 * or an earlier finale attempt) marks that player as done.
 */
export function nextChanceFinale(
  players: string[],
  roles: Record<string, Role>,
  eliminated: string[],
  mrWhiteGuesses: Record<string, boolean>,
): string | null {
  return players.find((p) => roles[p] === "mr-white" && !eliminated.includes(p) && !(p in mrWhiteGuesses)) ?? null;
}
