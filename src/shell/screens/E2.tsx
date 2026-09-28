import { useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Button } from "../../design-system";
import {
  MAX_PLAYERS,
  addPlayer,
  canContinue,
  continueBlockedReason,
  getPlayerRowFlags,
  movePlayer,
  removePlayer,
  renamePlayer,
} from "../../players";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E2.css";

const ROW_TAGS = { empty: "Vide", duplicate: "Doublon" } as const;

function pluralize(count: number): string {
  return count > 1 ? "s" : "";
}

function continueBlockedMessage(players: string[]): string | null {
  const reason = continueBlockedReason(players);
  if (!reason) return null;
  if (reason.kind === "too-few") {
    return `Encore ${reason.missing} prénom${pluralize(reason.missing)} pour pouvoir jouer.`;
  }
  return "Corrige les prénoms en double ou vides.";
}

interface RowActionButtonProps {
  label: string;
  glyph: string;
  disabled?: boolean;
  onClick: () => void;
}

function RowActionButton({ label, glyph, disabled, onClick }: RowActionButtonProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="e2__icon-btn">
      {glyph}
    </button>
  );
}

/** E2 ("Qui joue ?"): add/rename/reorder/remove players before continuing to E3. */
export function E2({ onNavigate }: ScreenProps) {
  const [players, setPlayers] = useState<string[]>(() => loadGameState().players);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  function commitPlayers(next: string[]) {
    setPlayers(next);
    saveGameState({ ...loadGameState(), players: next });
  }

  function handleAdd() {
    const name = nameInput.trim();
    if (!name) return;
    const result = addPlayer(players, name);
    if (!result.ok) {
      setNameError(result.reason === "max-players" ? "20 joueurs maximum." : `« ${name} » est déjà dans la liste.`);
      return;
    }
    commitPlayers(result.players);
    setNameInput("");
    setNameError(null);
  }

  function handleNameInput(event: ChangeEvent<HTMLInputElement>) {
    setNameInput(event.target.value);
    setNameError(null);
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleAdd();
  }

  const rowFlags = getPlayerRowFlags(players);
  const blockedMessage = continueBlockedMessage(players);
  const continueDisabled = !canContinue(players);
  const addDisabled = !nameInput.trim() || players.length >= MAX_PLAYERS;

  return (
    <section className="e2">
      <div className="e2__header">
        <h1 className="title e2__title">Qui joue ?</h1>
        <span className="e2__counter">
          {players.length} / {MAX_PLAYERS}
        </span>
      </div>
      <div className="e2__add">
        <div className="e2__add-row">
          <input
            value={nameInput}
            onChange={handleNameInput}
            onKeyDown={handleNameKeyDown}
            placeholder="Prénom du joueur"
            maxLength={20}
            className="e2__add-input"
          />
          <Button variant="secondary" onClick={handleAdd} disabled={addDisabled}>
            Ajouter
          </Button>
        </div>
        {nameError && <span className="caption e2__add-error">{nameError}</span>}
      </div>
      {players.length > 0 ? (
        <ol className="e2__list">
          {players.map((name, index) => {
            const flags = rowFlags[index];
            return (
              <li key={index} className={`e2__row${flags.invalid ? " e2__row--invalid" : ""}`}>
                <span className="e2__row-num">{index + 1}</span>
                <input
                  value={name}
                  onChange={(event) => commitPlayers(renamePlayer(players, index, event.target.value))}
                  aria-label={`Prénom du joueur ${index + 1}`}
                  maxLength={20}
                  className="e2__row-input"
                />
                {flags.reason && <span className="caption e2__row-tag">{ROW_TAGS[flags.reason]}</span>}
                <div className="e2__row-actions">
                  <RowActionButton
                    label="Monter"
                    glyph="↑"
                    disabled={index === 0}
                    onClick={() => commitPlayers(movePlayer(players, index, -1))}
                  />
                  <RowActionButton
                    label="Descendre"
                    glyph="↓"
                    disabled={index === players.length - 1}
                    onClick={() => commitPlayers(movePlayer(players, index, 1))}
                  />
                  <RowActionButton
                    label="Supprimer"
                    glyph="×"
                    onClick={() => commitPlayers(removePlayer(players, index))}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="e2__empty">
          <p className="body">Ajoute au moins 3 prénoms pour commencer.</p>
        </div>
      )}
      <div className="e2__continue">
        <Button variant="primary" onClick={() => onNavigate("E3")} disabled={continueDisabled}>
          Continuer
        </Button>
        {continueDisabled && blockedMessage && (
          <span className="caption e2__continue-msg">{blockedMessage}</span>
        )}
      </div>
    </section>
  );
}
