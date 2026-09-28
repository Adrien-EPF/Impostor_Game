import { normalizeWord } from "../library";

/** Classic full-matrix Levenshtein edit distance. */
function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[rows - 1][cols - 1];
}

/**
 * RG04: a guess matches when, after normalization (`normalizeWord`), it's
 * either identical to the target or within Levenshtein distance 1 (when the
 * normalized target is ≤6 letters) / 2 (longer) — the distance is computed
 * on the normalized forms, but the threshold reads on the normalized
 * target's length.
 */
export function matchesWord(guess: string, target: string): boolean {
  const g = normalizeWord(guess);
  const w = normalizeWord(target);
  if (!g) return false;
  if (g === w) return true;
  return levenshtein(g, w) <= (w.length <= 6 ? 1 : 2);
}
