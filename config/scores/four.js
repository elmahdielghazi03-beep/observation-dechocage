// Score FOUR (Full Outline of UnResponsiveness) — utile chez le patient intubé. Total /16.
const item = (id, label, libelles) => ({
  id,
  label,
  options: libelles.map((l, i) => ({ v: String(4 - i), label: `${4 - i} — ${l}`, points: 4 - i })),
});
export default {
  type: "score",
  id: "four",
  label: "Score FOUR",
  max: 16,
  anormal_si: "total < 16",
  phrase: "score FOUR à {total}/16{incomplet}",
  items: [
    item("four_e", "Yeux (E)", [
      "Ouverts, poursuite ou clignement sur ordre",
      "Ouverts, sans poursuite",
      "Fermés, ouverture à la voix forte",
      "Fermés, ouverture à la douleur",
      "Fermés malgré la douleur",
    ]),
    item("four_m", "Motricité (M)", [
      "Pouce levé, poing ou « V » sur ordre",
      "Localise la douleur",
      "Flexion à la douleur",
      "Extension à la douleur",
      "Aucune réponse ou état de mal myoclonique",
    ]),
    item("four_b", "Tronc cérébral (B)", [
      "Réflexes photomoteurs et cornéens présents",
      "Une pupille dilatée et fixe",
      "Photomoteur ou cornéen absent",
      "Photomoteur et cornéen absents",
      "Photomoteur, cornéen et toux absents",
    ]),
    item("four_r", "Respiration (R)", [
      "Non intubé, respiration régulière",
      "Non intubé, Cheyne-Stokes",
      "Non intubé, respiration irrégulière",
      "Déclenche au-dessus du respirateur",
      "Fréquence du respirateur ou apnée",
    ]),
  ],
};
