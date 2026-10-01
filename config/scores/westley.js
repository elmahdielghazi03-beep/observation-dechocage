// Score de Westley — sévérité de la laryngite / du croup chez l'enfant.
export default {
  type: "score",
  id: "westley",
  label: "Score de Westley",
  max: 17,
  anormal_si: "total >= 3",
  phrase: "score de Westley à {total}/17[ ({classe})]{incomplet}",
  classes: [
    { min: 0, max: 2, texte: "léger" },
    { min: 3, max: 5, texte: "modéré" },
    { min: 6, max: 11, texte: "sévère" },
    { min: 12, max: 17, texte: "insuffisance respiratoire imminente" },
  ],
  items: [
    {
      id: "west_stridor",
      label: "Stridor",
      options: [
        { v: "0", label: "0 — Absent", points: 0 },
        { v: "1", label: "1 — À l'agitation", points: 1 },
        { v: "2", label: "2 — Au repos", points: 2 },
      ],
    },
    {
      id: "west_tirage",
      label: "Tirage",
      options: [
        { v: "0", label: "0 — Absent", points: 0 },
        { v: "1", label: "1 — Léger", points: 1 },
        { v: "2", label: "2 — Modéré", points: 2 },
        { v: "3", label: "3 — Sévère", points: 3 },
      ],
    },
    {
      id: "west_air",
      label: "Entrée d'air",
      options: [
        { v: "0", label: "0 — Normale", points: 0 },
        { v: "1", label: "1 — Diminuée", points: 1 },
        { v: "2", label: "2 — Très diminuée", points: 2 },
      ],
    },
    {
      id: "west_cyanose",
      label: "Cyanose",
      options: [
        { v: "0", label: "0 — Absente", points: 0 },
        { v: "4", label: "4 — À l'agitation", points: 4 },
        { v: "5", label: "5 — Au repos", points: 5 },
      ],
    },
    {
      id: "west_conscience",
      label: "Conscience",
      options: [
        { v: "0", label: "0 — Normale", points: 0 },
        { v: "5", label: "5 — Altérée", points: 5 },
      ],
    },
  ],
};
