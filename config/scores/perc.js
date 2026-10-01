// Règle PERC — un seul critère présent = règle positive (l'EP ne peut pas être écartée cliniquement).
export default {
  type: "score",
  id: "perc",
  label: "Règle PERC",
  max: 8,
  anormal_si: "total >= 1",
  phrase: "règle PERC {classe}[ : {liste}]",
  classes: [
    { min: 0, max: 0, texte: "négative (aucun critère)" },
    { min: 1, texte: "positive" },
  ],
  items: [
    { id: "perc_age", label: "Âge ≥ 50 ans", texte: "âge ≥ 50 ans", auto: "age_ans >= 50", requis: ["age"] },
    { id: "perc_fc", label: "FC ≥ 100 bpm", texte: "FC ≥ 100 bpm", auto: "fc >= 100", requis: ["fc"] },
    { id: "perc_spo2", label: "SpO2 < 95 %", texte: "SpO2 < 95 %", auto: "spo2 < 95", requis: ["spo2"] },
    { id: "perc_hemoptysie", label: "Hémoptysie", auto: "coche('dr_signes', 'hemoptysie')" },
    { id: "perc_oestrogenes", label: "Prise d'œstrogènes", auto: "coche('dr_ep_fdr', 'oestrogenes')" },
    { id: "perc_atcd", label: "Antécédent de TVP / EP", auto: "coche('dr_ep_fdr', 'atcd_tvp')" },
    { id: "perc_chirurgie", label: "Chirurgie ou traumatisme récent (< 4 semaines)", auto: "coche('dr_ep_fdr', 'chirurgie')" },
    { id: "perc_oedeme", label: "Œdème unilatéral de jambe", auto: "dr_mollets == 'tvp'" },
  ],
};
