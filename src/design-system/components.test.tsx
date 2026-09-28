import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { RoleReveal } from "./RoleReveal";
import { SecretCard } from "./SecretCard";

describe("Button", () => {
  it("renders with the primary variant class by default", () => {
    render(<Button>Continuer</Button>);
    const button = screen.getByRole("button", { name: "Continuer" });
    expect(button).toHaveClass("btn", "btn--primary");
  });

  it("renders the requested variant", () => {
    render(<Button variant="danger">Confirmer l'élimination</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn--danger");
  });
});

describe("RoleReveal", () => {
  it("shows the player's name and role label", () => {
    render(<RoleReveal playerName="Léa" role="imposteur" />);
    expect(screen.getByText("Léa")).toBeInTheDocument();
    expect(screen.getByText("Imposteur")).toBeInTheDocument();
  });
});

describe("SecretCard", () => {
  it("hides the word until 'Afficher mon mot' is pressed, then reveals it", async () => {
    const onReveal = vi.fn();
    render(<SecretCard playerName="Léa" word="Orangina" onReveal={onReveal} />);
    expect(screen.queryByText("Orangina")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.getByText("Orangina")).toBeInTheDocument();
    expect(onReveal).toHaveBeenCalledOnce();
  });

  it("shows 'Tu es Mr. White' when no word is given", async () => {
    render(<SecretCard playerName="Léa" />);
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    expect(screen.getByText("Tu es Mr. White")).toBeInTheDocument();
  });

  it("hides the word again and calls onMemorized after 'J'ai mémorisé'", async () => {
    const onMemorized = vi.fn();
    render(<SecretCard playerName="Léa" word="Orangina" onMemorized={onMemorized} />);
    await userEvent.click(screen.getByRole("button", { name: "Afficher mon mot" }));
    await userEvent.click(screen.getByRole("button", { name: "J'ai mémorisé" }));
    expect(screen.queryByText("Orangina")).not.toBeInTheDocument();
    expect(onMemorized).toHaveBeenCalledOnce();
  });
});
