import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScreenSwitcher } from "./ScreenSwitcher";
import { SCREEN_ORDER, SCREEN_LABELS } from "./screens/types";

describe("ScreenSwitcher", () => {
  it.each(SCREEN_ORDER)("renders the stub screen for %s", (id) => {
    render(<ScreenSwitcher current={id} />);
    expect(screen.getByText(new RegExp(SCREEN_LABELS[id]))).toBeInTheDocument();
  });

  it("switches screens when the `current` prop changes", () => {
    const { rerender } = render(<ScreenSwitcher current="E1" />);
    expect(screen.getByText(/Accueil/)).toBeInTheDocument();

    rerender(<ScreenSwitcher current="E2" />);
    expect(screen.getByText(/Joueurs/)).toBeInTheDocument();
    expect(screen.queryByText(/Accueil/)).not.toBeInTheDocument();
  });
});
