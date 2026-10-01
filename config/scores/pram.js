// Score PRAM (Pediatric Respiratory Assessment Measure) — crise d'asthme de l'enfant (2–17 ans).
export default {
  type: "score",
  id: "pram",
  label: "Score PRAM",
  max: 12,
  anormal_si: "total >= 4",
  phrase: "score PRAM à {total}/12[ (crise {classe})]{incomplet}",
  classes: [
    { min: 0, max: 3, texte: "légère" },
    { min: 4, max: 7, texte: "modérée" },
    { min: 8, max: 12, texte: "sévère" },
  ],
  items: [
    {
      id: "pram_sus_sternal",
      label: "Tirage sus-sternal",
      options: [
        { v: "0", label: "0 — Absent", points: 0, auto: "rempli('lutte') && !coche('lutte', 'tirage_ss')" },
        { v: "2", label: "2 — Présent", points: 2, auto: "coche('lutte', 'tirage_ss')" },
      ],
    },
    {
      id: "pram_scalenes",
      label: "Contraction des scalènes",
      options: [
        { v: "0", label: "0 — Absente", points: 0 },
        { v: "2", label: "2 — Présente", points: 2 },
      ],
    },
    {
      id: "pram_air",
      label: "Entrée d'air",
      options: [
        { v: "0", label: "0 — Normale", points: 0 },
        { v: "1", label: "1 — Diminuée aux bases", points: 1 },
        { v: "2", label: "2 — Diminuée diffusément", points: 2 },
        { v: "3", label: "3 — Absente / minimale", points: 3 },
      ],
    },
    {
      id: "pram_sibilants",
      label: "Sibilants",
      options: [
        { v: "0", label: "0 — Absents", points: 0 },
        { v: "1", label: "1 — Expiratoires seulement", points: 1 },
        { v: "2", label: "2 — Inspiratoires (± expiratoires)", points: 2 },
        { v: "3", label: "3 — Audibles sans stéthoscope / silence", points: 3 },
      ],
    },
    {
      id: "pram_spo2",
      label: "SpO2",
      options: [
        { v: "0", label: "0 — ≥ 95 %", points: 0, auto: "spo2 >= 95" },
        { v: "1", label: "1 — 92–94 %", points: 1, auto: "spo2 >= 92 && spo2 <= 94" },
        { v: "2", label: "2 — < 92 %", points: 2, auto: "spo2 < 92" },
      ],
    },
  ],
};
