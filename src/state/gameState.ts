import type { WordGroup } from "../library";
import { assignRoles, drawGroup, pickStarter } from "../rules";
import type { Cause, Role, TurnOutcome, Winner } from "../rules";
import { DEFAULT_SETTINGS, activeGroups } from "../settings";
import type { Settings } from "../settings";
import { createPersistedState, GAME_STATE_KEY } from "./persistedState";
import type { ScreenId } from "./screenId";

/** The draw and its live progress through E4-E8. */
export interface Game {
  cat: string;
  civilWord: string;
  imposteurWord: string;
  roles: Record<string, Role>;
  starter: string | null;
  /** Players who have seen their secret card (E4 tile grid). */
  seen: Record<string, boolean>;
  /** Current turn number, 1-indexed (RG03). */
  turn: number;
  /** Players eliminated so far, in elimination order (oldest first). */
  eliminated: string[];
  winner: Winner | null;
  cause: Cause | null;
  /** Per-Mr.-White guess outcome, recorded once — either at their own elimination (RG07) or during the Chance finale (RG09). */
  mrWhiteGuesses: Record<string, boolean>;
}

/**
 * État de partie: shared across every in-progress-game screen ticket.
 */
export interface GameState {
  players: string[];
  settings: Settings;
  game: Game | null;
  /** Player currently holding the phone on E5 (the "Touche ton prénom" pass-around), or `null` between turns. */
  cardPlayer: string | null;
  /** Player targeted for elimination on E7, or `null` between votes. */
  elimTarget: string | null;
  /** Screen last navigated to, so a reload resumes there instead of resetting to E1. Absent (e.g. first-ever visit) means E1. */
  screen?: ScreenId;
}

const EMPTY_GAME_STATE: GameState = {
  players: [],
  settings: DEFAULT_SETTINGS,
  game: null,
  cardPlayer: null,
  elimTarget: null,
};

const gameState = createPersistedState<GameState>(GAME_STATE_KEY);

export function loadGameState(): GameState {
  return gameState.get() ?? EMPTY_GAME_STATE;
}

export function saveGameState(state: GameState): void {
  gameState.set(state);
}

/**
 * RG02/RG03/RG08: draws a fresh game for `players`/`settings` — a new word
 * group and starter, turn reset to 1, nothing eliminated or guessed yet.
 * Shared by E3's "Lancer la partie" and E8's "Rejouer" (same players and
 * settings, new draw). Returns `null` when every category is excluded.
 */
export function buildNewGame(players: string[], settings: Settings, libraryGroups: WordGroup[]): Game | null {
  const groups = activeGroups(libraryGroups, settings.excludedCategories);
  if (groups.length === 0) return null;
  const draw = drawGroup(groups);
  const roles = assignRoles(players, settings.imposteurs, settings.mrWhite);
  return {
    cat: draw.cat,
    civilWord: draw.civilWord,
    imposteurWord: draw.imposteurWord,
    roles,
    starter: pickStarter(players, roles),
    seen: {},
    turn: 1,
    eliminated: [],
    winner: null,
    cause: null,
    mrWhiteGuesses: {},
  };
}

/** Merges a `resolveTurn` outcome (RG05/RG03) onto a `Game`. */
export function applyTurnOutcome(game: Game, outcome: TurnOutcome): Game {
  return { ...game, turn: outcome.turn, starter: outcome.starter, winner: outcome.winner, cause: outcome.cause };
}
