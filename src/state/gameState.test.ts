import { beforeEach, describe, expect, it } from "vitest";
import type { WordGroup } from "../library";
import { DEFAULT_SETTINGS } from "../settings";
import { GAME_STATE_KEY } from "./persistedState";
import { applyTurnOutcome, buildNewGame, loadGameState, saveGameState } from "./gameState";

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

describe("buildNewGame", () => {
  const GROUPS: WordGroup[] = [{ cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea"] }];

  it("draws a fresh, freshly-reset game for the given players/settings", () => {
    const players = ["Léa", "Hugo", "Inès", "Max"];
    const game = buildNewGame(players, { ...DEFAULT_SETTINGS, imposteurs: 1 }, GROUPS);
    expect(game).not.toBeNull();
    expect(game!.cat).toBe("Boissons");
    expect(Object.keys(game!.roles).sort()).toEqual([...players].sort());
    expect(game!.turn).toBe(1);
    expect(game!.eliminated).toEqual([]);
    expect(game!.winner).toBeNull();
    expect(game!.cause).toBeNull();
    expect(game!.mrWhiteGuesses).toEqual({});
    expect(game!.seen).toEqual({});
  });

  it("returns null when every category is excluded", () => {
    const players = ["Léa", "Hugo", "Inès"];
    const game = buildNewGame(players, { ...DEFAULT_SETTINGS, excludedCategories: ["Boissons"] }, GROUPS);
    expect(game).toBeNull();
  });
});

describe("applyTurnOutcome", () => {
  it("merges a resolveTurn outcome's turn/starter/winner/cause onto the game, keeping everything else", () => {
    const game = buildNewGame(["Léa", "Hugo", "Inès"], DEFAULT_SETTINGS, [
      { cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea"] },
    ])!;
    const next = applyTurnOutcome(game, { winner: "civils", cause: "elimination", turn: game.turn, starter: null });
    expect(next.winner).toBe("civils");
    expect(next.cause).toBe("elimination");
    expect(next.starter).toBeNull();
    expect(next.roles).toBe(game.roles);
    expect(next.civilWord).toBe(game.civilWord);
  });
});
