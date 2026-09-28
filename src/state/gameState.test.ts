import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../settings";
import { GAME_STATE_KEY } from "./persistedState";
import { loadGameState, saveGameState } from "./gameState";

describe("gameState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const EMPTY = { players: [], settings: DEFAULT_SETTINGS, game: null, cardPlayer: null, elimTarget: null };

  it("defaults to an empty player list and default settings when nothing is persisted", () => {
    expect(loadGameState()).toEqual(EMPTY);
  });

  it("persists the player list under the shared état de partie key", () => {
    saveGameState({ ...EMPTY, players: ["Léa", "Sacha"] });
    expect(loadGameState()).toEqual({ ...EMPTY, players: ["Léa", "Sacha"] });
    expect(JSON.parse(window.localStorage.getItem(GAME_STATE_KEY)!)).toEqual({ ...EMPTY, players: ["Léa", "Sacha"] });
  });

  it("survives a reload (a fresh read after set)", () => {
    saveGameState({ ...EMPTY, players: ["Léa"] });
    expect(loadGameState()).toEqual({ ...EMPTY, players: ["Léa"] });
  });
});
