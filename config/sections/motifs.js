// SECTION 2 — Motif(s) d'admission
// La liste des motifs vient de config/motifs/index.js : chaque motif coché ouvre son module.
export default {
  id: "motifs",
  titre: "Motif(s) d'admission",
  icone: "🎯",
  groupes: [
    {
      id: "motifs_g",
      titre: null,
      phrase: "[Admis{e} pour {motifs}][ ({motif_precision})].",
      champs: [
        { id: "motifs", type: "multi", label: "Motif(s) — sélection multiple", cle: true, options_de: "motifs", grand: true },
        { id: "motif_precision", type: "texte", label: "Précision (optionnel)", placeholder: "ex. AVP moto contre voiture" },
      ],
    },
  ],
};
