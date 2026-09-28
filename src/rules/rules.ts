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
