// Score ABC (Assessment of Blood Consumption) — prédiction du recours à la transfusion massive.
// Items calculés à partir des données (décochables).
export default {
  type: "score",
  id: "abc",
  label: "Score ABC (transfusion massive)",
  max: 4,
  anormal_si: "total >= 2",
  phrase: "score ABC à {total}/4[ ({classe})]",
  classes: [
    { min: 0, max: 1, texte: "< 2" },
    { min: 2, max: 4, texte: "≥ 2 : risque de transfusion massive" },
  ],
  items: [
    { id: "abc_penetrant", label: "Traumatisme pénétrant", auto: "dans(pt_mecanisme, 'arme_blanche', 'arme_feu')", requis: ["pt_mecanisme"] },
    { id: "abc_pas", label: "PAS ≤ 90 mmHg", auto: "pas <= 90", requis: ["pas"] },
    { id: "abc_fc", label: "FC ≥ 120 bpm", auto: "fc >= 120", requis: ["fc"] },
    {
      id: "abc_fast",
      label: "eFAST positive (épanchement)",
      auto: "efast_pericarde == 'pos' || efast_morison == 'pos' || efast_splenorenal == 'pos' || efast_douglas == 'pos'",
      requis: ["efast_morison"],
    },
  ],
};
