import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("renders the title and hides optional slots by default", () => {
    render(<TopBar />);
    expect(screen.getByText("Imposteur")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retour/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /abandonner/i })).not.toBeInTheDocument();
  });

  it("renders the back button and calls onBack when clicked", async () => {
    const onBack = vi.fn();
    render(<TopBar onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: "‹ Retour" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("renders the step pill when provided", () => {
    render(<TopBar stepLabel="Étape 1 sur 2" />);
    expect(screen.getByText("Étape 1 sur 2")).toBeInTheDocument();
  });

  it("renders the abandon button and calls onAbandon when clicked", async () => {
    const onAbandon = vi.fn();
    render(<TopBar onAbandon={onAbandon} />);
    await userEvent.click(screen.getByRole("button", { name: "Abandonner" }));
    expect(onAbandon).toHaveBeenCalledOnce();
  });
});
