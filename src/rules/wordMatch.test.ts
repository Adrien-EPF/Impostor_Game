import { describe, expect, it } from "vitest";
import { matchesWord } from "./wordMatch";

describe("matchesWord (RG04)", () => {
  it("accepts an exact match regardless of case", () => {
    expect(matchesWord("orangina", "Orangina")).toBe(true);
    expect(matchesWord("ORANGINA", "Orangina")).toBe(true);
  });

  it("accepts a one-letter typo on a long word", () => {
    expect(matchesWord("Oranjina", "Orangina")).toBe(true);
  });

  it("rejects an unrelated word", () => {
    expect(matchesWord("Fanta", "Orangina")).toBe(false);
  });

  it("rejects an empty guess", () => {
    expect(matchesWord("", "Orangina")).toBe(false);
    expect(matchesWord("   ", "Orangina")).toBe(false);
  });

  it("ignores spaces, hyphens, apostrophes and diacritics", () => {
    expect(matchesWord("Iced Tea", "Iced-Tea")).toBe(true);
    expect(matchesWord("Crepe", "Crêpe")).toBe(true);
    expect(matchesWord("Roller", "Rôller")).toBe(true);
  });

  it("tolerates distance 1 on a normalized target of 6 letters or fewer", () => {
    expect(matchesWord("Chah", "Chat")).toBe(true); // distance 1
    expect(matchesWord("Chaton", "Chat")).toBe(false); // distance 2, over the ≤6-letter threshold of 1
  });

  it("tolerates distance 2 but not 3 on a normalized target longer than 6 letters", () => {
    expect(matchesWord("Trotinete", "Trottinette")).toBe(true); // distance 2
    expect(matchesWord("Trotinet", "Trottinette")).toBe(false); // distance 3
  });
});
