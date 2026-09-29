import { useState } from "react";
import { Button } from "./design-system";
import { ScreenSwitcher } from "./shell/ScreenSwitcher";
import { SCREEN_ORDER } from "./shell/screens/types";
import type { ScreenId } from "./shell/screens/types";
import { TopBar } from "./shell/TopBar";
import { loadGameState, saveGameState } from "./state/gameState";

/**
 * App shell: a top bar (every screen except E1, per the handoff's "Layout
 * global"), a dev-only screen picker (stands in for the real navigation
 * later tickets will drive from game state), and the screen switcher. The
 * top bar's "Abandonner" (F15) is a shell-level concern — it's the only
 * cross-screen action a screen can't own itself — so the confirmation modal
 * lives here too, next to the TopBar that triggers it.
 */
export function App() {
  const [current, setCurrent] = useState<ScreenId>(() => loadGameState().screen ?? "E1");
  const [abandonAsk, setAbandonAsk] = useState(false);

  /** Persists `screen` onto the état de partie so a reload resumes here (#9), then switches. */
  function navigate(id: ScreenId) {
    saveGameState({ ...loadGameState(), screen: id });
    setCurrent(id);
  }

  function handleAbandon() {
    const state = loadGameState();
    saveGameState({ ...state, game: null, cardPlayer: null, elimTarget: null, screen: "E2" });
    setAbandonAsk(false);
    setCurrent("E2");
  }

  return (
    <>
      {current !== "E1" && (
        <TopBar
          onBack={current === "regles" || current === "E2" ? () => navigate("E1") : undefined}
          onHome={() => navigate("E1")}
          onAbandon={current === "E6" ? () => setAbandonAsk(true) : undefined}
        />
      )}
      {import.meta.env.DEV && new URLSearchParams(window.location.search).has("dev") && (
        <nav aria-label="Sélecteur d'écran (dev)" className="app__dev-nav">
          {SCREEN_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={current === id}
              onClick={() => navigate(id)}
            >
              {id}
            </button>
          ))}
        </nav>
      )}
      <main className="app__main">
        <ScreenSwitcher current={current} onNavigate={navigate} />
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
