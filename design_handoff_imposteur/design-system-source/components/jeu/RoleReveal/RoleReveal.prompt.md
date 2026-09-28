RoleReveal from imposteur-design-system. Use via `window.Imposteur.RoleReveal` (bundle loaded from the root `_ds_bundle.js`).

# RevelationRole

La tuile d'un joueur éliminé (E7) ou du tableau de fin (E8) : disque de la couleur du rôle avec son icône, prénom, badge du rôle.

- Le consommateur fournit le prénom et le rôle (`civil`, `imposteur`, `mr-white`).
- À la révélation, le disque apparaît en « pop » (500 ms, rebond), puis le badge glisse vers le haut (200 ms). Touchez une tuile de l'aperçu pour rejouer.
- Couleur + icône + nom, toujours ensemble : les couleurs seules ne suffisent pas à distinguer les rôles.
- Sur E6, les joueurs déjà éliminés gardent cette tuile (rôle affiché en permanence), sans animation.

## Props

```ts
interface RoleRevealProps {
  /** Player's first name, shown under the role disc. */
  playerName: string;
  /** The revealed role. */
  role: "civil" | "imposteur" | "mr-white";
  /** Plays the pop-in reveal animation (disc pops in, then the badge slides up) when the tile mounts. Set to `false` for play */
  animate?: boolean;
}
```
