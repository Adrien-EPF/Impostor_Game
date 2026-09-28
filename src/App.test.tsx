import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";
import { loadGameState, saveGameState } from "./state/gameState";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts on the E1 screen without a top bar", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Imposteur" })).toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("navigates to another screen via the screen picker, showing the top bar", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "E2" }));
    expect(screen.getByRole("heading", { name: "Qui joue ?" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("hides the top bar again when navigating back to E1", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "E2" }));
    await userEvent.click(screen.getByRole("button", { name: "E1" }));
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("navigates to E2 from E1's 'Nouvelle partie' button", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Nouvelle partie" }));
    expect(screen.getByRole("heading", { name: "Qui joue ?" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("shows 'Abandonner' only on E6, and abandoning clears the game but keeps players/settings (F15)", async () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: null,
      game: {
        cat: "Boissons",
        civilWord: "Coca",
        imposteurWord: "Fanta",
        roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
        starter: "Léa",
        seen: {},
        turn: 1,
        eliminated: [],
        winner: null,
        cause: null,
        mrWhiteGuesses: {},
      },
    });
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "E2" }));
    expect(screen.queryByRole("button", { name: "Abandonner" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "E6" }));
    expect(screen.getByRole("button", { name: "Abandonner" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Abandonner" }));
    expect(screen.getByText("Abandonner la partie ?")).toBeInTheDocument();
    const abandonButtons = screen.getAllByRole("button", { name: "Abandonner" });
    await userEvent.click(abandonButtons[abandonButtons.length - 1]);

    expect(screen.getByRole("heading", { name: "Qui joue ?" })).toBeInTheDocument();
    const state = loadGameState();
    expect(state.game).toBeNull();
    expect(state.players).toEqual(["Léa", "Hugo", "Inès"]);
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("cancelling the abandon modal keeps the game", async () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: null,
      game: {
        cat: "Boissons",
        civilWord: "Coca",
        imposteurWord: "Fanta",
        roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
        starter: "Léa",
        seen: {},
        turn: 1,
        eliminated: [],
        winner: null,
        cause: null,
        mrWhiteGuesses: {},
      },
    });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "E6" }));
    await userEvent.click(screen.getByRole("button", { name: "Abandonner" }));
    await userEvent.click(screen.getByRole("button", { name: "Continuer la partie" }));
    expect(screen.queryByText("Abandonner la partie ?")).not.toBeInTheDocument();
    expect(loadGameState().game).not.toBeNull();
  });
});
