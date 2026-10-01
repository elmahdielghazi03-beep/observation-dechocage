// SECTION 9 — Réévaluation (bouton « Réévaluer », plusieurs réévaluations possibles)
// « champs » : formulaire de chaque réévaluation ; la phrase est définie dans config/modele_observation.js.
export default {
  id: "reevaluation",
  titre: "Réévaluation",
  icone: "🔁",
  special: "reevaluation",
  groupes: [],
  champs: [
    { id: "heure", type: "heure", label: "Heure de la réévaluation" },
    { id: "fc", type: "nombre", label: "FC", unite: "bpm", decimales: 0, bornes: ["fc_min", "fc_max"], phrase: "FC {valeur} bpm" },
    {
      id: "pa",
      type: "pa",
      label: "PA",
      id_pas: "pas",
      id_pad: "pad",
      bornes_pas: ["pas_min", "pas_max"],
      bornes_pad: [null, "pad_max"],
      phrase: "PA {valeur} mmHg[ (PAM {pam} mmHg)]",
    },
    { id: "fr", type: "nombre", label: "FR", unite: "/min", decimales: 0, bornes: ["fr_min", "fr_max"], phrase: "FR {valeur}/min" },
    { id: "spo2", type: "nombre", label: "SpO2", unite: "%", decimales: 0, bornes: ["spo2_min", null], phrase: "SpO2 {valeur} %[ {spo2_support}]" },
    {
      id: "spo2_support",
      type: "choix",
      label: "SpO2 mesurée",
      sortie: false,
      options: [
        { v: "aa", label: "Air ambiant", texte: "en air ambiant" },
        { v: "o2", label: "Sous O2", texte: "sous oxygène[ à {o2_debit} L/min]" },
        { v: "vni", label: "VNI", texte: "sous VNI" },
        { v: "vm", label: "Ventilation mécanique", texte: "sous ventilation mécanique" },
      ],
    },
    { id: "o2_debit", type: "nombre", label: "Débit O2", unite: "L/min", decimales: 1, si: "spo2_support == 'o2'", sortie: false },
    { id: "gcs", type: "nombre", label: "GCS", decimales: 0, min: 3, max: 15, bornes: [15, null], phrase: "GCS {valeur}/15", raccourcis: [15, 14, 13, 8] },
    { id: "temp", type: "nombre", label: "Température", unite: "°C", decimales: 1, bornes: ["temp_min", "temp_max"], phrase: "T° {valeur} °C" },
    { id: "glycemie", type: "nombre", label: "Glycémie capillaire", unite: "g/L", decimales: 2, bornes: ["gly_min", "gly_max"], phrase: "glycémie capillaire {valeur} g/L" },
    { id: "diurese", type: "nombre", label: "Diurèse", unite: "mL/h", decimales: 0, phrase: "diurèse {valeur} mL/h" },
    { id: "eva", type: "curseur", label: "Douleur (0–10)", max: 10, bornes: [null, 3], phrase: "douleur {valeur}/10" },
    {
      id: "evolution",
      type: "choix",
      label: "Évolution",
      options: [
        { v: "amelioration", label: "Amélioration", texte: "favorable" },
        { v: "stabilisation", label: "Stabilisation", texte: "stabilisation" },
        { v: "aggravation", label: "Aggravation", texte: "aggravation", anormal: true },
      ],
    },
    { id: "commentaire", type: "texte_long", label: "Commentaire" },
  ],
};
