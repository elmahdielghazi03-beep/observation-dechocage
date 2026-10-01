// Pediatric Trauma Score (PTS) — enfant traumatisé. Score ≤ 8 : traumatisme grave.
export default {
  type: "score",
  id: "pts",
  label: "Pediatric Trauma Score",
  max: 12,
  si: "age_ans < 15",
  anormal_si: "total <= 8",
  phrase: "Pediatric Trauma Score à {total}/12{incomplet}",
  items: [
    {
      id: "pts_poids",
      label: "Poids",
      options: [
        { v: "2", label: "> 20 kg", points: 2, auto: "poids > 20" },
        { v: "1", label: "10–20 kg", points: 1, auto: "poids >= 10 && poids <= 20" },
        { v: "-1", label: "< 10 kg", points: -1, auto: "poids < 10" },
      ],
    },
    {
      id: "pts_va",
      label: "Voies aériennes",
      options: [
        { v: "2", label: "Normales", points: 2 },
        { v: "1", label: "Maintenues (Guedel, masque)", points: 1 },
        { v: "-1", label: "Non maintenables (IOT…)", points: -1 },
      ],
    },
    {
      id: "pts_pas",
      label: "PAS (ou pouls)",
      options: [
        { v: "2", label: "> 90 mmHg (pouls radial)", points: 2, auto: "pas > 90" },
        { v: "1", label: "50–90 mmHg (pouls fémoral)", points: 1, auto: "pas >= 50 && pas <= 90" },
        { v: "-1", label: "< 50 mmHg (pas de pouls)", points: -1, auto: "pas < 50" },
      ],
    },
    {
      id: "pts_conscience",
      label: "Conscience",
      options: [
        { v: "2", label: "Éveillé", points: 2, auto: "gcs == 15" },
        { v: "1", label: "Obnubilé / PC initiale", points: 1 },
        { v: "-1", label: "Coma", points: -1, auto: "gcs <= 8" },
      ],
    },
    {
      id: "pts_plaies",
      label: "Plaies",
      options: [
        { v: "2", label: "Aucune", points: 2 },
        { v: "1", label: "Mineure", points: 1 },
        { v: "-1", label: "Majeure ou pénétrante", points: -1 },
      ],
    },
    {
      id: "pts_fractures",
      label: "Fractures",
      options: [
        { v: "2", label: "Aucune", points: 2 },
        { v: "1", label: "Fermée", points: 1 },
        { v: "-1", label: "Ouverte ou multiples", points: -1 },
      ],
    },
  ],
};
