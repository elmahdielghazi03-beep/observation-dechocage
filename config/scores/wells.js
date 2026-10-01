// Score de Wells — probabilité clinique d'embolie pulmonaire.
export default {
  type: "score",
  id: "wells",
  label: "Score de Wells (EP)",
  anormal_si: "total >= 2",
  phrase: "score de Wells à {total}[ (probabilité clinique {classe})]",
  classes: [
    { min: 0, max: 1.5, texte: "faible" },
    { min: 2, max: 6, texte: "intermédiaire" },
    { min: 6.5, texte: "forte" },
  ],
  items: [
    { id: "wells_tvp", label: "Signes cliniques de TVP", points: 3, auto: "dr_mollets == 'tvp'" },
    { id: "wells_alternatif", label: "Diagnostic alternatif moins probable que l'EP", points: 3 },
    { id: "wells_fc", label: "FC > 100 bpm", points: 1.5, auto: "fc > 100", requis: ["fc"] },
    { id: "wells_immobilisation", label: "Immobilisation ≥ 3 j ou chirurgie < 4 semaines", points: 1.5, auto: "coche('dr_ep_fdr', 'immobilisation') || coche('dr_ep_fdr', 'chirurgie')" },
    { id: "wells_atcd", label: "Antécédent de TVP / EP", points: 1.5, auto: "coche('dr_ep_fdr', 'atcd_tvp')" },
    { id: "wells_hemoptysie", label: "Hémoptysie", points: 1, auto: "coche('dr_signes', 'hemoptysie')" },
    { id: "wells_cancer", label: "Cancer actif", points: 1, auto: "coche('dr_ep_fdr', 'cancer') || coche('atcd_med', 'neoplasie')" },
  ],
};
