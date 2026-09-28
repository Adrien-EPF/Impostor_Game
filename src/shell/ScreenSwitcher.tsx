import type { ComponentType } from "react";
import { E1 } from "./screens/E1";
import { E2 } from "./screens/E2";
import { E3 } from "./screens/E3";
import { E4 } from "./screens/E4";
import { E5 } from "./screens/E5";
import { E6 } from "./screens/E6";
import { E7 } from "./screens/E7";
import { E8 } from "./screens/E8";
import { Regles } from "./screens/Regles";
import type { ScreenId } from "./screens/types";

const SCREENS: Record<ScreenId, ComponentType> = {
  E1,
  E2,
  E3,
  E4,
  E5,
  E6,
  E7,
  E8,
  regles: Regles,
};

export interface ScreenSwitcherProps {
  current: ScreenId;
}

/** Routes to the stub (later: real) screen matching `current`. */
export function ScreenSwitcher({ current }: ScreenSwitcherProps) {
  const Screen = SCREENS[current];
  return <Screen />;
}
