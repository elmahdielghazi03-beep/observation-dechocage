// NORMES DES CONSTANTES ET SEUILS — fichier modifiable.
// Une valeur hors de ces bornes s'affiche en rouge et est précédée de ⚠ dans le texte.
// Les expressions entre guillemets utilisent le mini-langage des conditions (voir docs/AJOUTER_UN_MOTIF.md).

export default {
  age_pediatrique: 15, // en années : en dessous, formulaire pédiatrique
  age_procreer: [12, 50], // femme en âge de procréer (statut de grossesse demandé)

  // Tranches d'âge utilisées pour adapter le formulaire et les accords (« Le nourrisson… »)
  tranches: [
    { id: "nouveau_ne", label: "Nouveau-né", age_max_jours: 28 },
    { id: "nourrisson", label: "Nourrisson", age_max_jours: 365 },
    { id: "enfant", label: "Enfant", age_max_ans: 15 },
    { id: "adulte", label: "Adulte", age_max_ans: 65 },
    { id: "sujet_age", label: "Sujet âgé" },
  ],

  // Bornes normales des constantes par âge (age_max en années, exclu).
  // fc = fréquence cardiaque (bpm), fr = fréquence respiratoire (/min), pam_min = PAM minimale (mmHg)
  // pas_min = seuil d'HYPOTENSION : PAS < pas_min. Chez l'enfant, définition PALS :
  //   nouveau-né à terme (0–28 j) < 60 · 1–12 mois < 70 · 1–10 ans < 70 + 2 × âge (années) · > 10 ans < 90
  constantes: [
    { age_max: 28 / 365.25, fc: [100, 180], fr: [30, 60], pas_min: 60, pam_min: 40 }, // nouveau-né
    { age_max: 1, fc: [100, 160], fr: [30, 50], pas_min: 70, pam_min: 45 }, // 1–12 mois
    { age_max: 3, fc: [90, 150], fr: [24, 40], pas_min: "70 + 2 * ent(age_ans)", pam_min: 50 }, // 1–2 ans
    { age_max: 6, fc: [80, 140], fr: [22, 34], pas_min: "70 + 2 * ent(age_ans)", pam_min: 50 }, // 3–5 ans
    { age_max: 10, fc: [70, 120], fr: [18, 30], pas_min: "70 + 2 * ent(age_ans)", pam_min: 55 }, // 6–9 ans
    { age_max: 12, fc: [70, 120], fr: [18, 30], pas_min: 90, pam_min: 55 }, // 10–11 ans
    { age_max: 15, fc: [60, 100], fr: [12, 20], pas_min: 90, pam_min: 60 }, // 12–14 ans
    { age_max: 999, fc: [60, 100], fr: [12, 20], pas_min: 90, pam_min: 65, pas_max: 139, pad_max: 89 }, // adulte
  ],

  spo2_min: 94, // %
  spo2_min_bpco: 88, // % — cible abaissée si BPCO cochée dans les antécédents
  bpco_si: "coche('atcd_med', 'bpco')",

  temperature: [36, 37.9], // °C (≥ 38 = fièvre)
  glycemie: [0.7, 1.8], // g/L (glycémie capillaire)
  glycemie_min_nouveau_ne: 0.45, // g/L

  // Index de choc (FC / PAS) : « max » = affiché en rouge au-delà ; « eleve » = ouvre le bloc instabilité
  index_choc: [
    { age_min: 0, age_max: 4 }, // non interprété avant 4 ans
    { age_min: 4, age_max: 7, max: 1.22 },
    { age_min: 7, age_max: 13, max: 1.0 },
    { age_min: 13, age_max: 15, max: 0.9 },
    { age_min: 15, age_max: 999, max: 0.9, eleve: 1.0 },
  ],

  // Poids estimé chez l'enfant (formules APLS), proposé quand le poids est vide
  poids_estime: [
    { age_max: 1, formule: "0.5 * ent(age_mois) + 4" },
    { age_max: 6, formule: "2 * ent(age_ans) + 8" },
    { age_max: 13, formule: "3 * ent(age_ans) + 7" },
  ],

  // Aide affichée sous la PA (dossier, pré-hospitalier, réévaluations)
  texte_norme_pa: "[Hypotension si PAS < {pas_min} mmHg][ {def_hypotension}][ · normale ≤ {pas_max}/{pad_max}][ · PAM ≥ {pam_min} mmHg]",

  // Listes construites selon les données, utilisables dans les phrases : {signes_hypoperfusion}
  listes: {
    // Signes de mauvaise perfusion : chez l'enfant, ils définissent le choc compensé (avec ou sans tachycardie)
    signes_hypoperfusion: [
      { si: "dans(trc, '3_5', 'sup5')", texte: "TRC > 3 s" },
      { si: "marbrures >= 1", texte: "marbrures" },
      { si: "extremites == 'froides'", texte: "extrémités froides" },
    ],
    // Mentionnée seulement en accompagnement des signes de mauvaise perfusion
    tachycardie_associee: [{ si: "fc > fc_max", texte: "tachycardie pour l'âge ({fc} bpm)" }],
    def_hypotension: [{ si: "pediatrique", texte: "(définition PALS)" }],
    mention_pals: [{ si: "pediatrique", texte: "seuil PALS pour l'âge : PAS < {pas_min} mmHg" }],
  },

  // Drapeaux : conditions réutilisées partout (affichage de blocs, suggestions, checklist)
  drapeaux: {
    hypotension: "pas < pas_min",
    // Choc compensé de l'enfant : pas d'hypotension (PA normale ou non mesurée) ET au moins un signe de
    // mauvaise perfusion. La tachycardie isolée ne suffit pas (fièvre, pleurs, douleur) : elle reste
    // seulement signalée en rouge comme constante anormale pour l'âge.
    choc_compense_enfant: "pediatrique && !hypotension && !(pam < pam_min) && signes_hypoperfusion",
    trauma: "motif('polytraumatisme') || motif('traumatisme_cranien') || motif('brulure')",
    lutte_presente: "rempli('lutte') && !coche('lutte', 'aucun')",
    detresse_respiratoire:
      "spo2 < spo2_min || fr > fr_max || fr < fr_min || lutte_presente || dans(cyanose, 'peri', 'gen')",
    instabilite:
      "hypotension || pam < pam_min || marbrures >= 2 || dans(trc, '3_5', 'sup5') || index_choc > ic_eleve || (pediatrique && (marbrures >= 1 || extremites == 'froides'))",
    trouble_conscience: "gcs < 15 || dans(avpu, 'V', 'P', 'U')",
    plaie:
      "coche('lesions', 'plaie') || coche('lesions', 'morsure') || coche('lesions', 'brulure') || dans(pt_mecanisme, 'arme_blanche', 'arme_feu')",
  },
};
