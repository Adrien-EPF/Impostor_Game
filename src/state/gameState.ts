import type { Role } from "../rules";
import { DEFAULT_SETTINGS } from "../settings";
import type { Settings } from "../settings";
import { createPersistedState, GAME_STATE_KEY } from "./persistedState";

/**
 * The draw and its live progress through E4/E5. `turn`/`eliminated` are left
 * for the tickets that add E6/E7 — this one only needs turn 1's setup.
 */
export interface Game {
  cat: string;
  civilWord: string;
  imposteurWord: string;
  roles: Record<string, Role>;
  starter: string | null;
  /** Players who have seen their secret card (E4 tile grid). */
  seen: Record<string, boolean>;
}

/**
 * État de partie: shared across every in-progress-game screen ticket. Later
 * tickets extend the shape further (turn, éliminés, …) without changing how
 * it's read or written.
 */
export interface GameState {
  players: string[];
  settings: Settings;
  game: Game | null;
  /** Player currently holding the phone on E5 (the "Touche ton prénom" pass-around), or `null` between turns. */
  cardPlayer: string | null;
}

const EMPTY_GAME_STATE: GameState = { players: [], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null };

const gameState = createPersistedState<GameState>(GAME_STATE_KEY);

export function loadGameState(): GameState {
  return gameState.get() ?? EMPTY_GAME_STATE;
}

export function saveGameState(state: GameState): void {
  gameState.set(state);
}
