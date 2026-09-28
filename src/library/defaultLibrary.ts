import type { WordGroup } from "./parseCsv";

/**
 * Ported verbatim from `DEFAULT_LIB` in the design handoff
 * (design_handoff_imposteur/Imposteur.dc.html).
 */
export const DEFAULT_LIB: WordGroup[] = [
  { cat: "Boissons", words: ["Coca", "Fanta", "Orangina", "Iced Tea", "RedBull"] },
  { cat: "Animaux", words: ["Chat", "Tigre", "Lion", "Lynx", "Guépard", "Panthère"] },
  { cat: "Animaux", words: ["Dauphin", "Requin", "Baleine", "Orque", "Phoque"] },
  { cat: "Sports", words: ["Tennis", "Ping-pong", "Badminton", "Squash", "Padel"] },
  { cat: "Cuisine", words: ["Crêpe", "Gaufre", "Pancake", "Beignet", "Churros"] },
  { cat: "Cuisine", words: ["Pizza", "Tarte flambée", "Quiche", "Focaccia"] },
  { cat: "Lieux", words: ["Plage", "Piscine", "Lac", "Rivière", "Mer"] },
  { cat: "Lieux", words: ["Cinéma", "Théâtre", "Opéra", "Cirque", "Concert"] },
  { cat: "Musique", words: ["Guitare", "Violon", "Ukulélé", "Banjo", "Harpe"] },
  { cat: "Transports", words: ["Vélo", "Trottinette", "Skate", "Roller", "Moto"] },
  { cat: "Métiers", words: ["Pompier", "Policier", "Gendarme", "Militaire", "Douanier"] },
  { cat: "Objets", words: ["Parapluie", "Parasol", "Chapeau", "Casquette", "Capuche"] },
];
