// SUGGESTIONS DE MODULES — quand une donnée saisie évoque un autre motif, l'app propose
// d'ajouter le module correspondant (tu acceptes ou tu ignores). Les modules pas encore
// disponibles sont ignorés automatiquement.

export default [
  { si: "detresse_respiratoire", module: "detresse_respiratoire", message: "Signes de détresse respiratoire" },
  { si: "trouble_conscience && !motif('polytraumatisme')", module: "coma", message: "Troubles de la conscience" },
  { si: "instabilite", module: "etat_choc", message: "Instabilité hémodynamique" },
  { si: "dans(convulsions, 'en_cours', 'avant')", module: "convulsions", message: "Convulsions" },
  { si: "deficit == 'oui'", module: "avc", message: "Déficit neurologique" },
  { si: "grossesse == 'oui'", module: "femme_enceinte", message: "Grossesse en cours" },
  { si: "coche('eruption', 'urticaire') || coche('eruption', 'angio')", module: "anaphylaxie", message: "Urticaire / angio-œdème" },
];
