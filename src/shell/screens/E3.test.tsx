import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveGameState } from "../../state/gameState";
import { loadRememberedSettings } from "../../state/rememberedSettings";
import { DEFAULT_SETTINGS } from "../../settings";
import { E3 } from "./E3";

function seed(players: string[]) {
  saveGameState({ players, settings: DEFAULT_SETTINGS, game: null, cardPlayer: null, elimTarget: null });
}

function toursValue() {
  const row = screen.getByText("Tours (N)").closest(".e3__stepper-row");
  if (!row) throw new Error("tours row not found");
  return within(row as HTMLElement).getByText(/^\d+$/).textContent;
}

describe("E3", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the composition summary and defaults (1 imposteur, 0 Mr. White, mode Classique)", () => {
    seed(["A", "B", "C", "D", "E", "F", "G", "H"]);
    render(<E3 onNavigate={vi.fn()} />);
    expect(screen.getByText("8 joueurs")).toBeInTheDocument();
    expect(screen.getByText("→ 7 civils · 1 infiltré · 3 infiltrés max")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Classique" })).toHaveAttribute("aria-pressed", "true");
  });

  it("blocks 'Lancer la partie' with the exact RG01 message at 4 infiltrés for 8 players, and allows 3", async () => {
    seed(["A", "B", "C", "D", "E", "F", "G", "H"]);
    render(<E3 onNavigate={vi.fn()} />);
    const incImp = screen.getByRole("button", { name: "Plus d'imposteurs" });
    await userEvent.click(incImp);
    await userEvent.click(incImp);
    await userEvent.click(incImp);
    // 4 imposteurs now => 4 infiltrés, blocked
    expect(screen.getByRole("button", { name: "Lancer la partie" })).toBeDisabled();
    expect(
      screen.getAllByText(
        "Trop d'infiltrés : il faut plus de civils que d'infiltrés. Avec 8 joueurs, 3 infiltrés au maximum.",
      ).length,
    ).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "Moins d'imposteurs" }));
    // back down to 3 infiltrés, the max, which is allowed
    expect(screen.getByRole("button", { name: "Lancer la partie" })).not.toBeDisabled();
  });

  it("defaults the tours (N) stepper to joueurs - 2 (min 1) when Nombre de tours is selected", async () => {
    seed(["A", "B", "C", "D", "E"]);
    render(<E3 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Nombre de tours" }));
    expect(toursValue()).toBe("3");
  });

  it("clamps the tours default at a minimum of 1", async () => {
    seed(["A", "B", "C"]);
    render(<E3 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Nombre de tours" }));
    expect(toursValue()).toBe("1");
  });

  it("disables 'Lancer la partie' with the exact message when every category is deselected", async () => {
    seed(["A", "B", "C", "D", "E", "F", "G", "H"]);
    render(<E3 onNavigate={vi.fn()} />);
    const categories = ["Boissons", "Animaux", "Sports", "Cuisine", "Lieux", "Musique", "Transports", "Métiers", "Objets"];
    for (const cat of categories) {
      await userEvent.click(screen.getByRole("button", { name: cat }));
    }
    expect(screen.getByRole("button", { name: "Lancer la partie" })).toBeDisabled();
    expect(screen.getByText("Choisis au moins une catégorie.")).toBeInTheDocument();
  });

  it("persists settings across a reload", async () => {
    seed(["A", "B", "C", "D", "E", "F", "G", "H"]);
    const { unmount } = render(<E3 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Plus d'imposteurs" }));
    unmount();
    render(<E3 onNavigate={vi.fn()} />);
    expect(screen.getByText("→ 6 civils · 2 infiltrés · 3 infiltrés max")).toBeInTheDocument();
  });

  it("navigates to E4 with a finalized settings object on a valid 'Lancer la partie' click", async () => {
    seed(["A", "B", "C", "D", "E", "F", "G", "H"]);
    const onNavigate = vi.fn();
    render(<E3 onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: "Lancer la partie" }));
    expect(onNavigate).toHaveBeenCalledWith("E4");
  });

  it("remembers players/settings under the réglages key on 'Lancer la partie' (F16)", async () => {
    const players = ["A", "B", "C", "D", "E", "F", "G", "H"];
    seed(players);
    render(<E3 onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Plus d'imposteurs" }));
    await userEvent.click(screen.getByRole("button", { name: "Lancer la partie" }));
    expect(loadRememberedSettings()).toEqual({ players, settings: { ...DEFAULT_SETTINGS, imposteurs: 2 } });
  });
});
