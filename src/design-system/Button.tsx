import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

/**
 * Ported from imposteur-design-system@2.0.0 (see
 * design_handoff_imposteur/design-system-source/components/actions/Button).
 * Markup and className contract kept identical to the vendored bundle so
 * ds-bundle.css applies unchanged.
 */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** `primary` (turquoise) is the one main action per screen. `secondary` (outline) is for every other action. */
  variant?: "primary" | "secondary" | "danger";
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", type = "button", className, ...rest }, ref) {
    const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
    return <button ref={ref} type={type} className={classes} {...rest} />;
  },
);
