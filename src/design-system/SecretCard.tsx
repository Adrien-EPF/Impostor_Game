import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./Button";

/**
 * Ported from imposteur-design-system@2.0.0 (see
 * design_handoff_imposteur/design-system-source/components/jeu/SecretCard).
 * Markup, className contract and behaviour kept identical to the vendored
 * bundle so ds-bundle.css and its animations apply unchanged.
 */
export interface SecretCardProps {
  /** Name of the player currently holding the phone, shown in the hint above the card. */
  playerName: string;
  /** The player's secret word. Leave empty (or omit) for Mr. White, who gets no word at all — the card front then reads "Tu es Mr. White". */
  word?: string;
  /** Called when the card finishes flipping open to reveal the word. */
  onReveal?: () => void;
  /** Called when the player taps "J'ai mémorisé" and the card closes again. */
  onMemorized?: () => void;
}

export function SecretCard({ playerName, word, onReveal, onMemorized }: SecretCardProps) {
  const [open, setOpen] = useState(false);
  const wordRef = useRef<HTMLElement>(null);
  const isMrWhite = !word;

  useLayoutEffect(() => {
    const el = wordRef.current;
    if (!open || !el) return;
    let size = 56;
    el.style.fontSize = size + "px";
    el.style.lineHeight = size + 4 + "px";
    while (el.scrollWidth > el.clientWidth && size > 28) {
      size -= 2;
      el.style.fontSize = size + "px";
      el.style.lineHeight = size + 4 + "px";
    }
  }, [open, word]);

  function handleClick() {
    if (open) {
      setOpen(false);
      onMemorized?.();
    } else {
      setOpen(true);
      onReveal?.();
    }
  }

  return (
    <div className="secret-card">
      <p className="secret-card__hint">
        Passe le téléphone à <b>{playerName}</b>. Les autres, on regarde ailleurs 👀
      </p>
      <div className="secret-card__scene">
        <div className={`secret-card__card${open ? " secret-card__card--open" : ""}`}>
          <div className="secret-card__face secret-card__face--back">
            <span>?</span>
          </div>
          <div className="secret-card__face secret-card__face--front" aria-live="polite">
            {open &&
              (isMrWhite ? (
                <strong className="secret-card__word" style={{ fontSize: 40, lineHeight: "44px" }}>
                  Tu es Mr. White
                </strong>
              ) : (
                <Fragment>
                  <small>Ton mot</small>
                  <strong className="secret-card__word" ref={wordRef}>
                    {word}
                  </strong>
                  <small>Chut.</small>
                </Fragment>
              ))}
          </div>
        </div>
      </div>
      <Button variant={open ? "secondary" : "primary"} onClick={handleClick}>
        {open ? "J'ai mémorisé" : "Afficher mon mot"}
      </Button>
    </div>
  );
}
