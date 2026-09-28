import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";
import { loadGameState, saveGameState } from "./state/gameState";
import { loadRememberedSettings, saveRememberedSettings } from "./state/rememberedSettings";
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

  it("abandoning clears the game but keeps the remembered réglages, distinct from l'état de partie (F16)", async () => {
    saveRememberedSettings({ players: ["Léa", "Hugo", "Inès"], settings: DEFAULT_SETTINGS });
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
    const abandonButtons = screen.getAllByRole("button", { name: "Abandonner" });
    await userEvent.click(abandonButtons[abandonButtons.length - 1]);
    expect(loadRememberedSettings()).toEqual({ players: ["Léa", "Hugo", "Inès"], settings: DEFAULT_SETTINGS });
  });

  it("resumes at the persisted screen after a reload, mid-turn (#9)", () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: null,
      screen: "E6",
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
    expect(screen.getByRole("heading", { name: "En jeu · 3" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("resumes at the persisted screen after a reload, mid-elimination (#9)", () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: "Hugo",
      screen: "E7",
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
    expect(screen.getByText("Hugo", { selector: ".e7__name" })).toBeInTheDocument();
  });

  it("resumes at the persisted screen after a reload, mid-distribution on E4 (#9)", () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: null,
      screen: "E4",
      game: {
        cat: "Boissons",
        civilWord: "Coca",
        imposteurWord: "Fanta",
        roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
        starter: "Léa",
        seen: { Léa: true },
        turn: 1,
        eliminated: [],
        winner: null,
        cause: null,
        mrWhiteGuesses: {},
      },
    });
    render(<App />);
    expect(screen.getByText("1 sur 3 ont vu leur mot.", { exact: false })).toBeInTheDocument();
  });

  it("resumes at the persisted screen after a reload, mid-secret-card on E5 (#9)", async () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: "Hugo",
      elimTarget: null,
      screen: "E5",
      game: {
        cat: "Boissons",
        civilWord: "Coca",
        imposteurWord: "Fanta",
        roles: { Léa: "civil", Hugo: "civil", Inès: "imposteur" },
        starter: "Léa",
        seen: { Léa: true },
        turn: 1,
        eliminated: [],
        winner: null,
        cause: null,
        mrWhiteGuesses: {},
      },
    });
    render(<App />);
    expect(screen.getByText("Hugo")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.getByText("Coca")).toBeInTheDocument();
  });

  it("resumes at the persisted screen after a reload, E7 with a Mr. White guess pending (#9)", () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: "Inès",
      screen: "E7",
      game: {
        cat: "Boissons",
        civilWord: "Coca",
        imposteurWord: "Fanta",
        roles: { Léa: "civil", Hugo: "civil", Inès: "mr-white" },
        starter: "Léa",
        seen: {},
        turn: 1,
        eliminated: ["Inès"],
        winner: null,
        cause: null,
        mrWhiteGuesses: {},
      },
    });
    render(<App />);
    expect(screen.getByText("Dernière chance, Inès")).toBeInTheDocument();
  });

  it("resumes at the persisted screen after a reload, E8 with a Chance finale in progress (#9)", () => {
    saveGameState({
      players: ["Léa", "Hugo", "Inès"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      elimTarget: null,
      screen: "E8",
      game: {
        cat: "Boissons",
        civilWord: "Coca",
        imposteurWord: "Fanta",
        roles: { Léa: "civil", Hugo: "imposteur", Inès: "mr-white" },
        starter: "Léa",
        seen: {},
        turn: 2,
        eliminated: ["Léa"],
        winner: "infiltres",
        cause: "parite",
        mrWhiteGuesses: {},
      },
    });
    render(<App />);
    expect(screen.getByText("Les infiltrés ont gagné · Chance finale")).toBeInTheDocument();
  });

  it("persists the screen across navigation, so a later render resumes there instead of resetting to E1 (#9)", async () => {
    const { unmount } = render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "E2" }));
    unmount();
    render(<App />);
    expect(screen.getByRole("heading", { name: "Qui joue ?" })).toBeInTheDocument();
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
