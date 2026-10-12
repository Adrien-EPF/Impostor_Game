<p align="center">
  <img src="assets/banner.svg" alt="Imposteur — le jeu d'ambiance de déduction sociale" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Adrien-EPF/Impostor_Game/releases/tag/latest"><img alt="Télécharger l'APK" src="https://img.shields.io/badge/T%C3%A9l%C3%A9charger-APK%20Android-2ec4c6?style=for-the-badge&labelColor=1f2a37"></a>
  <img alt="De 3 à 20 joueurs" src="https://img.shields.io/badge/Joueurs-3%20%C3%A0%2020-ffd84a?style=for-the-badge&labelColor=1f2a37">
  <img alt="Hors ligne" src="https://img.shields.io/badge/Hors%20ligne-oui-ff6b81?style=for-the-badge&labelColor=1f2a37">
</p>

**Imposteur** est un jeu d'ambiance de déduction sociale, joué sur **un seul appareil** passé de main en main. L'application distribue les mots secrets, désigne qui commence chaque tour et arbitre les éliminations. Les discussions et les votes se font à l'oral.

## 🎭 Les rôles

| Rôle | Ce qu'il voit | Son objectif |
| --- | --- | --- |
| 🟢 **Civil** | Le mot commun à tous les civils | Éliminer tous les infiltrés |
| 🔴 **Imposteur** | Un mot *proche* de celui des civils, mais différent. Il croit être civil. | Se fondre dans la masse jusqu'à la victoire |
| 🟣 **Mr. White** | Aucun mot, et il le sait | Deviner le mot des civils, ou survivre |

Les imposteurs et les Mr. White forment les **infiltrés**. Ils gagnent quand les civils vivants ne sont plus plus nombreux qu'eux (la **parité**), ou, dans le mode « Nombre de tours », s'ils survivent jusqu'à la fin du tour choisi.

## 🕹️ Une partie

1. **Joueurs** : saisissez les prénoms (de 3 à 20).
2. **Réglages** : nombre d'imposteurs et de Mr. White, mode de victoire, catégories de mots.
3. **Distribution** : chacun touche son prénom, découvre son mot en privé, puis le masque avant de passer l'appareil.
4. **Tours** : l'appli désigne qui parle en premier, la table débat et vote, puis on élimine un joueur. Son rôle est alors révélé.
5. **Fin** : le camp gagnant est annoncé, avec le rôle et le mot de chacun.

Si un Mr. White est éliminé, il a une chance de gagner sur-le-champ en devinant le mot des civils.

## 📲 Installer l'app

### Sur Android

1. Ouvrez la page [**Releases**](https://github.com/Adrien-EPF/Impostor_Game/releases/tag/latest) depuis le téléphone.
2. Téléchargez `Imposteur.apk` et ouvrez-le.
3. Autorisez l'installation depuis cette source si Android le demande.

Chaque modification poussée sur `main` publie un nouvel APK au même endroit. Pour mettre à jour, retéléchargez-le et installez-le par-dessus : vos réglages sont conservés.

### Sur ordinateur

```bash
npm install
npm run dev
```

Puis ouvrez l'adresse affichée dans le terminal.

## 📚 Bibliothèque de mots

Les mots viennent de [`mots_imposteur.csv`](mots_imposteur.csv) : des **groupes** de 4 à 6 mots proches (au moins 70 groupes). On peut aussi importer son propre fichier CSV depuis l'accueil.

## 🛠️ Pour les curieux

| | |
| --- | --- |
| **Interface** | React 19 + TypeScript, bundlée avec Vite |
| **Style** | Design system maison (turquoise, citron, ombres « sticker »), polices Baloo 2 et Nunito embarquées pour fonctionner hors ligne |
| **App Android** | [Capacitor](https://capacitorjs.com/), compilée par GitHub Actions ([`android.yml`](.github/workflows/android.yml)) |
| **Données** | Stockées localement sur l'appareil, sans serveur ni compte |

```bash
npm test          # tests unitaires et d'interface
npm run build     # build de production dans dist/
npm run typecheck # vérification des types
```

Pour aller plus loin : [`CONTEXT.md`](CONTEXT.md) (vocabulaire du jeu), [`docs/adr/`](docs/adr) (décisions de conception) et le [cahier des charges V1](<Imposteur — Cahier des charges V1.md>).
