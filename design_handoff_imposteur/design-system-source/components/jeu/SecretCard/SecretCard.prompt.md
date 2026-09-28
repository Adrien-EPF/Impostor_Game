SecretCard from imposteur-design-system. Use via `window.Imposteur.SecretCard` (bundle loaded from the root `_ds_bundle.js`).

# CarteSecrete

La carte de l'écran E5 : face cachée turquoise, puis retournée sur une face `lemon` qui montre le mot en `secret-word`.

- Le consommateur fournit le prénom du joueur et son mot (ou « Tu es Mr. White » à la place du mot).
- « Afficher mon mot » retourne la carte (450 ms avec rebond) ; « J'ai mémorisé » la referme (250 ms) et vide le mot.
- Un Civil et un Imposteur voient exactement la même carte : jamais de couleur ou d'icône de rôle ici.
- Le mot n'est dans le DOM que pendant qu'il est affiché.
- `prefers-reduced-motion` : pas de rotation.
- Les mots longs (« Ping-pong », « Iced Tea ») réduisent leur taille jusqu'à tenir sur une ligne, sans descendre sous 28 px.

## Props

```ts
interface SecretCardProps {
  /** Name of the player currently holding the phone, shown in the hint above the card. */
  playerName: string;
  /** The player's secret word. Leave empty (or omit) for Mr. White, who gets no word at all — the card front then reads "Tu e */
  word?: string;
  /** Called when the card finishes flipping open to reveal the word. */
  onReveal?: () => void;
  /** Called when the player taps "J'ai mémorisé" and the card closes again. */
  onMemorized?: () => void;
}
```
