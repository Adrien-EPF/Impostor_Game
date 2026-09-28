import { createPersistedState } from "../state/persistedState";
import { DEFAULT_LIB } from "./defaultLibrary";
import type { WordGroup } from "./parseCsv";

export interface Library {
  groups: WordGroup[];
  /** Imported file name, or `null` for the embedded default library. */
  source: string | null;
}

export const LIBRARY_KEY = "imposteur.bibliotheque.v1";

const persistedLibrary = createPersistedState<Library>(LIBRARY_KEY);

export function loadLibrary(): Library {
  return persistedLibrary.get() ?? { groups: DEFAULT_LIB, source: null };
}

export function saveLibrary(library: Library): void {
  persistedLibrary.set(library);
}
