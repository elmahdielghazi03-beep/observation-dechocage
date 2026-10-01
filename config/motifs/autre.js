// MODULE — AUTRE MOTIF (texte libre) : tronc commun complet, sans questions spécifiques.
export default {
  id: "autre",
  titre: "Autre motif",
  icone: "✏️",
  texte_motif: "{motif_autre}",
  groupes: [
    {
      section: "motifs",
      id: "autre_g",
      titre: "Autre motif",
      champs: [{ id: "motif_autre", type: "texte", label: "Motif (texte libre)", cle: true, sortie: false, placeholder: "ex. morsure de chien" }],
    },
  ],
  hypotheses: [],
  checklist: [{ si: "vide('motif_autre')", message: "Motif « autre » : préciser le motif", aller: "motif_autre" }],
};
