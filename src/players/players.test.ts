import { describe, expect, it } from "vitest";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  addPlayer,
  canContinue,
  continueBlockedReason,
  getPlayerRowFlags,
  movePlayer,
  removePlayer,
  renamePlayer,
} from "./players";

describe("addPlayer", () => {
  it("appends the name to the list", () => {
    const result = addPlayer(["Léa"], "Sacha");
    expect(result).toEqual({ ok: true, players: ["Léa", "Sacha"] });
  });

  it("rejects a duplicate after RG04-style normalization", () => {
    const result = addPlayer(["Léa"], "lea");
    expect(result).toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects when the list is already at the 20-player cap", () => {
    const players = Array.from({ length: MAX_PLAYERS }, (_, i) => `Joueur ${i + 1}`);
    const result = addPlayer(players, "Un de plus");
    expect(result).toEqual({ ok: false, reason: "max-players" });
  });
});

describe("movePlayer", () => {
  it("swaps a player with its predecessor", () => {
    expect(movePlayer(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
  });

  it("swaps a player with its successor", () => {
    expect(movePlayer(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("is a no-op past either end of the list", () => {
    expect(movePlayer(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(movePlayer(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
});

describe("removePlayer", () => {
  it("removes the player at the given index", () => {
    expect(removePlayer(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });
});

describe("renamePlayer", () => {
  it("replaces the name at the given index", () => {
    expect(renamePlayer(["a", "b"], 1, "c")).toEqual(["a", "c"]);
  });
});

describe("getPlayerRowFlags", () => {
  it("flags no rows when every name is unique and non-empty", () => {
    expect(getPlayerRowFlags(["Léa", "Sacha"])).toEqual([
      { invalid: false, reason: null },
      { invalid: false, reason: null },
    ]);
  });

  it("flags an empty name with reason 'empty'", () => {
    expect(getPlayerRowFlags(["Léa", "  "])).toEqual([
      { invalid: false, reason: null },
      { invalid: true, reason: "empty" },
    ]);
  });

  it("flags only the later occurrence of a post-normalization duplicate", () => {
    expect(getPlayerRowFlags(["Léa", "Sacha", "lea"])).toEqual([
      { invalid: false, reason: null },
      { invalid: false, reason: null },
      { invalid: true, reason: "duplicate" },
    ]);
  });
});

describe("canContinue / continueBlockedReason", () => {
  it("blocks below the 3-player floor with a too-few reason", () => {
    expect(canContinue(["a", "b"])).toBe(false);
    expect(continueBlockedReason(["a", "b"])).toEqual({ kind: "too-few", missing: 1 });
    expect(continueBlockedReason([])).toEqual({ kind: "too-few", missing: MIN_PLAYERS });
  });

  it("blocks on an invalid (empty or duplicate) row even with enough players", () => {
    expect(canContinue(["a", "b", ""])).toBe(false);
    expect(continueBlockedReason(["a", "b", ""])).toEqual({ kind: "invalid-rows" });
  });

  it("allows continuing with 3+ valid, unique names", () => {
    expect(canContinue(["a", "b", "c"])).toBe(true);
    expect(continueBlockedReason(["a", "b", "c"])).toBeNull();
  });
});
