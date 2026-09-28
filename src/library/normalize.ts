/**
 * RG04 word-equality normalization: lowercase, strip diacritics (NFD),
 * remove spaces, hyphens and apostrophes (straight or curly).
 */
export function normalizeWord(word: string): string {
  return (word ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s\-'’]/g, "");
}
