import { describe, expect, it } from "vitest";
import { normalizeWord } from "./normalize";

describe("normalizeWord", () => {
  it("lowercases", () => {
    expect(normalizeWord("Coca")).toBe("coca");
  });

  it("strips diacritics", () => {
    expect(normalizeWord("Guépard")).toBe("guepard");
  });

  it("removes spaces, hyphens and straight apostrophes", () => {
    expect(normalizeWord("Iced Tea")).toBe("icedtea");
    expect(normalizeWord("Ping-pong")).toBe("pingpong");
    expect(normalizeWord("Aujourd'hui")).toBe("aujourdhui");
  });

  it("removes curly apostrophes", () => {
    expect(normalizeWord("Aujourd’hui")).toBe("aujourdhui");
  });

  it("treats words differing only by case, accents or spacing as equal", () => {
    expect(normalizeWord("RED BULL")).toBe(normalizeWord("Red-Bull"));
  });
});
