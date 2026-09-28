import { createPersistedState, GAME_STATE_KEY } from "./persistedState";

/**
 * État de partie: shared across every in-progress-game screen ticket. This
 * ticket only owns `players`; later tickets extend the shape (roles, words,
 * turn, éliminés, …) without changing how it's read or written.
 */
export interface GameState {
  players: string[];
}

const EMPTY_GAME_STATE: GameState = { players: [] };

const gameState = createPersistedState<GameState>(GAME_STATE_KEY);

export function loadGameState(): GameState {
  return gameState.get() ?? EMPTY_GAME_STATE;
}

export function saveGameState(state: GameState): void {
  gameState.set(state);
}
