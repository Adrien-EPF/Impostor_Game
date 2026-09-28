import { useState } from "react";
import { Button } from "../../design-system";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E4.css";

/** E4 ("Touche ton prénom"): pass-the-device tile grid gating entry into each player's E5 secret card. */
export function E4({ onNavigate }: ScreenProps) {
  const [state, setState] = useState(() => loadGameState());
  const [reviewAsk, setReviewAsk] = useState<string | null>(null);
  const { players, game } = state;

  if (!game) return null;

  const seenCount = players.filter((p) => game.seen[p]).length;
  const total = players.length;
  const allSeen = total > 0 && seenCount === total;
  const seenPct = total > 0 ? Math.round((seenCount / total) * 100) : 0;

  function commitCardPlayer(name: string) {
    const next = { ...state, cardPlayer: name };
    setState(next);
    saveGameState(next);
  }

  function openCard(name: string) {
    commitCardPlayer(name);
    onNavigate("E5");
  }

  function handleTap(name: string) {
    if (game!.seen[name]) {
      setReviewAsk(name);
    } else {
      openCard(name);
    }
  }

  return (
    <section className="e4">
      <div className="e4__header">
        <h1 className="title e4__title">Touche ton prénom</h1>
        <p className="body e4__subtitle">
          Chacun découvre son mot en secret, puis passe l'appareil. {seenCount} sur {total} ont vu leur mot.
        </p>
      </div>
      <div className="e4__progress-track">
        <div className="e4__progress-fill" style={{ width: `${seenPct}%` }} />
      </div>
      <div className="e4__tiles">
        {players.map((name) => {
          const seen = !!game.seen[name];
          return (
            <button
              key={name}
              type="button"
              className={`e4__tile${seen ? " e4__tile--seen" : ""}`}
              onClick={() => handleTap(name)}
            >
              <span className="e4__tile-name">{name}</span>
              <span className="caption e4__tile-state">{seen ? "✓ Mot vu" : "À toi de voir"}</span>
            </button>
          );
        })}
      </div>
      {allSeen && (
        <div className="e4__start">
          <span className="label e4__start-label">Tout le monde a son mot.</span>
          <Button variant="primary" onClick={() => onNavigate("E6")}>
            Commencer le tour 1
          </Button>
        </div>
      )}
      {reviewAsk && (
        <div className="e4__modal-backdrop">
          <div className="e4__modal">
            <span className="heading">Revoir le mot de {reviewAsk} ?</span>
            <span className="body e4__modal-hint">Seul·e {reviewAsk} doit regarder l'écran.</span>
            <Button
              variant="primary"
              onClick={() => {
                const name = reviewAsk;
                setReviewAsk(null);
                openCard(name);
              }}
            >
              Oui, c'est moi
            </Button>
            <Button variant="secondary" onClick={() => setReviewAsk(null)}>
              Non
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
