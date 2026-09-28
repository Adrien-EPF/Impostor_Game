import * as React from 'react';

/**
 * Button — from imposteur-design-system@2.0.0.
 * @replaces button
 */
export interface ButtonProps {
  /** Visual style. `primary` (turquoise) is the one main action per screen. `secondary` (outline) is for every other action.  */
  variant?: "primary" | "secondary" | "danger";
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const Button: React.ComponentType<ButtonProps>;
