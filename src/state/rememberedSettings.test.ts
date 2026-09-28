import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../settings";
import { REMEMBERED_SETTINGS_KEY } from "./rememberedSettings";
import { loadRememberedSettings, saveRememberedSettings } from "./rememberedSettings";

describe("rememberedSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when no game has ever been launched", () => {
    expect(loadRememberedSettings()).toBeNull();
  });

  it("persists players/settings under the dedicated réglages key, distinct from l'état de partie", () => {
    saveRememberedSettings({ players: ["Léa", "Hugo"], settings: { ...DEFAULT_SETTINGS, imposteurs: 2 } });
    expect(loadRememberedSettings()).toEqual({ players: ["Léa", "Hugo"], settings: { ...DEFAULT_SETTINGS, imposteurs: 2 } });
    expect(JSON.parse(window.localStorage.getItem(REMEMBERED_SETTINGS_KEY)!)).toEqual({
      players: ["Léa", "Hugo"],
      settings: { ...DEFAULT_SETTINGS, imposteurs: 2 },
    });
  });
});
