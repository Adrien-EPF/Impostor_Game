import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScreenSwitcher } from "./ScreenSwitcher";
import { SCREEN_ORDER, SCREEN_LABELS } from "./screens/types";

// E1 (F04/E1) and E2 (F01/E2) are real screens; every other screen is still a stub.
const STUB_SCREENS = SCREEN_ORDER.filter((id) => id !== "E1" && id !== "E2");

describe("ScreenSwitcher", () => {
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
