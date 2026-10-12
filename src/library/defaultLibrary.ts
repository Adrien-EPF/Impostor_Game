import csvText from "../../mots_imposteur.csv?raw";
import { parseCSV, type WordGroup } from "./parseCsv";

/**
 * The library a new player gets before importing a CSV of their own.
 * `mots_imposteur.csv` at the repo root is the single source: add or edit
 * word groups there, not in code.
 */
export const DEFAULT_LIB: WordGroup[] = parseCSV(csvText).groups;
