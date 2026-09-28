export type ScreenId = "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "regles";

export const SCREEN_ORDER: ScreenId[] = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "regles"];

export const SCREEN_LABELS: Record<ScreenId, string> = {
  E1: "Accueil",
  E2: "Joueurs",
  E3: "Réglages",
  E4: "Distribution",
  E5: "Carte secrète",
  E6: "Partie",
  E7: "Élimination",
  E8: "Fin de partie",
  regles: "Règles du jeu",
};
