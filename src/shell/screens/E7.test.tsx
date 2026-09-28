import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../settings";
import type { Settings } from "../../settings";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { Role } from "../../rules";
import { E7 } from "./E7";

function seed(opts: {
  players: string[];
  roles: Record<string, Role>;
  elimTarget: string;
  eliminated?: string[];
  mrWhiteGuesses?: Record<string, boolean>;
  civilWord?: string;
  turn?: number;
  settings?: Settings;
}) {
  saveGameState({
    players: opts.players,
    settings: opts.settings ?? DEFAULT_SETTINGS,
    cardPlayer: null,
    elimTarget: opts.elimTarget,
    game: {
      cat: "Boissons",
      civilWord: opts.civilWord ?? "Coca",
      imposteurWord: "Fanta",
      roles: opts.roles,
      starter: opts.players[0],
      seen: {},
      turn: opts.turn ?? 1,
      eliminated: opts.eliminated ?? [],
      winner: null,
      cause: null,
      mrWhiteGuesses: opts.mrWhiteGuesses ?? {},
    },
  });
}

describe("E7 — base (non-Mr.-White) path", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the pre-confirmation checkbox card with the button disabled until checked, and no cancel button", () => {
    seed({ players: ["Léa", "Hugo", "Inès"], roles: { Léa: "civil", Hugo: "civil", Inès: "civil" }, elimTarget: "Hugo" });
    render(<E7 onNavigate={vi.fn()} />);
    expect(screen.getByText("Hugo", { selector: ".e7__name" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer l'élimination" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /annuler/i })).not.toBeInTheDocument();
  });

  it("confirming persists the elimination immediately and reveals the role, with no cancel afterwards either", async () => {
    seed({ players: ["Léa", "Hugo", "Inès"], roles: { Léa: "civil", Hugo: "civil", Inès: "civil" }, elimTarget: "Hugo" });
    render(<E7 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Confirmer l'élimination" }));
    expect(loadGameState().game?.eliminated).toEqual(["Hugo"]);
    expect(screen.getByText("Hugo était Civil")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /annuler/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
  });

  it("'Continuer' resolves the turn (RG05) and navigates to E6 when nobody has won", async () => {
    seed({
      players: ["Léa", "Hugo", "Sam", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Sam: "civil", Inès: "imposteur" },
      elimTarget: "Hugo",
      eliminated: ["Hugo"],
    });
    const onNavigate = vi.fn();
    render(<E7 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(onNavigate).toHaveBeenCalledWith("E6");
    expect(loadGameState().elimTarget).toBeNull();
  });

  it("'Continuer' navigates to E8 once eliminating this player ends the game", async () => {
    seed({
      players: ["Léa", "Hugo"],
      roles: { Léa: "civil", Hugo: "imposteur" },
      elimTarget: "Hugo",
      eliminated: ["Hugo"],
    });
    const onNavigate = vi.fn();
    render(<E7 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(onNavigate).toHaveBeenCalledWith("E8");
    expect(loadGameState().game?.winner).toBe("civils");
  });
});

describe("E7 — Mr. White path", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the 'Dernière chance' guess panel after confirming a Mr. White elimination, never showing the civils' word", async () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "mr-white" },
      elimTarget: "Inès",
    });
    render(<E7 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Confirmer l'élimination" }));
    expect(screen.getByText("Dernière chance, Inès")).toBeInTheDocument();
    expect(screen.queryByText("Coca")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continuer" })).not.toBeInTheDocument();
  });

  it("a correct guess ends the game immediately as a Mr. White win, even with civils numerically ahead", async () => {
    seed({
      players: ["Léa", "Hugo", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Inès: "mr-white" },
      elimTarget: "Inès",
      eliminated: ["Inès"],
      civilWord: "Coca",
    });
    const onNavigate = vi.fn();
    render(<E7 onNavigate={onNavigate} />);
    await userEvent.type(screen.getByPlaceholderText("Le mot des civils"), "Coca");
    await userEvent.click(screen.getByRole("button", { name: "Valider le mot" }));
    expect(onNavigate).toHaveBeenCalledWith("E8");
    const game = loadGameState().game!;
    expect(game.winner).toBe("infiltres");
    expect(game.cause).toBe("mr-white");
    expect(game.mrWhiteGuesses.Inès).toBe(true);
  });

  it("a wrong guess shows 'Raté' without ending the game, then 'Continuer' resolves the turn normally", async () => {
    seed({
      players: ["Léa", "Hugo", "Sam", "Inès"],
      roles: { Léa: "civil", Hugo: "civil", Sam: "imposteur", Inès: "mr-white" },
      elimTarget: "Inès",
      eliminated: ["Inès"],
      civilWord: "Coca",
    });
    const onNavigate = vi.fn();
    render(<E7 onNavigate={onNavigate} />);
    await userEvent.type(screen.getByPlaceholderText("Le mot des civils"), "Fanta");
    await userEvent.click(screen.getByRole("button", { name: "Valider le mot" }));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Raté. « Fanta » n'est pas le mot des civils.")).toBeInTheDocument();
    expect(loadGameState().game?.mrWhiteGuesses.Inès).toBe(false);

    await userEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(onNavigate).toHaveBeenCalledWith("E6");
  });
});
