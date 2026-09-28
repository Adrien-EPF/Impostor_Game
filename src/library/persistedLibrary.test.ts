import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_LIB } from "./defaultLibrary";
import { LIBRARY_KEY, loadLibrary, saveLibrary } from "./persistedLibrary";

describe("persistedLibrary", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the default library when nothing has been imported", () => {
    expect(loadLibrary()).toEqual({ groups: DEFAULT_LIB, source: null });
  });

  it("persists an imported library under imposteur.bibliotheque.v1 and reads it back", () => {
    const library = { groups: [{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }], source: "mots.csv" };
    saveLibrary(library);
    expect(loadLibrary()).toEqual(library);
    expect(JSON.parse(window.localStorage.getItem(LIBRARY_KEY)!)).toEqual(library);
  });

  it("replaces the previous library entirely on a new import", () => {
    saveLibrary({ groups: [{ cat: "Fruits", words: ["Pomme", "Poire", "Coing", "Pêche"] }], source: "a.csv" });
    saveLibrary({ groups: [{ cat: "Sports", words: ["Tennis", "Squash", "Padel", "Golf"] }], source: "b.csv" });
    expect(loadLibrary()).toEqual({
      groups: [{ cat: "Sports", words: ["Tennis", "Squash", "Padel", "Golf"] }],
      source: "b.csv",
    });
  });
});
