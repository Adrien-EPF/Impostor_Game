# Imposteur

Jeu d'ambiance de déduction sociale joué sur un seul appareil passé de main en main. L'application distribue les mots secrets, désigne le joueur qui commence chaque tour, et arbitre les éliminations et les conditions de victoire ; les discussions et le vote se font à l'oral.

## Language

### Rôles

**Civil**:
Joueur qui voit le mot commun à tous les civils et ne connaît pas son propre rôle. Objectif : éliminer tous les infiltrés.

**Imposteur**:
Joueur infiltré qui voit un mot différent des civils (mais du même groupe), partagé avec les autres imposteurs. Il croit être civil.

**Mr. White**:
Joueur infiltré qui ne voit aucun mot. Il connaît son rôle et peut gagner individuellement en devinant le mot des civils.

**Infiltré**:
Catégorie regroupant Imposteurs et Mr. White ; c'est ce total (pas les imposteurs seuls) qui est comparé aux civils dans les règles de composition et de victoire.
_Avoid_: ne pas confondre avec "Imposteur" employé seul — un imposteur n'est qu'une des deux sortes d'infiltrés.

### Déroulement

**Groupe (de mots)**:
Ensemble de 4 à 6 mots proches dans la bibliothèque CSV, dont sont tirés le mot des civils et le mot des infiltrés pour une partie.

**Tour**:
Unité de déroulement du jeu ; se termine par une élimination ou par "Personne n'est éliminé". Les conditions de victoire sont vérifiées après chaque tour.

**Premier joueur**:
Joueur désigné au hasard pour commencer la prise de parole, parmi les joueurs vivants qui ne sont pas Mr. White. Retiré au sort à **chaque tour**, pas une seule fois en début de partie, malgré son nom.
_Avoid_: ne pas supposer qu'il est fixé pour toute la partie.

**Élimination**:
Action définitive : une fois confirmée, le rôle du joueur est révélé à la table et ne peut pas être annulée par l'application.

### Victoire

**Parité**:
Condition de victoire des infiltrés : le nombre de civils vivants est égal au nombre d'infiltrés vivants. Se vérifie après chaque tour, dans les deux modes de jeu.

**Mode Classique**:
Mode de victoire où seule la Parité peut donner la victoire aux infiltrés avant l'élimination de tous les civils.

**Mode Nombre de tours**:
Mode de victoire où les infiltrés gagnent aussi s'ils survivent (au moins un en vie) jusqu'à la fin du tour N, réglable par les joueurs — en plus de la Parité.

**Chance finale (Mr. White)**:
Tentative individuelle de deviner le mot des civils, accordée à chaque Mr. White encore vivant (jamais éliminé) au moment où le camp des infiltrés gagne, quelle qu'en soit la cause (devinette à l'élimination, Parité, ou survie au tour N). N'affecte jamais l'issue de la partie — déjà acquise pour le camp — seulement la reconnaissance individuelle du joueur.

### Persistance

**État de partie**:
Objet de jeu en cours (joueurs, rôles, mots, tour, éliminés), sauvegardé pour reprendre après un rechargement de page.
_Avoid_: à ne pas confondre avec "Réglages mémorisés".

**Réglages mémorisés**:
Dernière liste de joueurs et derniers réglages, conservés pour pré-remplir une nouvelle partie (pas nécessairement en cours).
_Avoid_: à ne pas confondre avec "État de partie".
