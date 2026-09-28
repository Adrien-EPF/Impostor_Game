import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("starts on the E1 screen without a top bar", () => {
    render(<App />);
    expect(screen.getByText(/Accueil/)).toBeInTheDocument();
    expect(screen.queryByText("Imposteur")).not.toBeInTheDocument();
  });

  it("navigates to another screen via the screen picker, showing the top bar", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "E4" }));
    expect(screen.getByText(/Distribution/)).toBeInTheDocument();
    expect(screen.getByText("Imposteur")).toBeInTheDocument();
  });

  it("hides the top bar again when navigating back to E1", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "E4" }));
    await userEvent.click(screen.getByRole("button", { name: "E1" }));
    expect(screen.queryByText("Imposteur")).not.toBeInTheDocument();
  });
});
