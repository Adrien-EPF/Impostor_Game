import * as React from 'react';

/**
 * SecretCard — from imposteur-design-system@2.0.0.
 */
export interface SecretCardProps {
  /** Name of the player currently holding the phone, shown in the hint above the card. */
  playerName: string;
  /** The player's secret word. Leave empty (or omit) for Mr. White, who gets no word at all — the card front then reads "Tu e */
  word?: string;
  /** Called when the card finishes flipping open to reveal the word. */
  onReveal?: () => void;
  /** Called when the player taps "J'ai mémorisé" and the card closes again. */
  onMemorized?: () => void;
}

export declare const SecretCard: React.ComponentType<SecretCardProps>;
