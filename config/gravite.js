// CRITÈRES DE GRAVITÉ GÉNÉRAUX (tous les patients) — affichés dans la Synthèse.
// « auto » : l'item est pré-coché quand la condition est vraie d'après les données saisies.
// Tu peux toujours le décocher. Les critères de Vittel (traumatisé) sont dans le module polytraumatisme.

export default {
  type: "criteres",
  id: "gravite",
  label: "Critères de gravité",
  aide: "Pré-cochés d'après les données saisies — décoche si non pertinent.",
  phrase: "Critères de gravité : {liste}",
  marquer: true,
  items: [
    {
      id: "grav_resp",
      label: "Détresse respiratoire",
      auto: "spo2 < 90 || lutte_presente || dans(cyanose, 'peri', 'gen') || dans(parole, 'mots', 'impossible') || (age_ans >= 15 && (fr >= 30 || fr < 10))",
      detail: ["SpO2 {spo2} %", "FR {fr}/min"],
    },
    {
      id: "grav_circ",
      label: "Défaillance circulatoire",
      auto: "hypotension || pam < pam_min || marbrures >= 2 || trc == 'sup5'",
      detail: ["PA {pas}/{pad} mmHg", "PAM {pam} mmHg", "index de choc {index_choc}"],
    },
    {
      id: "grav_choc_compense",
      label: "Signes de choc compensé (enfant, sans hypotension)",
      texte: "signes de choc compensé",
      auto: "choc_compense_enfant",
      detail: ["{signes_hypoperfusion}", "{tachycardie_associee}", "PA {pas}/{pad} mmHg, normale pour l'âge"],
    },
    { id: "grav_coma", label: "Coma (GCS ≤ 8)", texte: "coma", auto: "gcs <= 8", detail: ["GCS {gcs_court}"] },
    {
      id: "grav_conscience",
      label: "Troubles de la conscience",
      auto: "(gcs > 8 && gcs < 15) || dans(avpu, 'V', 'P')",
      detail: ["GCS {gcs_court}"],
    },
    { id: "grav_pupilles", label: "Anisocorie / pupille aréactive", auto: "pupilles_anormal" },
    { id: "grav_convulsions", label: "Convulsions en cours", texte: "crise convulsive en cours", auto: "convulsions == 'en_cours'" },
    { id: "grav_hypogly", label: "Hypoglycémie", auto: "glycemie < gly_min", detail: ["{glycemie} g/L"] },
    { id: "grav_hemorragie", label: "Hémorragie active", auto: "saignement_etat == 'actif'" },
    {
      id: "grav_purpura",
      label: "Purpura fébrile / extensif / nécrotique",
      texte: "purpura[ {purpura_carac}]",
      auto: "coche('purpura_carac', 'febrile') || coche('purpura_carac', 'extensif') || coche('purpura_carac', 'necrotique')",
    },
    {
      id: "grav_temp",
      label: "Hypothermie < 35 °C ou hyperthermie ≥ 40 °C",
      texte: "dysthermie sévère",
      auto: "temp < 35 || temp >= 40",
      detail: ["{temp} °C"],
    },
    { id: "grav_lactates", label: "Hyperlactatémie > 2 mmol/L", texte: "hyperlactatémie", auto: "lactates > 2 || gds_lactates > 2", detail: ["{lactates} mmol/L", "{gds_lactates} mmol/L"] },
    { id: "grav_ph", label: "Acidose (pH < 7,20)", texte: "acidose", auto: "gds_ph < 7.2", detail: ["pH {gds_ph}"] },
    { id: "grav_k", label: "Dyskaliémie sévère (K⁺ < 2,5 ou > 6 mmol/L)", texte: "dyskaliémie sévère", auto: "k < 2.5 || k > 6", detail: ["K⁺ {k} mmol/L"] },
    { id: "grav_terrain", label: "Terrain fragile (âge, comorbidités lourdes, grossesse)", texte: "terrain fragile" },
  ],
};
