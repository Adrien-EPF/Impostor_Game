import { useState } from "react";
import { Button, RoleReveal } from "../../design-system";
import { resolveTurn } from "../../rules";
import { effectiveTours } from "../../settings";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E6.css";

/** E6 ("Partie"): turn/starter banner, living players (tap to eliminate), éliminés, and "Personne n'est éliminé". */
export function E6({ onNavigate }: ScreenProps) {
  const [state, setState] = useState(() => loadGameState());
  const { players, settings, game } = state;
  if (!game) return null;

  const alive = players.filter((p) => !game.eliminated.includes(p));
  const toursMode = settings.mode === "tours";
  const toursTarget = effectiveTours(settings, players.length);

  function goEliminate(name: string) {
    const next = { ...state, elimTarget: name };
    setState(next);
    saveGameState(next);
    onNavigate("E7");
  }

  function handleNobody() {
    const outcome = resolveTurn(players, game!.roles, game!.eliminated, game!.turn, toursMode, toursTarget, false);
    const nextGame = {
      ...game!,
      turn: outcome.turn,
      starter: outcome.starter,
      winner: outcome.winner,
      cause: outcome.cause,
    };
    const next = { ...state, game: nextGame };
    setState(next);
    saveGameState(next);
    onNavigate(outcome.winner ? "E8" : "E6");
  }

  return (
    <section className="e6">
      <div className="e6__banner">
        <div className="e6__tile">
          <span className="label e6__tile-kicker">{toursMode ? `Tour · objectif ${toursTarget}` : "Tour"}</span>
          <span className="e6__tile-value">{toursMode ? `${game.turn} / ${toursTarget}` : `n° ${game.turn}`}</span>
        </div>
        <div className="e6__tile e6__tile--starter">
          <span className="label">Commence à parler</span>
          <span className="e6__tile-value">{game.starter ?? "—"}</span>
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
      {game.eliminated.length > 0 && (
        <section className="e6__section">
          <h2 className="heading">Éliminés · {game.eliminated.length}</h2>
          <div className="e6__dead">
            {game.eliminated.map((name) => (
              <RoleReveal key={name} playerName={name} role={game.roles[name]} animate={false} />
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
