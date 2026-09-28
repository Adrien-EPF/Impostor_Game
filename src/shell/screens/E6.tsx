import { useEffect, useRef, useState } from "react";
import { Button, RoleReveal } from "../../design-system";
import { resolveTurn } from "../../rules";
import { effectiveTours } from "../../settings";
import { applyTurnOutcome, loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E6.css";

/** Short beep signalling timer expiry. Silently no-ops where the Web Audio API is unavailable. */
function playExpiryBeep() {
  try {
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
    oscillator.onended = () => ctx.close();
  } catch {
    // Audible signal is a nice-to-have; the visual "Temps écoulé" state still stands.
  }
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SpeechTimerProps {
  /** Configured duration (settings.timerSeconds), in seconds. */
  duration: number;
  /** Changing this value (the turn number) resets the countdown to `duration` and pauses it. */
  resetKey: number;
}

/** F19: opt-in speech timer shown on E6 when `settings.timerEnabled`. Purely local UI state — it never touches game state, so it can't interfere with elimination/tour actions. */
function SpeechTimer({ duration, resetKey }: SpeechTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const beepedRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
    beepedRef.current = false;
  }, [duration, resetKey]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && !beepedRef.current) {
      beepedRef.current = true;
      setRunning(false);
      playExpiryBeep();
    }
  }, [remaining]);

  const expired = remaining === 0;

  return (
    <div className={`e6__timer${expired ? " e6__timer--expired" : ""}`}>
      <span className="label e6__timer-value">{expired ? "Temps écoulé" : formatTimer(remaining)}</span>
      <div className="e6__timer-controls">
        <Button
          variant="secondary"
          onClick={() => setRunning((r) => !r)}
          disabled={expired}
          aria-label={running ? "Mettre en pause le minuteur" : "Démarrer le minuteur"}
        >
          {running ? "Pause" : "Démarrer"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setRemaining(duration);
            setRunning(false);
            beepedRef.current = false;
          }}
          aria-label="Réinitialiser le minuteur"
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}

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
      {settings.timerEnabled && <SpeechTimer duration={settings.timerSeconds} resetKey={g.turn} />}
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
