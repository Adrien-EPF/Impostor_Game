import * as React from 'react';

/**
 * RoleReveal — from imposteur-design-system@2.0.0.
 */
export interface RoleRevealProps {
  /** Player's first name, shown under the role disc. */
  playerName: string;
  /** The revealed role. */
  role: "civil" | "imposteur" | "mr-white";
  /** Plays the pop-in reveal animation (disc pops in, then the badge slides up) when the tile mounts. Set to `false` for play */
  animate?: boolean;
}

export declare const RoleReveal: React.ComponentType<RoleRevealProps>;
