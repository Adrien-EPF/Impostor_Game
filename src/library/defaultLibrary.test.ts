import { describe, expect, it } from "vitest";
import csvText from "../../mots_imposteur.csv?raw";
import { DEFAULT_LIB } from "./defaultLibrary";
import { normalizeWord } from "./normalize";
import { MAX_WORD_COLUMNS, MIN_WORDS_PER_GROUP, parseCSV } from "./parseCsv";

/** Non-empty word cells of each data row, straight from the file (before parseCSV merges duplicates). */
function rawWordRows(): string[][] {
  return csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim())
    .map((line) =>
      line
        .split(";")
        .slice(1)
        .map((cell) => cell.trim())
        .filter(Boolean),
    );
}

describe("DEFAULT_LIB", () => {
  it("is built from mots_imposteur.csv, the single source of the default library", () => {
    expect(DEFAULT_LIB.length).toBeGreaterThan(0);
    expect(DEFAULT_LIB).toEqual(parseCSV(csvText).groups);
  });

  it("imports every row of the CSV without ignoring any", () => {
    expect(parseCSV(csvText).errors).toEqual([]);
  });

  it("gives every group a category and 4 to 6 words", () => {
    for (const group of DEFAULT_LIB) {
      expect(group.cat.length).toBeGreaterThan(0);
      expect(group.words.length).toBeGreaterThanOrEqual(MIN_WORDS_PER_GROUP);
      expect(group.words.length).toBeLessThanOrEqual(MAX_WORD_COLUMNS);
    }
  });

  it("never repeats a word within a group", () => {
    for (const words of rawWordRows()) {
      expect(new Set(words.map(normalizeWord)).size).toBe(words.length);
    }
  });

  it("never repeats a word across groups", () => {
    const seen = new Map<string, string[]>();
    for (const group of DEFAULT_LIB) {
      for (const word of group.words) {
        const key = normalizeWord(word);
        expect(seen.get(key), `"${word}" already used in the group [${seen.get(key)?.join(", ")}]`).toBeUndefined();
        seen.set(key, group.words);
      }
    }
  });

  it("never puts a word inside another word of the same group", () => {
    for (const group of DEFAULT_LIB) {
      const keys = group.words.map(normalizeWord);
      keys.forEach((key, i) => {
        keys.forEach((other, j) => {
          expect(i === j || !other.includes(key), `"${group.words[i]}" is contained in "${group.words[j]}"`).toBe(true);
        });
      });
    }
  });
});
