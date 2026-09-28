import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../settings";
import { loadGameState, saveGameState } from "../../state/gameState";
import { E5 } from "./E5";

function seedCard(cardPlayer: string) {
  saveGameState({
    players: ["Léa", "Hugo", "Inès"],
    settings: DEFAULT_SETTINGS,
    cardPlayer,
    elimTarget: null,
    game: {
      cat: "Boissons",
      civilWord: "Coca",
      imposteurWord: "Fanta",
      roles: { Léa: "civil", Hugo: "imposteur", Inès: "mr-white" },
      starter: "Léa",
      seen: {},
      turn: 1,
      eliminated: [],
      winner: null,
      cause: null,
      mrWhiteGuesses: {},
    },
  });
}

describe("E5", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps the civil's word hidden until 'Afficher mon mot', then shows it", async () => {
    seedCard("Léa");
    render(<E5 onNavigate={vi.fn()} />);
    expect(screen.queryByText("Coca")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.getByText("Coca")).toBeInTheDocument();
  });

  it("shows the imposteur a different word from the same group, with no mention of 'imposteur'", async () => {
    seedCard("Hugo");
    render(<E5 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.getByText("Fanta")).toBeInTheDocument();
    expect(screen.queryByText(/imposteur/i)).not.toBeInTheDocument();
  });

  it("shows Mr. White no word at all", async () => {
    seedCard("Inès");
    render(<E5 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.queryByText("Coca")).not.toBeInTheDocument();
    expect(screen.queryByText("Fanta")).not.toBeInTheDocument();
  });

  it("removes the word from the DOM after 'J'ai mémorisé' and marks the player seen, returning to E4", async () => {
    seedCard("Léa");
    const onNavigate = vi.fn();
    render(<E5 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.getByText("Coca")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "J'ai mémorisé" }));
    expect(screen.queryByText("Coca")).not.toBeInTheDocument();
    expect(loadGameState().game?.seen.Léa).toBe(true);
    expect(loadGameState().cardPlayer).toBeNull();
    await vi.waitFor(() => expect(onNavigate).toHaveBeenCalledWith("E4"));
  });
});
