import { useState } from "react";
import { Button, RoleReveal } from "../../design-system";
import { activeGroups } from "../../settings";
import { assignRoles, drawGroup, matchesWord, nextChanceFinale, pickStarter } from "../../rules";
import type { Cause } from "../../rules";
import { loadLibrary } from "../../library";
import { loadGameState, saveGameState } from "../../state/gameState";
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
  const [current, setCurrent] = useState<string | null>(() => {
    const initial = loadGameState();
    return initial.game
      ? nextChanceFinale(initial.players, initial.game.roles, initial.game.eliminated, initial.game.mrWhiteGuesses)
      : null;
  });
  const { players, settings, game } = state;
  if (!game || !game.winner || !game.cause) return null;

  function submitFinal() {
    if (!guess.trim() || !current || !game) return;
    const correct = matchesWord(guess, game.civilWord);
    const nextGame = { ...game, mrWhiteGuesses: { ...game.mrWhiteGuesses, [current]: correct } };
    const next = { ...state, game: nextGame };
    setState(next);
    saveGameState(next);
    setAnswered(correct);
  }

  function nextFinale() {
    setCurrent(nextChanceFinale(players, game!.roles, game!.eliminated, game!.mrWhiteGuesses));
    setAnswered(null);
    setGuess("");
  }

  function handleReplay() {
    const library = loadLibrary();
    const groups = activeGroups(library.groups, settings.excludedCategories);
    if (groups.length === 0) return;
    const draw = drawGroup(groups);
    const roles = assignRoles(players, settings.imposteurs, settings.mrWhite);
    const starter = pickStarter(players, roles);
    saveGameState({
      players,
      settings,
      cardPlayer: null,
      elimTarget: null,
      game: {
        cat: draw.cat,
        civilWord: draw.civilWord,
        imposteurWord: draw.imposteurWord,
        roles,
        starter,
        seen: {},
        turn: 1,
        eliminated: [],
        winner: null,
        cause: null,
        mrWhiteGuesses: {},
      },
    });
    onNavigate("E4");
  }

  function handleNewGame() {
    saveGameState({ ...state, game: null, cardPlayer: null, elimTarget: null });
    onNavigate("E2");
  }

  if (current) {
    const hasMore = nextChanceFinale(players, game.roles, game.eliminated, game.mrWhiteGuesses) !== null;
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

  const hasImpWord = Object.values(game.roles).includes("imposteur");
  const board = players.map((name) => {
    const role = game.roles[name];
    const idx = game.eliminated.indexOf(name);
    let status = idx >= 0 ? `Éliminé·e (${idx + 1}ᵉ)` : "En vie";
    if (role === "mr-white" && game.mrWhiteGuesses[name] === true) status += " · a trouvé le mot";
    else if (role === "mr-white" && game.mrWhiteGuesses[name] === false) status += " · n'a pas trouvé";
    const word = role === "civil" ? game.civilWord : role === "imposteur" ? game.imposteurWord : "Aucun mot";
    return { name, role, word, status };
  });

  return (
    <section className="e8">
      <div className={`e8__banner e8__banner--${game.winner}`}>
        <span className="label e8__banner-kicker">{CAUSE_TEXT[game.cause](game.turn)}</span>
        <h1 className="e8__banner-title">{game.winner === "civils" ? "Les civils gagnent" : "Les infiltrés gagnent"}</h1>
      </div>
      <div className="e8__stats">
        <div className="e8__stat">
          <span className="caption">Mot des civils</span>
          <span className="e8__stat-value">{game.civilWord}</span>
        </div>
        {hasImpWord && (
          <div className="e8__stat">
            <span className="caption">Mot des imposteurs</span>
            <span className="e8__stat-value">{game.imposteurWord}</span>
          </div>
        )}
        <div className="e8__stat">
          <span className="caption">Catégorie · tours joués</span>
          <span className="e8__stat-value e8__stat-value--sm">
            {game.cat} · {game.turn} tour{game.turn > 1 ? "s" : ""}
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
