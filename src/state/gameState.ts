import type { Cause, Role, Winner } from "../rules";
import { DEFAULT_SETTINGS } from "../settings";
import type { Settings } from "../settings";
import { createPersistedState, GAME_STATE_KEY } from "./persistedState";

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
