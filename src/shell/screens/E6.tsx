import { useState } from "react";
import { Button, RoleReveal } from "../../design-system";
import { resolveTurn } from "../../rules";
import { effectiveTours } from "../../settings";
import { applyTurnOutcome, loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E6.css";

/** E6 ("Partie"): turn/starter banner, living players (tap to eliminate), éliminés, and "Personne n'est éliminé". */
export function E6({ onNavigate }: ScreenProps) {
  const [state, setState] = useState(() => loadGameState());
  if (!state.game) return null;
  // Aliased so closures below keep the non-null narrowing (TS doesn't carry
  // it through destructured `state.game` into nested functions).
  const g = state.game;
  const { players, settings } = state;

  const alive = players.filter((p) => !g.eliminated.includes(p));
  const toursMode = settings.mode === "tours";
  const toursTarget = effectiveTours(settings, players.length);

  function goEliminate(name: string) {
    const next = { ...state, elimTarget: name };
    setState(next);
    saveGameState(next);
    onNavigate("E7");
  }

  function handleNobody() {
    const outcome = resolveTurn({
      players,
      roles: g.roles,
      eliminated: g.eliminated,
      turn: g.turn,
      toursMode,
      toursTarget,
      mrWhiteGuessedCorrectly: false,
    });
    const next = { ...state, game: applyTurnOutcome(g, outcome) };
    setState(next);
    saveGameState(next);
    onNavigate(outcome.winner ? "E8" : "E6");
  }

  return (
    <section className="e6">
      <div className="e6__banner">
        <div className="e6__tile">
          <span className="label e6__tile-kicker">{toursMode ? `Tour · objectif ${toursTarget}` : "Tour"}</span>
          <span className="e6__tile-value">{toursMode ? `${g.turn} / ${toursTarget}` : `n° ${g.turn}`}</span>
        </div>
        <div className="e6__tile e6__tile--starter">
          <span className="label">Commence à parler</span>
          <span className="e6__tile-value">{g.starter ?? "—"}</span>
        </div>
      </div>
      <section className="e6__section">
        <div className="e6__section-header">
          <h2 className="heading">En jeu · {alive.length}</h2>
          <span className="body e6__hint">Après le vote, touche le joueur éliminé.</span>
        </div>
        <div className="e6__tiles">
          {alive.map((name) => (
            <button key={name} type="button" className="e6__alive-tile" onClick={() => goEliminate(name)}>
              {name}
            </button>
          ))}
        </div>
      </section>
      {g.eliminated.length > 0 && (
        <section className="e6__section">
          <h2 className="heading">Éliminés · {g.eliminated.length}</h2>
          <div className="e6__dead">
            {g.eliminated.map((name) => (
              <RoleReveal key={name} playerName={name} role={g.roles[name]} animate={false} />
            ))}
          </div>
        </section>
      )}
      <div className="e6__nobody">
        <Button variant="secondary" onClick={handleNobody}>
          Personne n'est éliminé
        </Button>
      </div>
    </section>
  );
}
