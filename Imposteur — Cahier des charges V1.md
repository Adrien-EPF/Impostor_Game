# Imposteur — Cahier des charges V1

Sep 28, 2026 · @Adrien

> Mise à jour du 28/09/2026 (session de cadrage) : condition de victoire des infiltrés revue (règle de parité, RG05), chance finale de Mr. White ajoutée (RG09), F14 et F18 retirées du périmètre. Détails et raisons dans `docs/adr/`.

La V1 est une web app locale, jouable hors ligne sur un seul ordinateur, qui distribue les mots, désigne le premier joueur et arbitre les éliminations. Les règles détaillées sont dans le document de contexte.

## Périmètre et contraintes

- **Plateforme** : navigateur récent (Chrome, Edge, Firefox, Safari) sur ordinateur, sans installation ni connexion Internet.
- **Mode de jeu** : un seul appareil passé de main en main, de 3 à 20 joueurs.
- **Langue** : français.
- **Interface** : maquettes produites avec Claude Design, puis intégrées ; l'interface doit rester utilisable à la souris et au tactile (préparation V2).
- **Contenu** : bibliothèque de mots chargée depuis un fichier CSV externe.
- **Priorités** : P1 = indispensable à la V1, P2 = souhaitable, P3 = si le temps le permet.

## Exigences fonctionnelles

| ID | Exigence | Priorité |
| --- | --- | --- |
| F01 | Saisir, modifier, supprimer et réordonner les prénoms (3 à 20, prénoms uniques) | P1 |
| F02 | Choisir le nombre d'imposteurs (0 à n) et de Mr. White (0 à n), avec contrôle de cohérence | P1 |
| F03 | Choisir le mode de victoire : Classique ou Nombre de tours (N réglable, défaut = joueurs − 2) | P1 |
| F04 | Importer un fichier CSV de mots et afficher le nombre de groupes valides et les erreurs | P1 |
| F05 | Tirer un groupe, le mot des civils et le mot des imposteurs, puis attribuer les rôles au hasard | P1 |
| F06 | Distribution privée : liste des prénoms, un joueur touche son nom, confirme, voit son mot, le masque ; un joueur ne peut revoir son mot qu'après confirmation | P1 |
| F07 | Désigner au hasard le joueur qui commence, jamais un Mr. White, parmi les joueurs en vie | P1 |
| F08 | Écran de partie : liste des joueurs en vie/éliminés, numéro du tour, joueur qui commence | P1 |
| F09 | Éliminer un joueur : toucher son nom, cocher « Éliminer », confirmer ; son rôle est révélé | P1 |
| F10 | Bouton « Personne n'est éliminé » pour passer au tour suivant | P1 |
| F11 | Si Mr. White est éliminé : champ de saisie du mot, vérification tolérante, victoire immédiate s'il trouve | P1 |
| F12 | Vérifier les conditions de victoire après chaque élimination et chaque fin de tour | P1 |
| F13 | Écran de fin : camp gagnant, rôle et mot de chaque joueur, boutons « Rejouer » (mêmes joueurs) et « Nouvelle partie » | P1 |
| F15 | Abandonner la partie en cours et revenir au paramétrage | P1 |
| F16 | Mémoriser la dernière liste de joueurs et les derniers réglages | P2 |
| F17 | Filtrer les catégories de mots utilisées | P2 |
| F19 | Minuteur de parole optionnel (durée réglable) | P3 |
| F20 | Écran « Règles du jeu » accessible depuis l'accueil | P2 |

## Écrans à concevoir

Huit écrans à maquetter dans Claude Design, dans l'ordre du parcours. Chaque maquette doit exister en format paysage (ordinateur) et portrait (mobile V2).

| # | Écran | Contenu | Actions |
| --- | --- | --- | --- |
| E1 | Accueil | Titre, statut de la bibliothèque (nb de groupes) | Nouvelle partie, Importer des mots, Règles |
| E2 | Joueurs | Liste des prénoms, compteur 3–20 | Ajouter, supprimer, réordonner, Continuer |
| E3 | Réglages | Nb d'imposteurs, nb de Mr. White, mode de victoire, N tours, catégories | Lancer la partie |
| E4 | Distribution | Grille des prénoms (déjà vus = cochés) | Toucher son nom |
| E5 | Carte secrète | « Passe l'appareil à \[Prénom\] », puis le mot ou « Tu es Mr. White » | Afficher, J'ai mémorisé |
| E6 | Partie | Tour n°, joueur qui commence, joueurs en vie / éliminés (rôle affiché en permanence pour les joueurs déjà éliminés) | Toucher un joueur, Personne éliminé, Abandonner |
| E7 | Élimination | Fiche du joueur, case « Éliminer », rôle révélé ; pour Mr. White, champ de saisie | Confirmer, Valider le mot |
| E8 | Fin de partie | Chance finale (si un Mr. White vivant n'a jamais été éliminé, un champ de saisie par Mr. White concerné, avant le résultat) puis camp gagnant, tableau joueur · rôle · mot | Deviner le mot (le cas échéant), Rejouer, Nouvelle partie |

Point d'attention : sur E5, le mot ne doit jamais être visible avant l'action « Afficher », et doit disparaître après « J'ai mémorisé ». Le rôle d'imposteur n'est jamais mentionné : un imposteur voit le même écran qu'un civil. Sur E7, l'élimination est définitive dès confirmation : il n'y a pas de bouton « Annuler » (voir `docs/adr/0001-elimination-definitive-sans-annulation.md`).

## Règles de gestion

- **RG01 — Composition** : infiltrés (imposteurs + Mr. White) ≥ 1 et civils > infiltrés. Exemple : 3 joueurs = 2 civils + 1 infiltré maximum ; 8 joueurs = 3 infiltrés maximum. Le bouton « Lancer » reste désactivé sinon, avec un message explicatif.
- **RG02 — Tirage** : un groupe est tiré au hasard (catégories retenues, hors groupes récents si possible). Deux mots distincts y sont tirés : le mot des civils et le mot des imposteurs. Les rôles sont attribués par mélange aléatoire uniforme (Fisher-Yates).
- **RG03 — Premier joueur** : tiré à chaque tour parmi les joueurs en vie qui ne sont pas Mr. White.
- **RG04 — Réponse de Mr. White** : une seule tentative par Mr. White. Réponse et mot sont normalisés (minuscules, sans accents, espaces, tirets ni apostrophes). Acceptée si identique, ou à 1 faute près (distance de Levenshtein) pour un mot **normalisé** de 6 lettres ou moins, 2 fautes au-delà. Le seuil de longueur s'applique au mot après normalisation, pas au mot affiché.
- **RG05 — Ordre des vérifications après un tour** (élimination ou « Personne n'est éliminé ») :
  1. Mr. White éliminé et mot trouvé → victoire de Mr. White (son camp gagne).
  2. Plus aucun infiltré (imposteurs + Mr. White) en vie → victoire des civils.
  3. Civils vivants = infiltrés vivants (parité) → victoire des infiltrés, quel que soit le mode.
  4. Mode Nombre de tours et fin du tour N atteinte avec au moins un infiltré en vie → victoire des infiltrés.
  5. Sinon, le tour se termine (ou un nouveau tour commence).
- **RG06 — Fin de tour** : un tour se termine par une élimination ou par « Personne n'est éliminé ».
- **RG07 — Confidentialité** : les rôles et mots ne sont jamais affichés en dehors de E5, E6 (joueur déjà éliminé), E7 (au moment de l'élimination) et E8.
- **RG08 — Rejouer** : mêmes joueurs et réglages, nouveau tirage de groupe, de mots et de rôles.
- **RG09 — Chance finale de Mr. White** : chaque fois que le camp des infiltrés gagne (RG05.1, RG05.3 ou RG05.4) et qu'un ou plusieurs Mr. White sont encore vivants (jamais éliminés), chacun obtient sa propre tentative de deviner le mot des civils, avec la même tolérance que RG04. Le résultat de cette tentative n'affecte jamais l'issue de la partie — déjà acquise pour le camp des infiltrés — il ne sert qu'à la reconnaissance individuelle affichée sur E8 ; plusieurs Mr. White peuvent chacun réussir indépendamment.

## Fichier de mots

Le gabarit `mots_imposteur.csv` fixe le format : encodage UTF-8, séparateur point-virgule (format par défaut d'Excel en français), une ligne d'en-tête puis une ligne par groupe.

| Colonne | Obligatoire | Règle |
| --- | --- | --- |
| categorie | Oui | Texte libre, sert au filtre F17 |
| mot1 à mot4 | Oui | Un mot ou une courte expression par cellule |
| mot5, mot6 | Non | Laisser vide si le groupe compte 4 ou 5 mots |

Contrôles à l'import (F04) :

- Une ligne avec moins de 4 mots est ignorée et signalée avec son numéro.
- Espaces en début et fin supprimés ; doublons dans un même groupe fusionnés (après normalisation RG04).
- Les virgules sont aussi acceptées comme séparateur (détection automatique).
- Résumé affiché : X groupes importés, Y lignes ignorées.
- La bibliothèque importée est conservée dans le navigateur ; un nouvel import la remplace.

## Exigences techniques

- **Technologie** : HTML, CSS et JavaScript (ou TypeScript), sans serveur ; lancement en ouvrant un fichier ou via un petit serveur local.
- **Séparation logique / affichage** : les règles (tirage, rôles, victoire, vérification Mr. White) sont dans un module indépendant de l'interface, testable seul et réutilisable tel quel en V2.
- **État de partie** : un objet unique (joueurs, rôles, mots, tour, éliminés) sauvegardé dans le stockage local, pour reprendre une partie après un rechargement de page.
- **Hasard** : générateur `crypto.getRandomValues` pour un tirage non prévisible.
- **Accessibilité** : zones cliquables d'au moins 44 px, contraste suffisant, textes lisibles à 1 m de distance sur E6.
- **Performance** : import d'un fichier de 1 000 groupes en moins d'une seconde.
- **Préparation V2** : mise en page responsive dès la V1 ; empaquetage mobile prévu en PWA ou avec Capacitor, sans réécriture de la logique.

## Critères d'acceptation

La V1 est acceptée quand tous ces scénarios passent :

- [ ] 5 joueurs, 1 imposteur, 0 Mr. White : les 4 civils voient le même mot, l'imposteur un autre mot du même groupe, sans mention de son rôle.
- [ ] 8 joueurs : impossible de lancer avec 4 infiltrés (RG01).
- [ ] Sur 100 tirages, Mr. White n'est jamais désigné pour commencer.
- [ ] Mot « Orangina » : « orangina », « Oranjina » et « ORANGINA » sont acceptés ; « Fanta » est refusé.
- [ ] Mr. White éliminé trouve le mot : fin immédiate, victoire de Mr. White.
- [ ] Dernier infiltré éliminé : victoire des civils, y compris au tour N en mode Nombre de tours.
- [ ] Mode Classique, 4 joueurs dont 1 imposteur : après 2 civils éliminés, victoire des infiltrés.
- [ ] Mode Nombre de tours, N = 2 : un imposteur en vie après 2 tours → victoire des infiltrés.
- [ ] 8 joueurs, 3 infiltrés : dès que 2 civils sont éliminés (3 civils = 3 infiltrés), victoire immédiate des infiltrés par parité (RG05.3), sans attendre un seuil plus tardif.
- [ ] Un Mr. White survit jusqu'à la victoire des infiltrés par parité ou par survie au tour N : il obtient une tentative de deviner le mot des civils (RG09), sans que le résultat ne change l'issue de la partie.
- [ ] Une élimination confirmée ne peut pas être annulée : aucun bouton « Annuler » n'est présent sur E7.
- [ ] Import d'un CSV avec une ligne de 3 mots : ligne ignorée et signalée, les autres importées.
- [ ] Rechargement de la page en cours de partie : la partie reprend au même état.
- [ ] Rejouer : mêmes joueurs, nouveaux mots et nouveaux rôles.

## Hors périmètre V1

- Parties sur plusieurs téléphones (un appareil par joueur).
- Scores cumulés et classements entre parties.
- Vote dans l'application et gestion automatique des égalités.
- Comptes utilisateurs, synchronisation en ligne, éditeur de mots intégré.
- Publication sur les stores mobiles (objet de la V2).
- Annulation d'une élimination confirmée (`docs/adr/0001-elimination-definitive-sans-annulation.md`).
- Suivi d'un historique des groupes de mots joués pour éviter les répétitions (F18 initiale) : le tirage de groupe reste 100 % aléatoire.
