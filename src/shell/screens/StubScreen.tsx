import type { ScreenId } from "./types";
import { SCREEN_LABELS } from "./types";

/**
 * Placeholder body for a not-yet-implemented screen. Later tickets replace
 * the corresponding `screens/<id>.tsx` file's content with the real screen.
 */
export function StubScreen({ id }: { id: ScreenId }) {
  return (
    <section className="body" style={{ padding: 24 }}>
      <p className="heading">
        {id} — {SCREEN_LABELS[id]}
      </p>
      <p className="caption">Écran à venir.</p>
    </section>
  );
}
