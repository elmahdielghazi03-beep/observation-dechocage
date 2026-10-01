// SECTION 10 — Synthèse
// Les modules peuvent ajouter leurs critères (ex. Vittel) après le groupe « syn_gravite ».
import gravite from "../gravite.js";

export default {
  id: "synthese",
  titre: "Synthèse",
  icone: "🧾",
  groupes: [
    {
      id: "syn_resume_g",
      titre: "Résumé",
      champs: [
        {
          id: "syn_resume",
          type: "resume",
          label: "Résumé",
          aide: "Brouillon assemblé à partir de tes saisies. Touche « Modifier » pour le retoucher.",
          phrase: "{valeur}",
        },
      ],
    },
    {
      id: "syn_gravite",
      titre: "Critères de gravité",
      champs: [gravite],
    },
    {
      id: "syn_hypotheses",
      titre: "Hypothèses diagnostiques",
      fin: true,
      champs: [
        {
          id: "hypotheses",
          type: "multi",
          label: "Hypothèses évoquées",
          aide: "Rien n'est pré-coché : c'est toi qui poses les hypothèses.",
          options_de: "hypotheses",
          autre: true,
          liaison: ";",
          phrase: "hypothèses diagnostiques évoquées : {valeur}",
        },
      ],
    },
  ],
};
