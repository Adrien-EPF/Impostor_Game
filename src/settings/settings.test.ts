import { describe, expect, it } from "vitest";
import type { WordGroup } from "../library";
import {
  DEFAULT_SETTINGS,
  MAX_TIMER_SECONDS,
  MIN_TIMER_SECONDS,
  activeGroups,
  clampTimerSeconds,
  composition,
  effectiveTours,
  launchBlockedReason,
  maxInfiltres,
  toggleCategory,
} from "./settings";

const GROUPS: WordGroup[] = [
  { cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea"] },
  { cat: "Animaux", words: ["Chat", "Tigre", "Lion", "Lynx"] },
  { cat: "Animaux", words: ["Dauphin", "Requin", "Baleine", "Orque"] },
];

describe("DEFAULT_SETTINGS (F19)", () => {
  it("has the speech timer off by default", () => {
    expect(DEFAULT_SETTINGS.timerEnabled).toBe(false);
    expect(DEFAULT_SETTINGS.timerSeconds).toBe(60);
  });
});

describe("clampTimerSeconds", () => {
  it("clamps to [MIN_TIMER_SECONDS, MAX_TIMER_SECONDS]", () => {
    expect(clampTimerSeconds(MIN_TIMER_SECONDS - 10)).toBe(MIN_TIMER_SECONDS);
    expect(clampTimerSeconds(MAX_TIMER_SECONDS + 10)).toBe(MAX_TIMER_SECONDS);
    expect(clampTimerSeconds(90)).toBe(90);
  });
});

describe("maxInfiltres", () => {
  it("is floor((n-1)/2)", () => {
    expect(maxInfiltres(3)).toBe(1);
    expect(maxInfiltres(8)).toBe(3);
    expect(maxInfiltres(1)).toBe(0);
  });
});

describe("composition", () => {
  it("derives civils/infiltrés from imposteurs + Mr. White", () => {
    expect(composition(8, { ...DEFAULT_SETTINGS, imposteurs: 2, mrWhite: 1 })).toEqual({
      infiltres: 3,
      civils: 5,
      maxInfiltres: 3,
    });
  });

  it("never reports negative civils when infiltrés exceeds player count", () => {
    expect(composition(3, { ...DEFAULT_SETTINGS, imposteurs: 5, mrWhite: 0 }).civils).toBe(0);
  });
});

describe("compositionError / launchBlockedReason (RG01)", () => {
  it("blocks with the exact message when there are zero infiltrés", () => {
    const reason = launchBlockedReason(8, { ...DEFAULT_SETTINGS, imposteurs: 0, mrWhite: 0 }, GROUPS);
    expect(reason).toEqual({
      kind: "composition",
      message: "Il faut au moins un infiltré (imposteur ou Mr. White).",
    });
  });

  it("at 8 players, 4 infiltrés (imposteurs+Mr.White) is blocked with the exact message", () => {
    const reason = launchBlockedReason(8, { ...DEFAULT_SETTINGS, imposteurs: 3, mrWhite: 1 }, GROUPS);
    expect(reason).toEqual({
      kind: "composition",
      message: "Trop d'infiltrés : il faut plus de civils que d'infiltrés. Avec 8 joueurs, 3 infiltrés au maximum.",
    });
  });

  it("at 8 players, 3 infiltrés is the max and is allowed", () => {
    expect(launchBlockedReason(8, { ...DEFAULT_SETTINGS, imposteurs: 3, mrWhite: 0 }, GROUPS)).toBeNull();
  });

  it("blocks with the exact message when zero categories remain selected", () => {
    const excludedCategories = ["Boissons", "Animaux"];
    const reason = launchBlockedReason(8, { ...DEFAULT_SETTINGS, imposteurs: 1, excludedCategories }, GROUPS);
    expect(reason).toEqual({ kind: "no-categories" });
  });
});

describe("effectiveTours", () => {
  it("defaults to joueurs - 2 (min 1) when tours is null", () => {
    expect(effectiveTours({ ...DEFAULT_SETTINGS, tours: null }, 8)).toBe(6);
    expect(effectiveTours({ ...DEFAULT_SETTINGS, tours: null }, 2)).toBe(1);
  });

  it("uses the explicit value once set", () => {
    expect(effectiveTours({ ...DEFAULT_SETTINGS, tours: 4 }, 8)).toBe(4);
  });
});

describe("toggleCategory", () => {
  it("excludes a category not yet excluded, and re-includes one already excluded", () => {
    expect(toggleCategory([], "Animaux")).toEqual(["Animaux"]);
    expect(toggleCategory(["Animaux"], "Animaux")).toEqual([]);
  });
});

describe("activeGroups", () => {
  it("filters out groups whose category is excluded", () => {
    expect(activeGroups(GROUPS, ["Animaux"])).toEqual([GROUPS[0]]);
  });

  it("new categories default to included (nothing excluded => everything active)", () => {
    expect(activeGroups(GROUPS, [])).toEqual(GROUPS);
  });
});
