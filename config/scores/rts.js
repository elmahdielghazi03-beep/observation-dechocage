// Triage Revised Trauma Score (T-RTS) — calculé à partir du GCS, de la PAS et de la FR.
export default {
  type: "score",
  id: "trts",
  label: "T-RTS (Triage Revised Trauma Score)",
  max: 12,
  anormal_si: "total < 11",
  phrase: "T-RTS à {total}/12{incomplet}",
  items: [
    {
      id: "rts_gcs",
      label: "GCS",
      options: [
        { v: "4", label: "13–15", points: 4, auto: "gcs >= 13" },
        { v: "3", label: "9–12", points: 3, auto: "gcs >= 9 && gcs <= 12" },
        { v: "2", label: "6–8", points: 2, auto: "gcs >= 6 && gcs <= 8" },
        { v: "1", label: "4–5", points: 1, auto: "gcs >= 4 && gcs <= 5" },
        { v: "0", label: "3", points: 0, auto: "gcs == 3" },
      ],
    },
    {
      id: "rts_pas",
      label: "PAS (mmHg)",
      options: [
        { v: "4", label: "> 89", points: 4, auto: "pas > 89" },
        { v: "3", label: "76–89", points: 3, auto: "pas >= 76 && pas <= 89" },
        { v: "2", label: "50–75", points: 2, auto: "pas >= 50 && pas <= 75" },
        { v: "1", label: "1–49", points: 1, auto: "pas >= 1 && pas <= 49" },
        { v: "0", label: "0", points: 0, auto: "pas == 0" },
      ],
    },
    {
      id: "rts_fr",
      label: "FR (/min)",
      options: [
        { v: "4", label: "10–29", points: 4, auto: "fr >= 10 && fr <= 29" },
        { v: "3", label: "> 29", points: 3, auto: "fr > 29" },
        { v: "2", label: "6–9", points: 2, auto: "fr >= 6 && fr <= 9" },
        { v: "1", label: "1–5", points: 1, auto: "fr >= 1 && fr <= 5" },
        { v: "0", label: "0", points: 0, auto: "fr == 0" },
      ],
    },
  ],
};
