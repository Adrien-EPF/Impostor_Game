import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../settings";
import { GAME_STATE_KEY } from "./persistedState";
import { loadGameState, saveGameState } from "./gameState";

describe("gameState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to an empty player list and default settings when nothing is persisted", () => {
    expect(loadGameState()).toEqual({ players: [], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null });
  });

  it("persists the player list under the shared état de partie key", () => {
    saveGameState({ players: ["Léa", "Sacha"], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null });
    expect(loadGameState()).toEqual({ players: ["Léa", "Sacha"], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null });
    expect(JSON.parse(window.localStorage.getItem(GAME_STATE_KEY)!)).toEqual({
      players: ["Léa", "Sacha"],
      settings: DEFAULT_SETTINGS,
      game: null,
      cardPlayer: null,
    });
  });

  it("survives a reload (a fresh read after set)", () => {
    saveGameState({ players: ["Léa"], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null });
    expect(loadGameState()).toEqual({ players: ["Léa"], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null });
  });
});
