import { beforeEach, describe, expect, it } from "vitest";
import { GAME_STATE_KEY } from "./persistedState";
import { loadGameState, saveGameState } from "./gameState";

describe("gameState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to an empty player list when nothing is persisted", () => {
    expect(loadGameState()).toEqual({ players: [] });
  });

  it("persists the player list under the shared état de partie key", () => {
    saveGameState({ players: ["Léa", "Sacha"] });
    expect(loadGameState()).toEqual({ players: ["Léa", "Sacha"] });
    expect(JSON.parse(window.localStorage.getItem(GAME_STATE_KEY)!)).toEqual({
      players: ["Léa", "Sacha"],
    });
  });

  it("survives a reload (a fresh read after set)", () => {
    saveGameState({ players: ["Léa"] });
    expect(loadGameState()).toEqual({ players: ["Léa"] });
  });
});
