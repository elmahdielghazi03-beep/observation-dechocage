// MODÈLE DE RÉDACTION DE L'OBSERVATION — fichier modifiable.
// C'est ici qu'on adapte le plan au modèle du service :
//   - l'ordre et les titres des parties (« sections ») ;
//   - les phrases de liaison (gestes, réévaluations, brouillon de synthèse).
// "source" = section du formulaire dont le contenu est rédigé dans cette partie.
// Le détail des phrases de chaque champ se trouve dans config/sections/*.js et config/motifs/*.js.
// Syntaxe : {nom} = donnée ; [ … ] = partie supprimée si une donnée manque ;
// {e} = accord féminin avec la patiente ; {es} = accord avec le nom sujet (« le nourrisson » reste masculin).

export default {
  titre: "Observation médicale — Déchocage",
  sous_titre: "Rédigée le {date_redaction} à {heure_redaction}",

  sections: [
    { titre: "Identité", source: "identite" },
    { titre: "Motif d'admission", source: "motifs" },
    { titre: "Antécédents", source: "antecedents" },
    { titre: "Histoire de la maladie", source: "hdm" },
    { titre: "Évaluation initiale (ABCDE)", source: "abcde" },
    { titre: "Examen clinique", source: "examen" },
    { titre: "Examens complémentaires", source: "examens_complementaires" },
    { titre: "Prise en charge au déchocage", source: "gestes" },
    { titre: "Réévaluation", source: "reevaluation" },
    { titre: "Synthèse", source: "synthese" },
    { titre: "Conduite à tenir et orientation", source: "orientation" },
  ],

  // Début des lignes horodatées
  quand_meme_jour: "À {heure}",
  quand_autre_jour: "Le {date} à {heure}",

  // Une ligne par geste, dans l'ordre chronologique
  gestes: { ligne: "{quand}, {texte}." },

  // Une ligne par réévaluation
  reevaluation: {
    ligne: "Réévaluation {quand}[ ({delai} après l'admission)][ : {constantes}].[ Évolution : {evolution}.][ {commentaire}]",
  },

  // Brouillon automatique du résumé de synthèse (modifiable dans l'app)
  resume:
    "{Sujet} de {age_texte}[, {atcd}], admis{es} pour {motifs}[, présentant à l'admission : {anomalies}][. Prise en charge au déchocage : {gestes}].",
  resume_atcd: {
    aucun: "sans antécédent médical notable",
    liste: "aux antécédents de {liste}",
  },
};
