import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Regles } from "./Regles";

describe("Regles", () => {
  it("shows the title and a role card for each role with its exact copy", () => {
    render(<Regles />);
    expect(screen.getByRole("heading", { name: "Règles du jeu" })).toBeInTheDocument();
    expect(screen.getByText("Civil")).toBeInTheDocument();
    expect(
      screen.getByText("Voit le mot commun à tous les civils. Ne connaît pas son rôle. Doit éliminer tous les infiltrés."),
    ).toBeInTheDocument();
    expect(screen.getByText("Imposteur")).toBeInTheDocument();
    expect(
      screen.getByText("Voit un mot proche, partagé avec les autres imposteurs. Il se croit civil. Doit survivre."),
    ).toBeInTheDocument();
    expect(screen.getByText("Mr. White")).toBeInTheDocument();
    expect(
      screen.getByText("Ne voit aucun mot et le sait. S'il est éliminé, il peut gagner en devinant le mot des civils."),
    ).toBeInTheDocument();
  });

  it("shows Déroulement (4 steps) and Victoire (4 items)", () => {
    render(<Regles />);
    expect(screen.getByRole("heading", { name: "Déroulement" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Victoire" })).toBeInTheDocument();
    expect(
      screen.getByText("Chacun touche son prénom, découvre son mot en privé, le cache, puis passe l'appareil."),
    ).toBeInTheDocument();
    expect(screen.getByText(/tous les imposteurs et Mr\. White sont éliminés\./)).toBeInTheDocument();
    expect(screen.getByText(/autant de civils que d'infiltrés encore en vie \(parité\)\./)).toBeInTheDocument();
  });
});
