import { useState } from "react";
import { Button, ROLE_LABEL, RoleReveal } from "../../design-system";
import { matchesWord, resolveTurn } from "../../rules";
import { effectiveTours } from "../../settings";
import { applyTurnOutcome, loadGameState, saveGameState } from "../../state/gameState";
import type { Game } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E7.css";

/** E7 ("Élimination"): confirm (no cancel, ADR-0001), reveal the role, and — for Mr. White — the one-shot guess (RG07). */
export function E7({ onNavigate }: ScreenProps) {
  const [state, setState] = useState(() => loadGameState());
  const [checked, setChecked] = useState(false);
  const [guess, setGuess] = useState("");
  const { players, settings } = state;
  if (!state.game || !state.elimTarget) return null;
  // Aliased so closures below keep the non-null narrowing (TS doesn't carry
  // it through destructured `state.game`/`state.elimTarget` into nested functions).
  const g = state.game;
  const target = state.elimTarget;

  const role = g.roles[target];
  const isMrWhite = role === "mr-white";
  const eliminated = g.eliminated.includes(target);
  const guessResult = g.mrWhiteGuesses[target];
  const showMwInput = eliminated && isMrWhite && guessResult === undefined;
  const mwMissed = eliminated && isMrWhite && guessResult === false;
  const showContinue = eliminated && (!isMrWhite || guessResult === false);

  const toursMode = settings.mode === "tours";
  const toursTarget = effectiveTours(settings, players.length);

  function persist(nextGame: Game, extra?: { elimTarget: string | null }) {
    const next = { ...state, game: nextGame, ...extra };
    setState(next);
    saveGameState(next);
  }

  function handleConfirm() {
    if (!checked) return;
    persist({ ...g, eliminated: [...g.eliminated, target] });
  }

  function handleGuessSubmit() {
    if (!guess.trim()) return;
    const correct = matchesWord(guess, g.civilWord);
    const guessedGame = { ...g, mrWhiteGuesses: { ...g.mrWhiteGuesses, [target]: correct } };
    if (!correct) {
      persist(guessedGame);
      return;
    }
    const outcome = resolveTurn({
      players,
      roles: guessedGame.roles,
      eliminated: guessedGame.eliminated,
      turn: guessedGame.turn,
      toursMode,
      toursTarget,
      mrWhiteGuessedCorrectly: true,
    });
    persist(applyTurnOutcome(guessedGame, outcome), { elimTarget: null });
    onNavigate("E8");
  }

  function handleContinue() {
    const outcome = resolveTurn({
      players,
      roles: g.roles,
      eliminated: g.eliminated,
      turn: g.turn,
      toursMode,
      toursTarget,
      mrWhiteGuessedCorrectly: false,
    });
    persist(applyTurnOutcome(g, outcome), { elimTarget: null });
    onNavigate(outcome.winner ? "E8" : "E6");
  }

  return (
    <section className="e7">
      {!eliminated && (
        <div className="e7__pending">
          <span className="label e7__kicker">La table a voté contre</span>
          <span className="e7__name">{target}</span>
          <label className={`e7__check${checked ? " e7__check--on" : ""}`}>
            <input type="checkbox" checked={checked} onChange={() => setChecked((c) => !c)} />
            <span className="e7__check-text">
              <span className="label">Éliminer {target}</span>
              <span className="caption e7__check-hint">Son rôle sera révélé à toute la table. C'est définitif.</span>
            </span>
          </label>
          <Button variant="danger" onClick={handleConfirm} disabled={!checked}>
            Confirmer l'élimination
          </Button>
        </div>
      )}
      {eliminated && (
        <div className="e7__done">
          <span className="label e7__kicker">
            {target} était {ROLE_LABEL[role]}
          </span>
          <div className="e7__reveal">
            <RoleReveal playerName={target} role={role} animate />
          </div>
          {showMwInput && (
            <div className="e7__mw">
              <div className="e7__mw-header">
                <span className="heading">Dernière chance, {target}</span>
                <span className="body e7__mw-hint">
                  Devine le mot des civils. Une seule tentative : si tu trouves, ton camp gagne.
                </span>
              </div>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuessSubmit()}
                placeholder="Le mot des civils"
                autoComplete="off"
                className="e7__mw-input"
              />
              <Button variant="primary" onClick={handleGuessSubmit} disabled={!guess.trim()}>
                Valider le mot
              </Button>
            </div>
          )}
          {mwMissed && (
            <div className="e7__missed">
              <span className="label">Raté. « {guess} » n'est pas le mot des civils.</span>
            </div>
          )}
          {showContinue && (
            <Button variant="primary" onClick={handleContinue}>
              Continuer
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
