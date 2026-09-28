# Handoff : Imposteur — Web app V1 (écrans E1 à E8 + Règles)

## Overview
Imposteur est un jeu d'ambiance de déduction sociale joué sur **un seul appareil passé de main en main** (3 à 20 joueurs). L'app distribue les mots secrets, désigne qui commence chaque tour, arbitre les éliminations et les conditions de victoire. Discussions et vote se font à l'oral.

Les règles métier complètes sont dans `specs/` (cahier des charges V1, document de contexte, glossaire `CONTEXT.md`). **Ces specs font foi** ; le prototype les implémente.

## About the Design Files
`Imposteur.dc.html` est un **prototype de référence en HTML** (ouvrable directement dans un navigateur via un petit serveur local), pas du code de production. La tâche est de **recréer ces écrans dans la stack cible** — le cahier des charges impose HTML/CSS/JS ou TypeScript sans serveur, avec la **logique de jeu dans un module indépendant de l'UI**, testable seul et réutilisable en V2 (PWA/Capacitor). Choisir un framework léger adapté (ex. Vite + React/TS, ou Vite + TS vanilla).

Le design system **Imposteur** (`design-system-source/components/`) fournit 3 composants React réels : `Button`, `SecretCard`, `RoleReveal`, plus `_ds/…/_ds_bundle.css` (tokens + CSS des composants). Les réutiliser tels quels.

## Fidelity
**High-fidelity.** Couleurs, typo, espacements, copies et interactions sont finaux. Recréer fidèlement.

## Design Tokens
Définis sur `:root` dans `_ds_bundle.css`, avec **une surcharge dans le prototype** : `--turquoise: #4acdcf` (légèrement plus clair que le `#2ec4c6` du DS — voulu par le client).

| Token | Valeur |
|---|---|
| `--surface` | `#ffffff` (fond de page) |
| `--surface-tint` | `#e6f8f8` (panneaux, tuiles) |
| `--ink` / `--ink-muted` | `#1f2a37` / `#5f6b78` |
| `--turquoise` | **`#4acdcf`** (surcharge) — action principale, marque, couleur Civil |
| `--turquoise-deep` | `#067a82` (anneau de focus, accents texte) |
| `--lemon` / `--lemon-strong` | `#fff3b0` / `#ffd84a` |
| `--danger` | `#c9304d` — uniquement « Confirmer l'élimination » |
| `--civil` / `--imposteur` / `--mr-white` | `var(--turquoise)` / `#ff6b81` / `#8f7cff` |
| `--space-2/4/6/10` | 8 / 16 / 24 / 40 px |
| `--radius-sm/lg/pill` | 12 / 24 / 999 px |
| `--shadow-sticker` | `0 4px 0 #1f2a37` (boutons, tuiles cliquables) |
| `--shadow-card` | `0 12px 32px rgba(31,42,55,.14)` (modales, carte secrète) |
| `--font-display` | Baloo 2 (700/800) — titres, prénoms, mots |
| `--font-sans` | Nunito (500/600/800) — texte, contrôles |

Classes typo : `.title` 40/44 800 display · `.heading` 24/30 700 display · `.body` 18/26 500 · `.label` 17/20 800 · `.caption` 14/18 600.

Overlay modal : `rgba(31,42,55,0.55)`.

### Règles DS transverses
- **Un seul** bouton `primary` par écran/état.
- `danger` réservé à la confirmation d'élimination ; **aucun bouton Annuler à côté**.
- Couleur de rôle toujours accompagnée de l'icône **et** du nom (via `RoleReveal` ou pastille avec libellé).
- Au plus un emoji par écran (celui de `SecretCard` : 👀), jamais dans un bouton.
- Tout bouton désactivé est accompagné d'un message expliquant pourquoi.
- Zones cliquables ≥ 44 px ; focus clavier = outline 3 px `--turquoise-deep`.

## Layout global
- Page : fond `--surface`, texte `--ink`, `font-family: --font-sans`, `min-height: 100vh`, colonne flex.
- **Barre du haut** (tous écrans sauf E1) : hauteur min 72 px, padding 12/24, bordure basse 2 px `--surface-tint`. À gauche : bouton « ‹ Retour » (pilule 44 px, bordure 2 px ink, 15 px 800) si applicable, puis « Imposteur » (Baloo 800 26/30). À droite : pastille d'étape (fond `--lemon`, bordure 2 px ink, pilule, caption 800, padding 4/12) « Étape 1 sur 2 » (E2) / « Étape 2 sur 2 » (E3) ; bouton « Abandonner » (bordure `--ink-muted`, texte `--ink-muted`) sur E4 et E6.
- Contenu : conteneur centré `max-width` 720 (E2, E5), 640 (E7), 1040 (E1, E3, E4, Règles), 1200 (E6, E8), padding 24, gap vertical 24.
- **Responsive** : aucun format fixe ; grilles `repeat(auto-fit|auto-fill, minmax(min(100%, Xpx), 1fr))` qui passent d'une colonne (portrait/mobile) à plusieurs (paysage/ordinateur).
- Carte/panneau standard : fond `--surface-tint`, bordure 2 px ink, radius 24, padding 24.
- Champ texte : hauteur 56, padding 0 22, bordure 2 px ink, radius pilule, Nunito 18/600.
- Bouton rond icône (↑ ↓ ×) : 44×44, bordure 2 px ink, fond surface, 800 16–18 px ; opacité 0.35 si désactivé.

## Screens / Views

### E1 — Accueil
- Grille 2 colonnes (`minmax(min(100%,340px),1fr)`, gap 40, padding 40/24), centrée verticalement ; 1 colonne en portrait.
- **Colonne gauche** : pastille « Jeu d'ambiance · 3 à 20 joueurs » (fond `--lemon-strong`, bordure 2 px ink, pilule, 800 14 px, padding 6/14, `rotate(-3deg)`, ombre sticker). Titre « Imposteur » (Baloo 800, `clamp(56px, 8vw, 104px)`, line-height .95, letter-spacing -0.02em). Texte `.body` `--ink-muted` max 420 px : « Un seul appareil, passé de main en main. Chacun reçoit un mot secret. Certains n'ont pas tout à fait le même. Démasquez-les. »
- **Colonne droite** (gap 16) :
  - Panneau bibliothèque (tint) : caption majuscule « Bibliothèque de mots » ; nombre de groupes (Baloo 800 48/52) + « groupes · N catégories » (`.label`) ; source (« Bibliothèque d'exemple intégrée » ou « Importée depuis fichier.csv »). Après import : encart fond `--lemon`, radius 12, bordure 2 px : « X groupes importés, Y lignes ignorées » + en `--danger` « Moins de 4 mots : lignes 4, 9 » (12 max puis « … »). Si 0 groupe valide : « Aucun groupe valide : la bibliothèque actuelle est conservée. »
  - `Button primary` pleine largeur « Nouvelle partie » → E2.
  - Grille 2 colonnes : `Button secondary` « Importer des mots » (ouvre un `<input type=file accept=.csv>` caché) et « Règles ».
  - Caption `--ink-muted` : « CSV UTF-8 · séparateur « ; » ou « , » · colonnes categorie ; mot1 … mot6 ».

### Règles (F20)
- Titre `.title` « Règles du jeu ».
- 3 cartes rôle (grille `minmax(280px,1fr)`) : pastille du rôle (fond couleur rôle, bordure 2 px, pilule, 800 14) + description. Civil : « Voit le mot commun à tous les civils. Ne connaît pas son rôle. Doit éliminer tous les infiltrés. » Imposteur : « Voit un mot proche, partagé avec les autres imposteurs. Il se croit civil. Doit survivre. » Mr. White : « Ne voit aucun mot et le sait. S'il est éliminé, il peut gagner en devinant le mot des civils. »
- 2 colonnes (`minmax(420px,1fr)`) : « Déroulement » (liste ordonnée 4 étapes) et « Victoire » (4 puces : Civils, Infiltrés/parité, Mode Nombre de tours, Chance finale). Voir le prototype pour les textes exacts.
- Retour → E1.

### E2 — Joueurs (F01)
- En-tête : `.title` « Qui joue ? » + pastille compteur « N / 20 » (fond `--lemon`, 800 17).
- Ligne d'ajout : champ « Prénom du joueur » (maxlength 20, Entrée = ajouter) + `Button secondary` « Ajouter » (désactivé si vide ou 20 joueurs). Erreurs en caption `--danger` : « « Léa » est déjà dans la liste. » / « 20 joueurs maximum. »
- Liste : lignes (tint, radius 24, bordure 2 px — **`--danger` si doublon ou vide**) : numéro (Baloo 800 20, `--turquoise-deep`), prénom **éditable en place** (input transparent 800 18), étiquette « Doublon »/« Vide » en danger, boutons ↑ ↓ × (réordonner / supprimer).
- État vide : encadré pointillé 2 px `--ink-muted`, « Ajoute au moins 3 prénoms pour commencer. »
- `Button primary` « Continuer » → E3 ; désactivé si < 3 joueurs ou prénom invalide, avec caption : « Encore X prénom(s) pour pouvoir jouer. » / « Corrige les prénoms en double ou vides. »
- Unicité comparée après normalisation (minuscules, sans accents, espaces, tirets, apostrophes).

### E3 — Réglages (F02, F03, F17)
- Grille 2 colonnes (`minmax(420px,1fr)`).
- **Composition** : deux rangées stepper (tint, radius 24) — pastille couleur 14 px + libellé (« Imposteurs », « Mr. White »), `Button secondary` « − » / « + », valeur Baloo 800 32. Bornes 0…joueurs−1. Encadré résumé fond `--lemon` : « N joueurs → X civils · Y infiltrés · Z infiltrés max ». Erreur RG01 (bordure 2 px `--danger`, texte danger 700 15) : « Il faut au moins un infiltré (imposteur ou Mr. White). » ou « Trop d'infiltrés : il faut plus de civils que d'infiltrés. Avec 8 joueurs, 3 infiltrés au maximum. » (max = ⌊(n−1)/2⌋).
- **Mode de victoire** : 2 tuiles-boutons (radius 24, bordure 2 px) ; sélectionnée = fond `--turquoise` + ombre sticker, sinon fond surface sans ombre. « Classique — Les infiltrés gagnent à la parité. » / « Nombre de tours — Ou s'ils survivent jusqu'au tour N. ». Si Nombre de tours : stepper « Tours (N) », défaut joueurs − 2 (min 1).
- **Catégories** : chips pilule 44 px ; actif = fond turquoise, bordure ink, « ✓ Catégorie n » ; inactif = fond surface, bordure/texte `--ink-muted`, « + Catégorie n ». Stocké comme liste d'exclusions (nouvelles catégories incluses par défaut).
- `Button primary` « Lancer la partie » (max 480, centré) ; désactivé avec message RG01 ou « Choisis au moins une catégorie. ».

### E4 — Distribution (F06)
- `.title` « Touche ton prénom » + body muted « Chacun découvre son mot en secret, puis passe l'appareil. X sur N ont vu leur mot. »
- Barre de progression 12 px (tint, bordure 2 px, pilule), remplissage turquoise, transition largeur 300 ms ease-out.
- Grille de tuiles (`minmax(180px,1fr)`, min-height 96, radius 24) : prénom Baloo 700 24 + état. Non vu : fond surface, ombre sticker, « À toi de voir » (muted). Vu : fond tint, sans ombre, « ✓ Mot vu » (`--turquoise-deep`).
- Tap non vu → E5. Tap vu → modale « Revoir le mot de X ? » / « Seul·e X doit regarder l'écran. » / primary « Oui, c'est moi » / secondary « Non ».
- Quand tous ont vu : « Tout le monde a son mot. » + `Button primary` « Commencer le tour 1 » → E6.

### E5 — Carte secrète
- Centré plein écran : composant **`SecretCard`** (`playerName`, `word` = mot civil / mot imposteur / vide pour Mr. White). Le composant gère « Afficher mon mot » → flip 450 ms, « J'ai mémorisé » → fermeture 250 ms et retrait du mot du DOM.
- `onMemorized` : attendre ~320 ms (fin de l'animation), marquer le joueur « vu », revenir à E4.
- **Un imposteur voit exactement le même écran qu'un civil.**

### E6 — Partie (F07, F08, F10) — lisible à 1 m
- Bandeau 2 cartes (`minmax(320px,1fr)`) : « Tour » (tint ; kicker « TOUR » ou « TOUR · OBJECTIF N », valeur Baloo 800 `clamp(56px,7vw,80px)` : « n° 2 » ou « 2 / 5 ») et « Commence à parler » (fond `--lemon`, ombre sticker ; prénom même taille).
- « En jeu · N » (heading 28/34) + aide « Après le vote, touche le joueur éliminé. » ; grille de tuiles-boutons (min-height 104, fond surface, ombre sticker, Baloo 800 30) → E7.
- « Éliminés · N » : `RoleReveal` avec `animate={false}` (rôle affiché en permanence).
- `Button secondary` centré « Personne n'est éliminé » → fin de tour (vérifs RG05).
- « Abandonner » (barre du haut) → modale « Abandonner la partie ? » / « Les mots et les rôles seront perdus. Les joueurs et réglages sont conservés. » / primary « Continuer la partie » / secondary « Abandonner » → E2 (F15).

### E7 — Élimination (F09, F11)
- **Avant confirmation** (« ‹ Retour » vers E6 visible dans la barre du haut uniquement dans cet état) : kicker « LA TABLE A VOTÉ CONTRE », prénom Baloo 800 `clamp(56px,10vw,88px)`. Case à cocher en carte (min-height 72, radius 24 ; fond `--lemon` une fois cochée ; checkbox 28 px `accent-color: --danger`) : « Éliminer X » / « Son rôle sera révélé à toute la table. C'est définitif. ». `Button danger` pleine largeur « Confirmer l'élimination », désactivé tant que non coché. **Pas de bouton Annuler.**
- **Après confirmation** : kicker « X était Imposteur », `RoleReveal` animé (échelle 1.25).
  - Non Mr. White : `Button primary` « Continuer » → vérifs RG05.
  - Mr. White : panneau fond `--lemon` « Dernière chance, X » / « Devine le mot des civils. Une seule tentative : si tu trouves, ton camp gagne. » + champ « Le mot des civils » + `Button primary` « Valider le mot ». Trouvé → fin immédiate (victoire infiltrés, cause Mr. White). Raté → « Raté. « saisie » n'est pas le mot des civils. » + « Continuer ». **Le mot n'est jamais révélé ici** (RG07).

### E8 — Fin de partie (F13, RG09)
- **Chance finale** (si infiltrés gagnent et ≥1 Mr. White jamais éliminé ; un à la fois) : pastille lemon « Les infiltrés ont gagné · Chance finale 1/2 », `RoleReveal` mr-white animé, texte « X, tu as survécu. Devine le mot des civils pour l'honneur : l'issue de la partie ne change pas. », champ + primary « Deviner le mot ». Retour : encart (`--lemon-strong` si réussi) « Bien joué, X : c'était bien le mot ! » / « Raté : « saisie » n'est pas le mot des civils. » + primary « Mr. White suivant » / « Voir le résultat ».
- **Résultat** : bannière (fond `--civil` ou `--imposteur`, bordure 2 px, ombre sticker, padding 40/24) : cause en kicker (« Tous les infiltrés sont démasqués », « Mr. White a trouvé le mot », « Parité : autant de civils que d'infiltrés », « Les infiltrés ont survécu N tours ») + « Les civils gagnent » / « Les infiltrés gagnent » (Baloo 800 `clamp(48px,8vw,88px)`).
- Cartes : « Mot des civils » et « Mot des imposteurs » (fond lemon, Baloo 800 40) ; « Catégorie · tours joués ».
- Tableau : pour chaque joueur, `RoleReveal` (non animé) + mot (`.label`, « Aucun mot » pour Mr. White) + statut (« En vie » / « Éliminé·e (2ᵉ) », + « · a trouvé le mot » / « · n'a pas trouvé » pour Mr. White).
- `Button primary` « Rejouer » (mêmes joueurs et réglages, nouveau tirage — RG08) · `Button secondary` « Nouvelle partie » → E2.

## Interactions & Behavior (logique à isoler dans un module)
- **Hasard** : `crypto.getRandomValues` ; mélange Fisher-Yates.
- **Tirage (RG02)** : groupe aléatoire parmi les catégories retenues ; mélange des mots ; `mots[0]` = civils, `mots[1]` = imposteurs. Rôles : liste [imposteur×i, mr-white×m, civil×reste] mélangée puis assignée dans l'ordre des joueurs.
- **Premier joueur (RG03)** : retiré **à chaque tour** parmi les vivants non Mr. White.
- **Normalisation / tolérance (RG04)** : minuscules, suppression des diacritiques (NFD), espaces, tirets, apostrophes (' et ’). Accepté si égal, ou Levenshtein ≤ 1 si mot normalisé ≤ 6 lettres, ≤ 2 au-delà. (« Orangina », « Oranjina », « ORANGINA » acceptés ; « Fanta » refusé.)
- **Fin de tour (RG05)**, dans l'ordre : 1) Mr. White éliminé a trouvé → infiltrés ; 2) 0 infiltré vivant → civils ; 3) civils vivants ≤ infiltrés vivants → infiltrés (parité) ; 4) mode tours et `tour ≥ N` → infiltrés (survie) ; 5) sinon `tour + 1`, nouveau premier joueur, retour E6.
- Si infiltrés gagnent : `finalList` = Mr. White vivants → phase chance finale (RG09) ; résultat enregistré dans `mwWins[nom]`, sans effet sur l'issue.
- **Import CSV (F04)** : BOM retiré ; séparateur `;` si présent dans l'en-tête, sinon `,` ; en-tête ignoré ; cellules trimées ; doublons fusionnés après normalisation ; lignes < 4 mots ignorées et signalées par **numéro de ligne du fichier** (en-tête = ligne 1). Un import valide remplace la bibliothèque.
- Transitions : pas d'animations de page ; animations uniquement dans les composants DS (flip carte, pop RoleReveal) + barre de progression E4. Respecter `prefers-reduced-motion` (géré par le DS).

## State Management
- **État de partie** (localStorage `imposteur.etat.v1`, reprise après rechargement) : `screen`, `players[]`, `settings`, `game`, états UI (`cardPlayer`, `elimTarget`, `elimChecked`, `elimDone`, `mwInput`, `mwResult`, `finalInput`, `finalAnswer`, `reviewAsk`, `abandonAsk`).
  - `settings = { imp, mw, mode: 'classic'|'tours', n: number|null (null = joueurs−2), excluded: string[] }`
  - `game = { roles: {nom: 'civil'|'imposteur'|'mr-white'}, civilWord, impWord, cat, seen: {nom: true}, eliminated: [nom…] (ordre), turn, starter, winner: null|'civils'|'infiltres', cause: 'elimination'|'mr-white'|'parite'|'survie', mwWins: {nom: bool}, finalList: [nom…], finalIdx }`
- **Réglages mémorisés** (`imposteur.reglages.v1`, F16) : `{ players, settings }` écrit au lancement ; pré-remplit une nouvelle partie. Ne pas confondre avec l'état de partie.
- **Bibliothèque** (`imposteur.bibliotheque.v1`) : `{ groups: [{cat, words[]}], source: nomFichier|null }`. Par défaut : 12 groupes d'exemple intégrés (voir `DEFAULT_LIB` dans le prototype).
- Élimination : `eliminated` est mis à jour dès la confirmation (irréversible), la vérification RG05 se fait au clic « Continuer » (ou immédiatement si Mr. White trouve).

## Assets
Aucune image. Icônes de rôle (SVG) incluses dans `RoleReveal`. Polices Google Fonts Baloo 2 et Nunito (importées par `_ds_bundle.css` ; à auto-héberger pour le mode hors ligne exigé).

## Files
- `Imposteur.dc.html` — prototype complet (template + logique dans la classe `Component`, constantes et fonctions pures en tête de script : `parseCSV`, `norm`, `lev`, `accept`, `shuffle`, `pickStarter`, `concludeTurn`). Servir le dossier (ex. `npx serve`) et ouvrir ce fichier. Réglage d'aperçu `ecran` pour sauter à un écran avec des données de démo.
- `support.js` — runtime du prototype uniquement (ne pas porter).
- `_ds/…/` — bundle et CSS compilés du design system.
- `design-system-source/components/` — sources React des composants DS (`Button`, `SecretCard`, `RoleReveal`) avec `.d.ts` et `.prompt.md`.
- `specs/` — cahier des charges V1, document de contexte, glossaire.
