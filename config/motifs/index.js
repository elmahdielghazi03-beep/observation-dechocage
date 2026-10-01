// LISTE DES MOTIFS ACTIFS — une ligne par motif.
// Pour ajouter un motif : crée son fichier dans ce dossier (copie d'un motif existant),
// puis ajoute une ligne « import » et son nom dans la liste ci-dessous.
// Voir docs/AJOUTER_UN_MOTIF.md.
import polytraumatisme from "./polytraumatisme.js";
import detresseRespiratoire from "./detresse_respiratoire.js";
import coma from "./coma.js";
import autre from "./autre.js";

export default [polytraumatisme, detresseRespiratoire, coma, autre];
