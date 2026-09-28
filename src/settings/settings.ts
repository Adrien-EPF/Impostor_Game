import type { WordGroup } from "../library";

/**
 * Settings module: pure composition/victory-mode/category logic for the
 * "Réglages" screen (F02/F03/F17, E3). Kept copy-free like `players.ts` —
 * `launchBlockedReason` returns the exact RG01 sentences from the handoff
 * since they're rules text, not screen chrome, but the screen still owns
 * the "Choisis au moins une catégorie." fallback wiring.
 */
export type VictoryMode = "classique" | "tours";

export interface Settings {
  imposteurs: number;
  mrWhite: number;
  mode: VictoryMode;
  /** Explicit tour count, or `null` to use the computed default (joueurs − 2, min 1). */
  tours: number | null;
  /** Categories excluded from the draw; a category absent from this list is included. */
  excludedCategories: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  imposteurs: 1,
  mrWhite: 0,
  mode: "classique",
  tours: null,
  excludedCategories: [],
};

/** RG01: infiltrés max = ⌊(n−1)/2⌋. */
export function maxInfiltres(playerCount: number): number {
  return Math.max(0, Math.floor((playerCount - 1) / 2));
}

export interface Composition {
  infiltres: number;
  civils: number;
  maxInfiltres: number;
}

export function composition(playerCount: number, settings: Settings): Composition {
  const infiltres = settings.imposteurs + settings.mrWhite;
  return {
    infiltres,
    civils: Math.max(0, playerCount - infiltres),
    maxInfiltres: maxInfiltres(playerCount),
  };
}

function pluralize(count: number): string {
  return count > 1 ? "s" : "";
}

/** RG01 validation: infiltrés ≥ 1 and civils > infiltrés. */
export function compositionError(playerCount: number, settings: Settings): string | null {
  const { infiltres, civils, maxInfiltres: max } = composition(playerCount, settings);
  if (infiltres < 1) return "Il faut au moins un infiltré (imposteur ou Mr. White).";
  if (civils <= infiltres) {
    return `Trop d'infiltrés : il faut plus de civils que d'infiltrés. Avec ${playerCount} joueurs, ${max} infiltré${pluralize(max)} au maximum.`;
  }
  return null;
}

/** F03: N tours defaults to joueurs − 2 (min 1) until explicitly set. */
export function effectiveTours(settings: Settings, playerCount: number): number {
  return settings.tours ?? Math.max(1, playerCount - 2);
}

export function toggleCategory(excludedCategories: string[], category: string): string[] {
  return excludedCategories.includes(category)
    ? excludedCategories.filter((c) => c !== category)
    : [...excludedCategories, category];
}

export function activeGroups(groups: WordGroup[], excludedCategories: string[]): WordGroup[] {
  return groups.filter((group) => !excludedCategories.includes(group.cat));
}

export type LaunchBlockedReason = { kind: "composition"; message: string } | { kind: "no-categories" } | null;

export function launchBlockedReason(
  playerCount: number,
  settings: Settings,
  groups: WordGroup[],
): LaunchBlockedReason {
  const message = compositionError(playerCount, settings);
  if (message) return { kind: "composition", message };
  if (activeGroups(groups, settings.excludedCategories).length === 0) return { kind: "no-categories" };
  return null;
}
