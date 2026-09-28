import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../settings";
import type { Cause, Role, Winner } from "../../rules";
import { loadGameState, saveGameState } from "../../state/gameState";
import { E8 } from "./E8";

function seed(opts: {
  players: string[];
  roles: Record<string, Role>;
  eliminated: string[];
  winner: Winner;
  cause: Cause;
  turn?: number;
  mrWhiteGuesses?: Record<string, boolean>;
  civilWord?: string;
  imposteurWord?: string;
}) {
  saveGameState({
    players: opts.players,
    settings: DEFAULT_SETTINGS,
    cardPlayer: null,
    elimTarget: null,
    game: {
      cat: "Boissons",
      civilWord: opts.civilWord ?? "Coca",
      imposteurWord: opts.imposteurWord ?? "Fanta",
      roles: opts.roles,
      starter: opts.players[0],
      seen: {},
      turn: opts.turn ?? 3,
      eliminated: opts.eliminated,
      winner: opts.winner,
      cause: opts.cause,
      mrWhiteGuesses: opts.mrWhiteGuesses ?? {},
    },
  });
}

describe("E8 — results screen", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the winner banner, words, category/turns and the per-player board", () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
      eliminated: ["Inès"],
      winner: "civils",
      cause: "elimination",
    });
    render(<E8 onNavigate={vi.fn()} />);
    expect(screen.getByText("Les civils gagnent")).toBeInTheDocument();
    expect(screen.getByText("Tous les infiltrés sont démasqués")).toBeInTheDocument();
    expect(screen.getByText("Coca", { selector: ".e8__stat-value" })).toBeInTheDocument();
    expect(screen.getByText("Fanta", { selector: ".e8__stat-value" })).toBeInTheDocument();
    expect(screen.getByText("Boissons · 3 tours")).toBeInTheDocument();
    expect(screen.getAllByText("En vie").length).toBe(2);
    expect(screen.getByText("Éliminé·e (1ᵉ)")).toBeInTheDocument();
  });

  it("hides the imposteurs' word when there is no imposteur in the game", () => {
    seed({
      players: ["Léa", "Hugo"],
      roles: { Léa: "civil", Hugo: "mr-white" },
      eliminated: ["Hugo"],
      winner: "civils",
      cause: "elimination",
      mrWhiteGuesses: { Hugo: false },
    });
    render(<E8 onNavigate={vi.fn()} />);
    expect(screen.queryByText("Fanta")).not.toBeInTheDocument();
  });

  it("'Rejouer' keeps the same players and settings but draws a new game (RG08) and goes to E4", async () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
      eliminated: ["Inès"],
      winner: "civils",
      cause: "elimination",
    });
    const onNavigate = vi.fn();
    render(<E8 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Rejouer" }));
    expect(onNavigate).toHaveBeenCalledWith("E4");
    const state = loadGameState();
    expect(state.players).toEqual(["Léa", "Hugo", "Inès"]);
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
    expect(state.game?.turn).toBe(1);
    expect(state.game?.eliminated).toEqual([]);
    expect(state.game?.winner).toBeNull();
  });

  it("'Nouvelle partie' clears the game and goes to E2", async () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
      eliminated: ["Inès"],
      winner: "civils",
      cause: "elimination",
    });
    const onNavigate = vi.fn();
    render(<E8 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Nouvelle partie" }));
    expect(onNavigate).toHaveBeenCalledWith("E2");
    expect(loadGameState().game).toBeNull();
    expect(loadGameState().players).toEqual(["Léa", "Hugo", "Inès"]);
  });
});

describe("E8 — Chance finale (RG09)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("offers a surviving Mr. White a Chance finale attempt before the results, without changing the outcome", async () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "mr-white" },
      eliminated: ["Léa", "Hugo"],
      winner: "infiltres",
      cause: "parite",
      civilWord: "Coca",
    });
    render(<E8 onNavigate={vi.fn()} />);
    expect(screen.getByText(/Chance finale/)).toBeInTheDocument();
    expect(screen.getByText(/Inès, tu as survécu/)).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("Le mot des civils"), "Coca");
    await userEvent.click(screen.getByRole("button", { name: "Deviner le mot" }));
    expect(screen.getByText("Bien joué, Inès : c'était bien le mot !")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Voir le résultat" }));
    expect(screen.getByText("Les infiltrés gagnent")).toBeInTheDocument();
    expect(loadGameState().game?.mrWhiteGuesses.Inès).toBe(true);
    expect(loadGameState().game?.winner).toBe("infiltres");
  });

  it("lets each of several surviving Mr. Whites guess independently", async () => {
    seed({
      players: ["Léa", "Inès", "Max"],
      roles: { Léa: "civil", Inès: "mr-white", Max: "mr-white" },
      eliminated: ["Léa"],
      winner: "infiltres",
      cause: "parite",
      civilWord: "Coca",
    });
    render(<E8 onNavigate={vi.fn()} />);
    // First Mr. White guesses wrong.
    await userEvent.type(screen.getByPlaceholderText("Le mot des civils"), "Fanta");
    await userEvent.click(screen.getByRole("button", { name: "Deviner le mot" }));
    expect(screen.getByText(/Raté/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Mr. White suivant" }));

    // Second Mr. White gets their own attempt and guesses right.
    expect(screen.getByPlaceholderText("Le mot des civils")).toHaveValue("");
    await userEvent.type(screen.getByPlaceholderText("Le mot des civils"), "Coca");
    await userEvent.click(screen.getByRole("button", { name: "Deviner le mot" }));
    expect(screen.getByText(/c'était bien le mot/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Voir le résultat" }));

    const game = loadGameState().game!;
    expect(game.mrWhiteGuesses.Inès).toBe(false);
    expect(game.mrWhiteGuesses.Max).toBe(true);
    expect(game.winner).toBe("infiltres");
  });
});
