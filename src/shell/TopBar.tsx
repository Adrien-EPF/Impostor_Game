import type { ReactNode } from "react";
import "./TopBar.css";

/**
 * Top bar shell shown on every screen except E1 (handoff "Layout global").
 * Later tickets decide, per screen, which slots to fill.
 */
export interface TopBarProps {
  title?: string;
  /** Renders the "‹ Retour" pill when provided. */
  onBack?: () => void;
  backLabel?: string;
  /** Renders the step pill (e.g. "Étape 1 sur 2") when provided. */
  stepLabel?: ReactNode;
  /** Renders the "Abandonner" button when provided. */
  onAbandon?: () => void;
  abandonLabel?: string;
}

export function TopBar({
  title = "Imposteur",
  onBack,
  backLabel = "‹ Retour",
  stepLabel,
  onAbandon,
  abandonLabel = "Abandonner",
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__side">
        {onBack && (
          <button type="button" className="top-bar__back" onClick={onBack}>
            {backLabel}
          </button>
        )}
        <p className="top-bar__title">{title}</p>
      </div>
      <div className="top-bar__side">
        {stepLabel && <span className="top-bar__step">{stepLabel}</span>}
        {onAbandon && (
          <button type="button" className="top-bar__abandon" onClick={onAbandon}>
            {abandonLabel}
          </button>
        )}
      </div>
    </header>
  );
}
