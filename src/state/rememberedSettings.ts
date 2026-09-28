import type { Settings } from "../settings";
import { createPersistedState } from "./persistedState";

/** Réglages mémorisés (F16): last-used players/settings, distinct from the in-progress état de partie. */
export interface RememberedSettings {
  players: string[];
  settings: Settings;
}

export const REMEMBERED_SETTINGS_KEY = "imposteur.reglages.v1";

const remembered = createPersistedState<RememberedSettings>(REMEMBERED_SETTINGS_KEY);

export function loadRememberedSettings(): RememberedSettings | null {
  return remembered.get();
}

export function saveRememberedSettings(value: RememberedSettings): void {
  remembered.set(value);
}
