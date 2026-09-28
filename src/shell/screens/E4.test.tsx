import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../settings";
import { loadGameState, saveGameState } from "../../state/gameState";
import { E4 } from "./E4";

function seed(seen: Record<string, boolean> = {}) {
  saveGameState({
    players: ["Léa", "Hugo", "Inès"],
    settings: DEFAULT_SETTINGS,
    cardPlayer: null,
    game: {
      cat: "Boissons",
      civilWord: "Coca",
      imposteurWord: "Fanta",
      roles: { Léa: "civil", Hugo: "imposteur", Inès: "mr-white" },
      starter: "Léa",
      seen,
    },
  });
}

describe("E4", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the progress copy and unseen tiles, with 'Commencer le tour 1' absent", () => {
    seed();
    render(<E4 onNavigate={vi.fn()} />);
    expect(screen.getByText(/0 sur 3 ont vu leur mot/)).toBeInTheDocument();
    expect(screen.getAllByText("À toi de voir")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Commencer le tour 1" })).not.toBeInTheDocument();
  });

  it("tapping an unseen tile navigates to E5 with that player as cardPlayer", async () => {
    seed();
    const onNavigate = vi.fn();
    render(<E4 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText("Léa"));
    expect(onNavigate).toHaveBeenCalledWith("E5");
    expect(loadGameState().cardPlayer).toBe("Léa");
  });

  it("tapping a seen tile requires confirmation before returning to E5", async () => {
    seed({ Léa: true });
    const onNavigate = vi.fn();
    render(<E4 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText("Léa"));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Revoir le mot de Léa ?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Oui, c'est moi" }));
    expect(onNavigate).toHaveBeenCalledWith("E5");
    expect(loadGameState().cardPlayer).toBe("Léa");
  });

  it("cancelling the confirmation does not navigate", async () => {
    seed({ Léa: true });
    const onNavigate = vi.fn();
    render(<E4 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText("Léa"));
    await userEvent.click(screen.getByRole("button", { name: "Non" }));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText("Revoir le mot de Léa ?")).not.toBeInTheDocument();
  });

  it("enables 'Commencer le tour 1' only once every player has seen their word", async () => {
    seed({ Léa: true, Hugo: true });
    const onNavigate = vi.fn();
    render(<E4 onNavigate={onNavigate} />);
    expect(screen.queryByRole("button", { name: "Commencer le tour 1" })).not.toBeInTheDocument();

    seed({ Léa: true, Hugo: true, Inès: true });
    render(<E4 onNavigate={onNavigate} />);
    expect(screen.getByText(/3 sur 3 ont vu leur mot/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Commencer le tour 1" }));
    expect(onNavigate).toHaveBeenCalledWith("E6");
  });
});
