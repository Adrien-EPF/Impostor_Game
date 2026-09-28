import { useState } from "react";
import { Button, RoleReveal } from "../../design-system";
import { matchesWord, nextChanceFinale } from "../../rules";
import type { Cause } from "../../rules";
import { loadLibrary } from "../../library";
import { buildNewGame, loadGameState, saveGameState } from "../../state/gameState";
import { loadRememberedSettings } from "../../state/rememberedSettings";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E8.css";

const CAUSE_TEXT: Record<Cause, (turn: number) => string> = {
  elimination: () => "Tous les infiltrés sont démasqués",
  "mr-white": () => "Mr. White a trouvé le mot",
  parite: () => "Parité : autant de civils que d'infiltrés",
  survie: (turn) => `Les infiltrés ont survécu ${turn} tours`,
};

/** E8 ("Fin de partie"): Chance finale (RG09) for surviving Mr. Whites, then the results banner and board. */
export function E8({ onNavigate }: ScreenProps) {
  const [state, setState] = useState(() => loadGameState());
  const [guess, setGuess] = useState("");
  const [answered, setAnswered] = useState<boolean | null>(null);
  // The Mr. White currently shown for their Chance finale attempt. Tracked
  // separately from `state.game.mrWhiteGuesses` so recording an answer
  // doesn't itself advance the displayed player out from under the result
  // being shown — only "Mr. White suivant"/"Voir le résultat" does that.
  const [current, setCurrent] = useState<string | null>(() =>
    state.game ? nextChanceFinale(state.players, state.game.roles, state.game.eliminated, state.game.mrWhiteGuesses) : null,
  );
  if (!state.game || !state.game.winner || !state.game.cause) return null;
  // Aliased so closures below keep the non-null narrowing (TS doesn't carry
  // it through destructured `state.game` into nested functions).
  const g = state.game;
  const { players, settings } = state;

  function submitFinal() {
    if (!guess.trim() || !current) return;
    const correct = matchesWord(guess, g.civilWord);
    const nextGame = { ...g, mrWhiteGuesses: { ...g.mrWhiteGuesses, [current]: correct } };
    const next = { ...state, game: nextGame };
    setState(next);
    saveGameState(next);
    setAnswered(correct);
  }

  function nextFinale() {
    setCurrent(nextChanceFinale(players, g.roles, g.eliminated, g.mrWhiteGuesses));
    setAnswered(null);
    setGuess("");
  }

  function handleReplay() {
    const game = buildNewGame(players, settings, loadLibrary().groups);
    if (!game) return;
    saveGameState({ players, settings, cardPlayer: null, elimTarget: null, game });
    onNavigate("E4");
  }

  /** F16: prefills from the same réglages source as E1's "Nouvelle partie", not straight from this finished game's copy. */
  function handleNewGame() {
    const remembered = loadRememberedSettings();
    saveGameState({
      ...state,
      players: remembered?.players ?? state.players,
      settings: remembered?.settings ?? state.settings,
      game: null,
      cardPlayer: null,
      elimTarget: null,
    });
    onNavigate("E2");
  }

  if (current) {
    const hasMore = nextChanceFinale(players, g.roles, g.eliminated, g.mrWhiteGuesses) !== null;
    return (
      <section className="e8">
        <div className="e8__finale">
          <span className="label e8__finale-kicker">Les infiltrés ont gagné · Chance finale</span>
          <RoleReveal playerName={current} role="mr-white" animate />
          <p className="body e8__finale-copy">
            {current}, tu as survécu. Devine le mot des civils pour l'honneur : l'issue de la partie ne change pas.
          </p>
          {answered === null ? (
            <div className="e8__finale-form">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFinal()}
                placeholder="Le mot des civils"
                autoComplete="off"
                className="e8__finale-input"
              />
              <Button variant="primary" onClick={submitFinal} disabled={!guess.trim()}>
                Deviner le mot
              </Button>
            </div>
          ) : (
            <div className="e8__finale-form">
              <div className="e8__finale-result">
                <span className="label">
                  {answered
                    ? `Bien joué, ${current} : c'était bien le mot !`
                    : `Raté : « ${guess} » n'est pas le mot des civils.`}
                </span>
              </div>
              <Button variant="primary" onClick={nextFinale}>
                {hasMore ? "Mr. White suivant" : "Voir le résultat"}
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  const hasImpWord = Object.values(g.roles).includes("imposteur");
  const board = players.map((name) => {
    const role = g.roles[name];
    const idx = g.eliminated.indexOf(name);
    let status = idx >= 0 ? `Éliminé·e (${idx + 1}ᵉ)` : "En vie";
    if (role === "mr-white" && g.mrWhiteGuesses[name] === true) status += " · a trouvé le mot";
    else if (role === "mr-white" && g.mrWhiteGuesses[name] === false) status += " · n'a pas trouvé";
    const word = role === "civil" ? g.civilWord : role === "imposteur" ? g.imposteurWord : "Aucun mot";
    return { name, role, word, status };
  });

  return (
    <section className="e8">
      <div className={`e8__banner e8__banner--${g.winner}`}>
        <span className="label e8__banner-kicker">{CAUSE_TEXT[g.cause!](g.turn)}</span>
        <h1 className="e8__banner-title">{g.winner === "civils" ? "Les civils gagnent" : "Les infiltrés gagnent"}</h1>
      </div>
      <div className="e8__stats">
        <div className="e8__stat">
          <span className="caption">Mot des civils</span>
          <span className="e8__stat-value">{g.civilWord}</span>
        </div>
        {hasImpWord && (
          <div className="e8__stat">
            <span className="caption">Mot des imposteurs</span>
            <span className="e8__stat-value">{g.imposteurWord}</span>
          </div>
        )}
        <div className="e8__stat">
          <span className="caption">Catégorie · tours joués</span>
          <span className="e8__stat-value e8__stat-value--sm">
            {g.cat} · {g.turn} tour{g.turn > 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="e8__board">
        {board.map((b) => (
          <div key={b.name} className="e8__board-item">
            <RoleReveal playerName={b.name} role={b.role} animate={false} />
            <span className="label e8__board-word">{b.word}</span>
            <span className="caption e8__board-status">{b.status}</span>
          </div>
        ))}
      </div>
      <div className="e8__actions">
        <Button variant="primary" onClick={handleReplay}>
          Rejouer
        </Button>
        <Button variant="secondary" onClick={handleNewGame}>
          Nouvelle partie
        </Button>
      </div>
    </section>
  );
}
