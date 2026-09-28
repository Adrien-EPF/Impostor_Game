import { useState } from "react";
import { Button } from "./design-system";
import { ScreenSwitcher } from "./shell/ScreenSwitcher";
import { SCREEN_ORDER } from "./shell/screens/types";
import type { ScreenId } from "./shell/screens/types";
import { TopBar } from "./shell/TopBar";
import { loadGameState, saveGameState } from "./state/gameState";
import "./App.css";

/**
 * App shell: a top bar (every screen except E1, per the handoff's "Layout
 * global"), a dev-only screen picker (stands in for the real navigation
 * later tickets will drive from game state), and the screen switcher. The
 * top bar's "Abandonner" (F15) is a shell-level concern — it's the only
 * cross-screen action a screen can't own itself — so the confirmation modal
 * lives here too, next to the TopBar that triggers it.
 */
export function App() {
  const [current, setCurrent] = useState<ScreenId>("E1");
  const [abandonAsk, setAbandonAsk] = useState(false);

  function handleAbandon() {
    const state = loadGameState();
    saveGameState({ ...state, game: null, cardPlayer: null, elimTarget: null });
    setAbandonAsk(false);
    setCurrent("E2");
  }

  return (
    <>
      {current !== "E1" && <TopBar onAbandon={current === "E6" ? () => setAbandonAsk(true) : undefined} />}
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
        <ScreenSwitcher current={current} onNavigate={setCurrent} />
      </main>
      {abandonAsk && (
        <div className="app__modal-backdrop">
          <div className="app__modal">
            <span className="heading">Abandonner la partie ?</span>
            <span className="body app__modal-hint">
              Les mots et les rôles seront perdus. Les joueurs et réglages sont conservés.
            </span>
            <Button variant="primary" onClick={() => setAbandonAsk(false)}>
              Continuer la partie
            </Button>
            <Button variant="secondary" onClick={handleAbandon}>
              Abandonner
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
