import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../../design-system";
import { loadLibrary } from "../../library";
import { assignRoles, drawGroup, pickStarter } from "../../rules";
import {
  activeGroups,
  composition,
  effectiveTours,
  launchBlockedReason,
  toggleCategory,
} from "../../settings";
import type { Settings } from "../../settings";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E3.css";

function pluralize(count: number): string {
  return count > 1 ? "s" : "";
}

interface StepperRowProps {
  children: ReactNode;
  value: number;
  decLabel: string;
  incLabel: string;
  onDec: () => void;
  onInc: () => void;
}

/** A labelled −/value/+ row, shared by the imposteurs, Mr. White and tours (N) steppers. */
function StepperRow({ children, value, decLabel, incLabel, onDec, onInc }: StepperRowProps) {
  return (
    <div className="e3__stepper-row">
      {children}
      <div className="e3__stepper-controls">
        <Button variant="secondary" aria-label={decLabel} onClick={onDec}>
          −
        </Button>
        <span className="e3__stepper-value">{value}</span>
        <Button variant="secondary" aria-label={incLabel} onClick={onInc}>
          +
        </Button>
      </div>
    </div>
  );
}

/** E3 ("Réglages"): composition, victory mode, categories, then draw + role assignment on "Lancer la partie". */
export function E3({ onNavigate }: ScreenProps) {
  const [players] = useState<string[]>(() => loadGameState().players);
  const [settings, setSettings] = useState<Settings>(() => loadGameState().settings);
  const [library] = useState(() => loadLibrary());

  const playerCount = players.length;
  const categories = [...new Set(library.groups.map((g) => g.cat))];

  function commitSettings(next: Settings) {
    setSettings(next);
    saveGameState({ ...loadGameState(), settings: next });
  }

  const { civils, infiltres, maxInfiltres } = composition(playerCount, settings);
  const blocked = launchBlockedReason(playerCount, settings, library.groups);
  const launchMessage = blocked
    ? blocked.kind === "composition"
      ? blocked.message
      : "Choisis au moins une catégorie."
    : null;

  const isTours = settings.mode === "tours";
  const nVal = effectiveTours(settings, playerCount);

  function handleLaunch() {
    if (blocked) return;
    const groups = activeGroups(library.groups, settings.excludedCategories);
    const draw = drawGroup(groups);
    const roles = assignRoles(players, settings.imposteurs, settings.mrWhite);
    const starter = pickStarter(players, roles);
    saveGameState({
      players,
      settings,
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
      cardPlayer: null,
      elimTarget: null,
    });
    onNavigate("E4");
  }

  return (
    <section className="e3">
      <h1 className="title e3__title">Réglages</h1>
      <div className="e3__grid">
        <section className="e3__col">
          <h2 className="heading e3__heading">Composition</h2>
          <StepperRow
            value={settings.imposteurs}
            decLabel="Moins d'imposteurs"
            incLabel="Plus d'imposteurs"
            onDec={() => commitSettings({ ...settings, imposteurs: Math.max(0, settings.imposteurs - 1) })}
            onInc={() =>
              commitSettings({
                ...settings,
                imposteurs: Math.min(settings.imposteurs + 1, Math.max(0, playerCount - 1)),
              })
            }
          >
            <div className="e3__stepper-label">
              <span className="e3__dot e3__dot--imposteur" />
              <span className="label">Imposteurs</span>
            </div>
          </StepperRow>
          <StepperRow
            value={settings.mrWhite}
            decLabel="Moins de Mr. White"
            incLabel="Plus de Mr. White"
            onDec={() => commitSettings({ ...settings, mrWhite: Math.max(0, settings.mrWhite - 1) })}
            onInc={() =>
              commitSettings({
                ...settings,
                mrWhite: Math.min(settings.mrWhite + 1, Math.max(0, playerCount - 1)),
              })
            }
          >
            <div className="e3__stepper-label">
              <span className="e3__dot e3__dot--mr-white" />
              <span className="label">Mr. White</span>
            </div>
          </StepperRow>
          <div className="e3__summary">
            <span className="label">{playerCount} joueurs</span>
            <span className="caption">
              → {Math.max(0, civils)} civils · {infiltres} infiltré{pluralize(infiltres)} · {maxInfiltres} infiltré
              {pluralize(maxInfiltres)} max
            </span>
          </div>
          {blocked?.kind === "composition" && <div className="e3__error">{blocked.message}</div>}
        </section>
        <section className="e3__col">
          <h2 className="heading e3__heading">Mode de victoire</h2>
          <div className="e3__mode-grid">
            <button
              type="button"
              aria-pressed={!isTours}
              aria-label="Classique"
              className={`e3__mode-tile${!isTours ? " e3__mode-tile--active" : ""}`}
              onClick={() => commitSettings({ ...settings, mode: "classique" })}
            >
              <span className="label">Classique</span>
              <span className="caption">Les infiltrés gagnent à la parité.</span>
            </button>
            <button
              type="button"
              aria-pressed={isTours}
              aria-label="Nombre de tours"
              className={`e3__mode-tile${isTours ? " e3__mode-tile--active" : ""}`}
              onClick={() => commitSettings({ ...settings, mode: "tours" })}
            >
              <span className="label">Nombre de tours</span>
              <span className="caption">Ou s'ils survivent jusqu'au tour N.</span>
            </button>
          </div>
          {isTours && (
            <StepperRow
              value={nVal}
              decLabel="Moins de tours"
              incLabel="Plus de tours"
              onDec={() => commitSettings({ ...settings, tours: Math.max(1, nVal - 1) })}
              onInc={() => commitSettings({ ...settings, tours: nVal + 1 })}
            >
              <span className="label">Tours (N)</span>
            </StepperRow>
          )}
          <h2 className="heading e3__heading e3__heading--categories">Catégories</h2>
          <div className="e3__chips">
            {categories.map((cat) => {
              const on = !settings.excludedCategories.includes(cat);
              const count = library.groups.filter((g) => g.cat === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={on}
                  aria-label={cat}
                  className={`e3__chip${on ? " e3__chip--active" : ""}`}
                  onClick={() =>
                    commitSettings({ ...settings, excludedCategories: toggleCategory(settings.excludedCategories, cat) })
                  }
                >
                  <span>{on ? "✓" : "+"}</span>
                  <span>{cat}</span>
                  <span className="e3__chip-count">{count}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <div className="e3__launch">
        <Button variant="primary" onClick={handleLaunch} disabled={!!blocked}>
          Lancer la partie
        </Button>
        {blocked && launchMessage && <span className="caption e3__launch-msg">{launchMessage}</span>}
      </div>
    </section>
  );
}
