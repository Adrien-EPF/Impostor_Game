import { describe, expect, it } from "vitest";
import { DEFAULT_LIB } from "./defaultLibrary";

describe("DEFAULT_LIB", () => {
  it("has 12 groups", () => {
    expect(DEFAULT_LIB).toHaveLength(12);
  });

  it("gives every group a category and at least 4 words", () => {
    for (const group of DEFAULT_LIB) {
      expect(group.cat.length).toBeGreaterThan(0);
      expect(group.words.length).toBeGreaterThanOrEqual(4);
    }
  });
});
