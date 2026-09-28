import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../settings";
import { saveGameState } from "../state/gameState";
import { ScreenSwitcher } from "./ScreenSwitcher";
import { SCREEN_ORDER, SCREEN_LABELS } from "./screens/types";

// E1, E2, E3, E4 and E5 are real screens; every other screen is still a stub.
const STUB_SCREENS = SCREEN_ORDER.filter((id) => !["E1", "E2", "E3", "E4", "E5"].includes(id));

describe("ScreenSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it.each(STUB_SCREENS)("renders the stub screen for %s", (id) => {
    render(<ScreenSwitcher current={id} onNavigate={vi.fn()} />);
    expect(screen.getByText(new RegExp(SCREEN_LABELS[id]))).toBeInTheDocument();
  });

  it("renders the real E1 screen", () => {
    render(<ScreenSwitcher current="E1" onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Imposteur" })).toBeInTheDocument();
  });

  it("renders the real E2 screen", () => {
    render(<ScreenSwitcher current="E2" onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Qui joue ?" })).toBeInTheDocument();
  });

  it("renders the real E3 screen", () => {
    render(<ScreenSwitcher current="E3" onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Réglages" })).toBeInTheDocument();
  });

  it("renders the real E4 screen", () => {
    saveGameState({
      players: ["Léa"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: null,
      game: { cat: "Boissons", civilWord: "Coca", imposteurWord: "Fanta", roles: { Léa: "civil" }, starter: "Léa", seen: {} },
    });
    render(<ScreenSwitcher current="E4" onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Touche ton prénom" })).toBeInTheDocument();
  });

  it("renders the real E5 screen", () => {
    saveGameState({
      players: ["Léa"],
      settings: DEFAULT_SETTINGS,
      cardPlayer: "Léa",
      game: { cat: "Boissons", civilWord: "Coca", imposteurWord: "Fanta", roles: { Léa: "civil" }, starter: "Léa", seen: {} },
    });
    render(<ScreenSwitcher current="E5" onNavigate={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Afficher mon mot" })).toBeInTheDocument();
  });

  it("switches screens when the `current` prop changes", () => {
    const { rerender } = render(<ScreenSwitcher current="E1" onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Imposteur" })).toBeInTheDocument();

    rerender(<ScreenSwitcher current="E2" onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Qui joue ?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Imposteur" })).not.toBeInTheDocument();
  });

  it("passes onNavigate through to the active screen", async () => {
    const onNavigate = vi.fn();
    render(<ScreenSwitcher current="E1" onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Règles" }));
    expect(onNavigate).toHaveBeenCalledWith("regles");
  });
});
