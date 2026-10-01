// Score CURB-65 — gravité d'une pneumopathie de l'adulte. Calculé à partir des données.
export default {
  type: "score",
  id: "curb65",
  label: "CURB-65",
  max: 5,
  anormal_si: "total >= 2",
  phrase: "score CURB-65 à {total}/5[ ({classe})]{incomplet}",
  classes: [
    { min: 0, max: 1, texte: "risque faible" },
    { min: 2, max: 2, texte: "risque intermédiaire" },
    { min: 3, max: 5, texte: "risque élevé" },
  ],
  items: [
    { id: "curb_confusion", label: "Confusion", auto: "gcs < 15 || coche('comportement', 'confusion')", requis: ["gcs"] },
    { id: "curb_uree", label: "Urée > 0,42 g/L (7 mmol/L)", auto: "uree > 0.42", requis: ["uree"] },
    { id: "curb_fr", label: "FR ≥ 30/min", auto: "fr >= 30", requis: ["fr"] },
    { id: "curb_pa", label: "PAS < 90 ou PAD ≤ 60 mmHg", auto: "pas < 90 || pad <= 60", requis: ["pas"] },
    { id: "curb_age", label: "Âge ≥ 65 ans", auto: "age_ans >= 65", requis: ["age"] },
  ],
};
