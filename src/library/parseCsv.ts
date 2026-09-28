import { normalizeWord } from "./normalize";

export interface WordGroup {
  cat: string;
  words: string[];
}

export interface ParseCsvResult {
  groups: WordGroup[];
  /** File line numbers (1-indexed, header = line 1) of rows ignored for having fewer than 4 words. */
  errors: number[];
}

const MAX_WORD_COLUMNS = 6;
const MIN_WORDS_PER_GROUP = 4;

/**
 * Parses the "Bibliothèque de mots" CSV format: `;` or `,` separated,
 * `categorie;mot1;...;mot6` columns, header row ignored. Ported from the
 * design handoff's reference `parseCSV` (Imposteur.dc.html).
 */
export function parseCSV(text: string): ParseCsvResult {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  const separator = (lines[0] ?? "").includes(";") ? ";" : ",";
  const groups: WordGroup[] = [];
  const errors: number[] = [];

  lines.slice(1).forEach((line, index) => {
    if (!line.trim()) return;

    const cells = line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, "").trim());
    const cat = cells[0];
    const words: string[] = [];
    const seen = new Set<string>();

    cells.slice(1, MAX_WORD_COLUMNS + 1).forEach((word) => {
      if (!word) return;
      const key = normalizeWord(word);
      if (seen.has(key)) return;
      seen.add(key);
      words.push(word);
    });

    const lineNumber = index + 2;
    if (!cat || words.length < MIN_WORDS_PER_GROUP) {
      errors.push(lineNumber);
    } else {
      groups.push({ cat, words });
    }
  });

  return { groups, errors };
}
