Button from imposteur-design-system. Use via `window.Imposteur.Button` (bundle loaded from the root `_ds_bundle.js`).

# Bouton

Bouton pilule style autocollant, 56 px de haut, avec une ombre dure qui s'écrase au clic.

- **primary** (`turquoise`, texte `ink`) : l'action principale, une seule par écran — Lancer la partie, Afficher mon mot, Confirmer.
- **secondary** (`surface`, contour `ink`) : les autres actions — Personne n'est éliminé, Règles, Rejouer.
- **danger** (`danger`, texte `surface`) : uniquement « Éliminer », qui est définitif.
- **disabled** : fond `surface-tint`, texte `ink-muted`, sans ombre ; toujours accompagné d'un message qui explique pourquoi (ex. RG01 : trop d'infiltrés).

Libellé = un verbe qui dit l'action ; pas d'emoji. Focus clavier : anneau `turquoise-deep` de 3 px.

## Props

```ts
interface ButtonProps {
  /** Visual style. `primary` (turquoise) is the one main action per screen. `secondary` (outline) is for every other action.  */
  variant?: "primary" | "secondary" | "danger";
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```
