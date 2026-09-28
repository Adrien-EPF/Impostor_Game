/**
 * Generic get/set/clear plumbing around `localStorage`. Later tickets create
 * one of these per persisted concern (`imposteur.etat.v1` for the état de
 * partie, `imposteur.bibliotheque.v1` for the word library,
 * `imposteur.reglages.v1` for remembered settings, etc.) and own the shape
 * of `T` themselves — this module only owns the read/write/clear mechanics.
 */
export interface PersistedState<T> {
  get(): T | null;
  set(value: T): void;
  clear(): void;
}

export function createPersistedState<T>(key: string): PersistedState<T> {
  return {
    get() {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    set(value: T) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    clear() {
      window.localStorage.removeItem(key);
    },
  };
}

/** Key for the état de partie, shared by every screen ticket. */
export const GAME_STATE_KEY = "imposteur.etat.v1";
