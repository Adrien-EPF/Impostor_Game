import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../settings";
import type { Settings } from "../../settings";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { Role } from "../../rules";
import { E6 } from "./E6";

function seed(opts: {
  players: string[];
  roles: Record<string, Role>;
  eliminated?: string[];
  turn?: number;
  starter?: string | null;
  settings?: Settings;
}) {
  saveGameState({
    players: opts.players,
    settings: opts.settings ?? DEFAULT_SETTINGS,
    cardPlayer: null,
    elimTarget: null,
    game: {
      cat: "Boissons",
      civilWord: "Coca",
      imposteurWord: "Fanta",
      roles: opts.roles,
      starter: opts.starter ?? opts.players[0],
      seen: {},
      turn: opts.turn ?? 1,
      eliminated: opts.eliminated ?? [],
      winner: null,
      cause: null,
      mrWhiteGuesses: {},
    },
  });
}

describe("E6", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the turn/starter banner and the living players as tiles, éliminés hidden when empty", () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
      starter: "Hugo",
    });
    render(<E6 onNavigate={vi.fn()} />);
    expect(screen.getByText("n° 1")).toBeInTheDocument();
    expect(screen.getByText("Hugo", { selector: ".e6__tile-value" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "En jeu · 3" })).toBeInTheDocument();
    expect(screen.queryByText(/Éliminés/)).not.toBeInTheDocument();
  });

  it("shows the tour/N banner in mode Nombre de tours", () => {
    seed({
      players: ["Léa", "Hugo", "Inès", "Max", "Sacha"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "civil", Max: "civil", Sacha: "imposteur" },
      settings: { ...DEFAULT_SETTINGS, mode: "tours", tours: 3 },
    });
    render(<E6 onNavigate={vi.fn()} />);
    expect(screen.getByText("Tour · objectif 3")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("shows éliminés with their role permanently revealed (animate=false)", () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
      eliminated: ["Inès"],
    });
    render(<E6 onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Éliminés · 1" })).toBeInTheDocument();
    expect(screen.getByText("Inès")).toBeInTheDocument();
    expect(screen.getByText("Imposteur")).toBeInTheDocument();
  });

  it("tapping a living player navigates to E7 with that player as elimTarget", async () => {
    seed({ players: ["Léa", "Hugo", "Inès"], roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" } });
    const onNavigate = vi.fn();
    render(<E6 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Hugo" }));
    expect(onNavigate).toHaveBeenCalledWith("E7");
    expect(loadGameState().elimTarget).toBe("Hugo");
  });

  it("'Personne n'est éliminé' advances the turn and draws a new starter (RG03), staying on E6", async () => {
    seed({ players: ["Léa", "Hugo", "Inès"], roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" } });
    const onNavigate = vi.fn();
    render(<E6 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Personne n'est éliminé" }));
    expect(onNavigate).toHaveBeenCalledWith("E6");
    const game = loadGameState().game!;
    expect(game.turn).toBe(2);
    expect(game.starter).not.toBeNull();
    expect(game.roles[game.starter!]).not.toBe("mr-white");
  });

  it("hides the speech timer when disabled (default), so it neither appears nor affects layout (F19)", () => {
    seed({ players: ["Léa", "Hugo", "Inès"], roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" } });
    render(<E6 onNavigate={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Démarrer le minuteur" })).not.toBeInTheDocument();
  });

  it("shows the speech timer when enabled, counts down, and signals expiry without blocking other E6 actions (F19)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      seed({
        players: ["Léa", "Hugo", "Inès"],
        roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
        settings: { ...DEFAULT_SETTINGS, timerEnabled: true, timerSeconds: 10 },
      });
      const onNavigate = vi.fn();
      render(<E6 onNavigate={onNavigate} />);

      expect(screen.getByText("0:10")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Démarrer le minuteur" }));
      await vi.advanceTimersByTimeAsync(3000);
      expect(screen.getByText("0:07")).toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(7000);
      expect(screen.getByText("Temps écoulé")).toBeInTheDocument();

      // Expiry doesn't block the rest of E6: elimination still navigates normally.
      await userEvent.click(screen.getByRole("button", { name: "Hugo" }));
      expect(onNavigate).toHaveBeenCalledWith("E7");
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets the speech timer to the configured duration on a new turn (F19)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      seed({
        players: ["Léa", "Hugo", "Inès"],
        roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
        settings: { ...DEFAULT_SETTINGS, timerEnabled: true, timerSeconds: 10 },
      });
      const onNavigate = vi.fn();
      render(<E6 onNavigate={onNavigate} />);
      await userEvent.click(screen.getByRole("button", { name: "Démarrer le minuteur" }));
      await vi.advanceTimersByTimeAsync(4000);
      expect(screen.getByText("0:06")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Personne n'est éliminé" }));
      expect(onNavigate).toHaveBeenCalledWith("E6");
      expect(screen.getByText("0:10")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("ending the game via 'Personne n'est éliminé' (0 infiltrés alive) navigates to E8 with a civils win", async () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
      eliminated: ["Inès"],
    });
    const onNavigate = vi.fn();
    render(<E6 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Personne n'est éliminé" }));
    expect(onNavigate).toHaveBeenCalledWith("E8");
    const game = loadGameState().game!;
    expect(game.winner).toBe("civils");
    expect(game.cause).toBe("elimination");
  });
});
