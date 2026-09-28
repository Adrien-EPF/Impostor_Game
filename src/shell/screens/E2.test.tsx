import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadGameState, saveGameState } from "../../state/gameState";
import { E2 } from "./E2";

function addPlayer(name: string) {
  return async () => {
    await userEvent.type(screen.getByPlaceholderText("Prénom du joueur"), name);
    await userEvent.click(screen.getByRole("button", { name: "Ajouter" }));
  };
}

describe("E2", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty, showing the empty-state box and a disabled Continuer", () => {
    render(<E2 onNavigate={vi.fn()} />);
    expect(screen.getByText("Ajoute au moins 3 prénoms pour commencer.")).toBeInTheDocument();
    expect(screen.getByText("0 / 20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuer" })).toBeDisabled();
    expect(screen.getByText("Encore 3 prénoms pour pouvoir jouer.")).toBeInTheDocument();
  });

  it("restores a previously-entered player list", () => {
    saveGameState({ players: ["Léa", "Sacha"] });
    render(<E2 onNavigate={vi.fn()} />);
    expect(screen.getByDisplayValue("Léa")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sacha")).toBeInTheDocument();
    expect(screen.getByText("2 / 20")).toBeInTheDocument();
  });

  it("adds a player via the button and via Enter, persisting after each add", async () => {
    render(<E2 onNavigate={vi.fn()} />);
    await addPlayer("Léa")();
    expect(screen.getByDisplayValue("Léa")).toBeInTheDocument();
    expect(loadGameState().players).toEqual(["Léa"]);

    await userEvent.type(screen.getByPlaceholderText("Prénom du joueur"), "Sacha{Enter}");
    expect(screen.getByDisplayValue("Sacha")).toBeInTheDocument();
    expect(loadGameState().players).toEqual(["Léa", "Sacha"]);
  });

  it("leaves the input untouched when Enter is pressed on whitespace-only text", async () => {
    render(<E2 onNavigate={vi.fn()} />);
    const input = screen.getByPlaceholderText("Prénom du joueur");
    await userEvent.type(input, "   {Enter}");
    expect(input).toHaveValue("   ");
    expect(loadGameState().players).toEqual([]);
  });

  it("flags a duplicate add with the exact caption and does not add it", async () => {
    render(<E2 onNavigate={vi.fn()} />);
    await addPlayer("Léa")();
    await addPlayer("léa")();
    expect(screen.getByText("« léa » est déjà dans la liste.")).toBeInTheDocument();
    expect(loadGameState().players).toEqual(["Léa"]);
  });

  it("renames a player in place, reorders and deletes", async () => {
    saveGameState({ players: ["Léa", "Sacha", "Nour"] });
    render(<E2 onNavigate={vi.fn()} />);

    await userEvent.clear(screen.getByDisplayValue("Sacha"));
    await userEvent.type(screen.getByLabelText("Prénom du joueur 2"), "Yanis");
    expect(loadGameState().players).toEqual(["Léa", "Yanis", "Nour"]);

    await userEvent.click(screen.getAllByRole("button", { name: "Monter" })[1]);
    expect(loadGameState().players).toEqual(["Yanis", "Léa", "Nour"]);

    await userEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[2]);
    expect(loadGameState().players).toEqual(["Yanis", "Léa"]);
  });

  it("flags an empty renamed row as invalid and blocks Continuer", async () => {
    saveGameState({ players: ["Léa", "Sacha", "Nour"] });
    render(<E2 onNavigate={vi.fn()} />);

    await userEvent.clear(screen.getByDisplayValue("Sacha"));
    expect(screen.getByText("Vide")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuer" })).toBeDisabled();
    expect(screen.getByText("Corrige les prénoms en double ou vides.")).toBeInTheDocument();
  });

  it("enables Continuer at 3+ valid unique players and navigates to E3", async () => {
    saveGameState({ players: ["Léa", "Sacha", "Nour"] });
    const onNavigate = vi.fn();
    render(<E2 onNavigate={onNavigate} />);

    const continueButton = screen.getByRole("button", { name: "Continuer" });
    expect(continueButton).toBeEnabled();
    await userEvent.click(continueButton);
    expect(onNavigate).toHaveBeenCalledWith("E3");
  });

  it("disables Ajouter once 20 players are reached and shows the cap caption", async () => {
    saveGameState({ players: Array.from({ length: 20 }, (_, i) => `Joueur ${i + 1}`) });
    render(<E2 onNavigate={vi.fn()} />);
    expect(screen.getByText("20 / 20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });
});
