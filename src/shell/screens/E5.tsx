import { useState } from "react";
import { SecretCard } from "../../design-system";
import { loadGameState, saveGameState } from "../../state/gameState";
import type { ScreenProps } from "../ScreenSwitcher";
import "./E5.css";

/** Delay before returning to E4, matching the card's own close animation. */
const CLOSE_ANIMATION_MS = 320;

/** E5 ("Carte secrète"): the current player's private word, shown via `SecretCard`, then back to E4. */
export function E5({ onNavigate }: ScreenProps) {
  const [state] = useState(() => loadGameState());
  const { game, cardPlayer } = state;
  if (!game || !cardPlayer) return null;

  const role = game.roles[cardPlayer];
  const word = role === "mr-white" ? undefined : role === "imposteur" ? game.imposteurWord : game.civilWord;

  const handleMemorized = () => {
    const nextGame = { ...game, seen: { ...game.seen, [cardPlayer]: true } };
    saveGameState({ ...state, game: nextGame, cardPlayer: null });
    setTimeout(() => onNavigate("E4"), CLOSE_ANIMATION_MS);
  };

  return (
    <section className="e5">
      <SecretCard playerName={cardPlayer} word={word} onMemorized={handleMemorized} />
    </section>
  );
}
