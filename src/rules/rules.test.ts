import { describe, expect, it } from "vitest";
import type { WordGroup } from "../library";
import type { Role } from "./rules";
import { assignRoles, checkVictory, drawGroup, nextChanceFinale, pickStarter, resolveTurn, shuffle } from "./rules";

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

const BASE_CHECK = { turn: 1, toursMode: false, toursTarget: 99, mrWhiteGuessedCorrectly: false };

describe("checkVictory (RG05)", () => {
  it("declares a civils win by elimination once 0 infiltrés are alive", () => {
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil" };
    expect(checkVictory({ ...BASE_CHECK, alivePlayers: ["A", "B", "C"], roles })).toEqual({
      winner: "civils",
      cause: "elimination",
    });
  });

  it("declares an infiltrés win by parité at 8 players / 3 infiltrés once down to 3 alive each side", () => {
    // 8 players, 3 infiltrés: parité hits the instant 3 civils are eliminated (5 civils gone to 2 would be past it —
    // here 3 civils remain alive, matching the 3 infiltrés still alive).
    const roles: Record<string, Role> = {
      C1: "civil",
      C2: "civil",
      C3: "civil",
      C4: "civil",
      C5: "civil",
      I1: "imposteur",
      I2: "imposteur",
      I3: "mr-white",
    };
    const alive = ["C1", "C2", "C3", "I1", "I2", "I3"]; // 3 civils eliminated, 3 civils + 3 infiltrés alive
    expect(checkVictory({ ...BASE_CHECK, alivePlayers: alive, roles })).toEqual({
      winner: "infiltres",
      cause: "parite",
    });
  });

  it("does not declare parité while civils still outnumber infiltrés", () => {
    const roles: Record<string, Role> = { C1: "civil", C2: "civil", C3: "civil", I1: "imposteur" };
    expect(checkVictory({ ...BASE_CHECK, alivePlayers: ["C1", "C2", "C3", "I1"], roles })).toBeNull();
  });

  it("a correct Mr. White guess wins outright, even with civils numerically ahead", () => {
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil", D: "mr-white" };
    expect(
      checkVictory({ ...BASE_CHECK, alivePlayers: ["A", "B", "C", "D"], roles, mrWhiteGuessedCorrectly: true }),
    ).toEqual({ winner: "infiltres", cause: "mr-white" });
  });

  it("in 'Nombre de tours' mode, an infiltré alive after turn >= N wins by survie", () => {
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil", D: "imposteur" };
    expect(
      checkVictory({
        alivePlayers: ["A", "B", "C", "D"],
        roles,
        turn: 2,
        toursMode: true,
        toursTarget: 2,
        mrWhiteGuessedCorrectly: false,
      }),
    ).toEqual({ winner: "infiltres", cause: "survie" });
  });

  it("does not apply the survie clause in mode Classique", () => {
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil", D: "imposteur" };
    expect(
      checkVictory({
        alivePlayers: ["A", "B", "C", "D"],
        roles,
        turn: 99,
        toursMode: false,
        toursTarget: 2,
        mrWhiteGuessedCorrectly: false,
      }),
    ).toBeNull();
  });

  it("returns null and lets the game continue when nothing is resolved", () => {
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil", D: "imposteur" };
    expect(checkVictory({ ...BASE_CHECK, alivePlayers: ["A", "B", "C", "D"], roles })).toBeNull();
  });
});

describe("resolveTurn", () => {
  it("advances the turn and draws a new starter (RG03) when nobody won", () => {
    const players = ["A", "B", "C", "D"];
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil", D: "imposteur" };
    const outcome = resolveTurn({
      players,
      roles,
      eliminated: [],
      turn: 1,
      toursMode: false,
      toursTarget: 99,
      mrWhiteGuessedCorrectly: false,
    });
    expect(outcome.winner).toBeNull();
    expect(outcome.turn).toBe(2);
    expect(outcome.starter).not.toBeNull();
    expect(roles[outcome.starter!]).not.toBe("mr-white");
  });

  it("stops advancing the turn once a side has won", () => {
    const players = ["A", "B", "C"];
    const roles: Record<string, Role> = { A: "civil", B: "civil", C: "civil" };
    const outcome = resolveTurn({
      players,
      roles,
      eliminated: [],
      turn: 3,
      toursMode: false,
      toursTarget: 99,
      mrWhiteGuessedCorrectly: false,
    });
    expect(outcome).toEqual({ winner: "civils", cause: "elimination", turn: 3, starter: null });
  });
});

describe("nextChanceFinale (RG09)", () => {
  it("returns the first living, never-eliminated Mr. White without a recorded guess", () => {
    const players = ["A", "B", "C"];
    const roles: Record<string, Role> = { A: "civil", B: "mr-white", C: "mr-white" };
    expect(nextChanceFinale(players, roles, [], {})).toBe("B");
  });

  it("skips an eliminated Mr. White and one who already has a recorded guess", () => {
    const players = ["A", "B", "C"];
    const roles: Record<string, Role> = { A: "civil", B: "mr-white", C: "mr-white" };
    expect(nextChanceFinale(players, roles, ["B"], {})).toBe("C");
    expect(nextChanceFinale(players, roles, [], { B: true })).toBe("C");
  });

  it("returns null once every living Mr. White has a recorded guess", () => {
    const players = ["A", "B"];
    const roles: Record<string, Role> = { A: "civil", B: "mr-white" };
    expect(nextChanceFinale(players, roles, [], { B: false })).toBeNull();
  });
});
