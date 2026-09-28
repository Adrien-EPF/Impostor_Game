# Imposteur — Document de contexte

Sep 28, 2026 · @Adrien

## Présentation du projet

**Imposteur** est un jeu d'ambiance de déduction sociale, joué autour d'une table sur un seul appareil que l'on se passe. L'application distribue les mots secrets, désigne le premier joueur et gère les éliminations ; les discussions et le vote se font à l'oral.

Objectifs :

- Remplacer les cartes papier par une application simple, rapide à lancer, jouable de 3 à 20 joueurs.
- Proposer des mots difficiles à démasquer grâce à des **groupes de 4 à 6 mots proches** (ex. Coca, Fanta, Orangina, Iced Tea, RedBull).
- Tester d'abord sur ordinateur (V1, web app locale), puis porter le même code en application mobile (V2).

L'interface graphique sera conçue avec Claude Design ; la bibliothèque de mots est un fichier Excel/CSV externe, modifiable sans toucher au code.

## Principe du jeu et rôles

Au début de chaque partie, l'application tire un groupe de mots, choisit un mot pour les civils et un autre mot du même groupe pour les imposteurs.

| Rôle | Ce qu'il voit | Sait-il son rôle ? | Objectif |
| --- | --- | --- | --- |
| Civil | Le mot des civils (identique pour tous) | Non | Éliminer tous les imposteurs et Mr. White |
| Imposteur | Un mot proche, commun à tous les imposteurs | Non, il croit être civil | Survivre sans se faire repérer |
| Mr. White | Aucun mot, le message « Tu es Mr. White » | Oui | Survivre, ou deviner le mot des civils à son élimination |

Le nombre d'imposteurs et de Mr. White est fixé avant la partie. Il faut au moins un infiltré (imposteur ou Mr. White) et strictement plus de civils que d'infiltrés.

## Déroulement d'une partie

&#91;embedded content: déroulement d'une partie · boucle de tours\]

1. **Paramétrage** : saisie des prénoms, nombre d'imposteurs et de Mr. White, règle de victoire.
2. **Distribution** : l'appareil passe de main en main ; chaque joueur touche son prénom, voit son mot en privé, le cache, puis passe l'appareil.
3. **Tour de parole** : l'application désigne aléatoirement le premier joueur (jamais Mr. White) ; chacun donne à l'oral un mot qui évoque le mot des civils.
4. **Vote** : la table débat et vote à l'oral. En cas d'égalité, la table redécide ; elle peut aussi n'éliminer personne.
5. **Élimination** : on touche le prénom du joueur, on coche « Éliminer », son rôle est révélé. S'il est Mr. White, il saisit le mot des civils : s'il le trouve, il gagne immédiatement.
6. L'application vérifie les conditions de victoire, sinon un nouveau tour commence.

## Conditions de victoire

Les civils gagnent dès que tous les imposteurs et tous les Mr. White sont éliminés. Pour les infiltrés (imposteurs + Mr. White), la victoire se déclenche dans les deux modes dès la **parité** : autant de civils vivants que d'infiltrés vivants. Le mode Nombre de tours ajoute un second chemin de victoire :

| Mode | Les infiltrés gagnent si… | Réglage |
| --- | --- | --- |
| Classique | Parité uniquement (civils vivants = infiltrés vivants) | Aucun |
| Nombre de tours | Parité, ou au moins un infiltré encore en vie à la fin du tour N | N choisi par les joueurs (valeur proposée : nombre de joueurs − 2) |

Dans les deux modes, c'est le camp des infiltrés qui gagne, y compris ses membres déjà éliminés. Si un ou plusieurs Mr. White sont encore vivants (jamais éliminés) au moment de cette victoire, chacun obtient une tentative individuelle de deviner le mot des civils (chance finale), sans effet sur l'issue déjà acquise — voir RG09 et `docs/adr/0002-victoire-infiltres-par-parite.md`. Mr. White peut aussi gagner via une devinette réussie au moment de sa propre élimination.

## Bibliothèque de mots

Les mots sont fournis dans un fichier CSV (éditable dans Excel), une ligne par groupe de 4 à 6 mots proches. Un gabarit `mots_imposteur.csv` accompagne ce document.

```csv
categorie;mot1;mot2;mot3;mot4;mot5;mot6
Boissons;Coca;Fanta;Orangina;Iced Tea;RedBull;
Animaux;Chat;Tigre;Lion;Lynx;Guépard;Panthère
```

Pourquoi des groupes plutôt que des paires : le mot des civils est tiré au hasard parmi 4 à 6, donc l'imposteur et Mr. White ne peuvent pas le déduire d'une paire connue. À chaque partie, l'application tire un groupe, puis deux mots distincts : un pour tous les civils, un pour tous les imposteurs.

## Feuille de route et décisions prises

| Version | Support | Contenu |
| --- | --- | --- |
| V1 | Web app locale (navigateur de l'ordinateur) | Jeu complet sur un seul appareil, import du CSV, tests des règles |
| V2 | Application mobile | Même code empaqueté (PWA ou Capacitor), ergonomie tactile |
| Plus tard | Plusieurs téléphones | Chaque joueur sur son appareil (nécessite un serveur) |

Décisions validées :

- Un seul appareil passé de main en main (V1 et V2).
- Web app locale pour la V1, pour réutiliser le code en V2.
- Tous les imposteurs ont le même mot ; l'imposteur ne sait pas qu'il l'est.
- Mr. White saisit sa réponse ; la vérification ignore majuscules, accents, espaces et petites fautes.
- Vote à l'oral ; l'application enregistre seulement l'élimination.
- Pas de score cumulé : une partie = un gagnant, rejouable avec les mêmes joueurs.
- 3 à 20 joueurs.

Questions résolues (session de cadrage du 28/09/2026) :

- Mode classique, égalité numérique (ex. 2 contre 2) : tranché en faveur de la parité — les infiltrés gagnent dès que civils vivants = infiltrés vivants, dans les deux modes (voir `docs/adr/0002-victoire-infiltres-par-parite.md`).
- Options sans préférence exprimée : mémoriser les joueurs et filtrer par catégorie restent « souhaitables » ; le minuteur reste P3 ; éviter les répétitions de groupes de mots (F18) est abandonné au profit d'un tirage 100 % aléatoire.
- Annulation d'une élimination (F14) : abandonnée, une élimination confirmée est définitive (voir `docs/adr/0001-elimination-definitive-sans-annulation.md`).
