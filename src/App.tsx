import { useState } from "react";
import { ScreenSwitcher } from "./shell/ScreenSwitcher";
import { SCREEN_ORDER } from "./shell/screens/types";
import type { ScreenId } from "./shell/screens/types";
import { TopBar } from "./shell/TopBar";

/**
 * App shell for this ticket: a top bar (every screen except E1, per the
 * handoff's "Layout global"), a dev-only screen picker (stands in for the
 * real navigation later tickets will drive from game state), and the screen
 * switcher. No game behaviour lives here yet.
 */
export function App() {
  const [current, setCurrent] = useState<ScreenId>("E1");

  return (
    <>
      {current !== "E1" && <TopBar />}
      {import.meta.env.DEV && (
        <nav aria-label="Sélecteur d'écran (dev)" style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 16 }}>
          {SCREEN_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={current === id}
              onClick={() => setCurrent(id)}
            >
              {id}
            </button>
          ))}
        </nav>
      )}
      <main style={{ flex: 1 }}>
        <ScreenSwitcher current={current} />
      </main>
    </>
  );
}
