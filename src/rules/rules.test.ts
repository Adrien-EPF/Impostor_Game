import { describe, expect, it } from "vitest";
import type { WordGroup } from "../library";
import { assignRoles, drawGroup, pickStarter, shuffle } from "./rules";

const GROUPS: WordGroup[] = [
  { cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea"] },
  { cat: "Animaux", words: ["Chat", "Tigre", "Lion", "Lynx", "Guépard"] },
];

describe("shuffle", () => {
  it("returns a permutation of the input without mutating it", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual(input);
  });
});

describe("drawGroup (RG02)", () => {
  it("picks a group from the given list and returns two distinct words from it", () => {
    const draw = drawGroup(GROUPS);
    const group = GROUPS.find((g) => g.cat === draw.cat);
    expect(group).toBeDefined();
    expect(group!.words).toContain(draw.civilWord);
    expect(group!.words).toContain(draw.imposteurWord);
    expect(draw.civilWord).not.toBe(draw.imposteurWord);
  });

  it("only draws from the provided (already-filtered) groups", () => {
    const onlyBoissons = [GROUPS[0]];
    for (let i = 0; i < 20; i++) {
      expect(drawGroup(onlyBoissons).cat).toBe("Boissons");
    }
  });
});

describe("assignRoles (RG02)", () => {
  it("assigns exactly imposteurs imposteur, mrWhite mr-white, and the rest civil", () => {
    const players = ["Léa", "Hugo", "Samir", "Chloé", "Max", "Inès", "Tom"];
    const roles = assignRoles(players, 1, 1);
    const values = Object.values(roles);
    expect(values.filter((r) => r === "imposteur")).toHaveLength(1);
    expect(values.filter((r) => r === "mr-white")).toHaveLength(1);
    expect(values.filter((r) => r === "civil")).toHaveLength(5);
    expect(Object.keys(roles).sort()).toEqual([...players].sort());
  });
});

describe("pickStarter (RG03)", () => {
  it("never picks Mr. White as starter, across 100 draws", () => {
    const players = ["Léa", "Hugo", "Samir", "Chloé", "Max", "Inès", "Tom"];
    for (let i = 0; i < 100; i++) {
      const roles = assignRoles(players, 1, 1);
      const starter = pickStarter(players, roles);
      expect(starter).not.toBeNull();
      expect(roles[starter!]).not.toBe("mr-white");
    }
  });

  it("returns null when every player is Mr. White", () => {
    const players = ["Léa", "Hugo"];
    const roles = { Léa: "mr-white", Hugo: "mr-white" } as const;
    expect(pickStarter(players, roles)).toBeNull();
  });
});
