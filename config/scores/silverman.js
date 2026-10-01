// Score de Silverman — détresse respiratoire du nouveau-né (0 = normal, ≥ 5 = sévère).
const item = (id, label, o0, o1, o2) => ({
  id,
  label,
  options: [
    { v: "0", label: `0 — ${o0}`, points: 0 },
    { v: "1", label: `1 — ${o1}`, points: 1 },
    { v: "2", label: `2 — ${o2}`, points: 2 },
  ],
});
export default {
  type: "score",
  id: "silverman",
  label: "Score de Silverman",
  max: 10,
  anormal_si: "total >= 1",
  phrase: "score de Silverman à {total}/10[ ({classe})]{incomplet}",
  classes: [
    { min: 0, max: 0, texte: "pas de détresse respiratoire" },
    { min: 1, max: 4, texte: "détresse respiratoire modérée" },
    { min: 5, max: 10, texte: "détresse respiratoire sévère" },
  ],
  items: [
    item("silv_balancement", "Balancement thoraco-abdominal", "Respiration synchrone", "Thorax immobile", "Respiration paradoxale"),
    item("silv_tirage", "Tirage intercostal", "Absent", "Modéré", "Intense"),
    item("silv_entonnoir", "Entonnoir xiphoïdien", "Absent", "Modéré", "Intense"),
    item("silv_ban", "Battement des ailes du nez", "Absent", "Modéré", "Intense"),
    item("silv_geignement", "Geignement expiratoire", "Absent", "Audible au stéthoscope", "Audible à l'oreille"),
  ],
};
