// Réglages généraux de l'application.
export default {
  nom: "Observation Déchocage",
  // Le numéro de version se change dans sw.js (VERSION) : il est affiché dans ⚙ Réglages.

  // Suppression automatique des dossiers (en jours, 0 = jamais).
  // Un rappel apparaît à l'ouverture de l'app dès qu'un dossier a plus de (N − 1) jours,
  // avec un bouton pour l'exporter en PDF avant suppression.
  suppression_auto_jours: 7,

  // Thème par défaut : "sombre", "clair" ou "auto" (suit le téléphone)
  theme: "sombre",
};
