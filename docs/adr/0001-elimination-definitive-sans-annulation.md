# Élimination définitive, sans annulation

Le cahier des charges V1 prévoyait (F14, P2) un bouton pour annuler la dernière élimination en cas de clic accidentel. On y renonce : dès qu'une élimination est confirmée, le rôle du joueur est révélé à voix haute à la table, et l'application ne peut pas effacer cette information déjà connue de tout le monde. Un "annuler" côté écran créerait un état incohérent entre ce que la table sait et ce que l'app affiche, ce qui est pire qu'un clic accidentel occasionnel.

**Précision** : cette décision ne vaut qu'une fois l'élimination *confirmée*. Avant la confirmation (écran « La table a voté contre… »), rien n'a été révélé : un bouton « Annuler » y est permis et renvoie à l'écran de tour sans rien éliminer.
