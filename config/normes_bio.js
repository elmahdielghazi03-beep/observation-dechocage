// VALEURS BIOLOGIQUES DE RÉFÉRENCE (adulte) — fichier modifiable.
// bornes : [minimum, maximum] ; null = pas de borne. Hors bornes → rouge et ⚠.
// Unités habituelles au Maroc : g/L, mg/L ; ionogramme et lactates en mmol/L.

export default {
  // NFS
  hb: { label: "Hb", unite: "g/dL", bornes: [12, 17], decimales: 1 },
  gb: { label: "GB", unite: "/mm³", bornes: [4000, 10000], decimales: 0 },
  plaquettes: { label: "Plaquettes", unite: "/mm³", bornes: [150000, 400000], decimales: 0 },
  // Ionogramme (mmol/L)
  na: { label: "Na⁺", unite: "mmol/L", bornes: [135, 145], decimales: 0 },
  k: { label: "K⁺", unite: "mmol/L", bornes: [3.5, 5], decimales: 1 },
  cl: { label: "Cl⁻", unite: "mmol/L", bornes: [98, 107], decimales: 0 },
  hco3: { label: "HCO₃⁻", unite: "mmol/L", bornes: [22, 28], decimales: 0 },
  // Fonction rénale, glycémie, calcémie
  uree: { label: "Urée", unite: "g/L", bornes: [0.15, 0.45], decimales: 2 },
  creat: { label: "Créatinine", unite: "mg/L", bornes: [6, 12], decimales: 1 },
  glycemie_lab: { label: "Glycémie", unite: "g/L", bornes: [0.7, 1.4], decimales: 2 },
  calcemie: { label: "Calcémie", unite: "mg/L", bornes: [85, 105], decimales: 0 },
  // Inflammation
  crp: { label: "CRP", unite: "mg/L", bornes: [null, 6], decimales: 0 },
  pct: { label: "PCT", unite: "ng/mL", bornes: [null, 0.5], decimales: 2 },
  // Hémostase
  tp: { label: "TP", unite: "%", bornes: [70, null], decimales: 0 },
  inr: { label: "INR", unite: "", bornes: [null, 1.2], decimales: 1 },
  tca: { label: "TCA (ratio)", unite: "", bornes: [null, 1.2], decimales: 2 },
  fibrinogene: { label: "Fibrinogène", unite: "g/L", bornes: [2, 4], decimales: 1 },
  // Bilan hépatique, pancréas, muscle
  asat: { label: "ASAT", unite: "UI/L", bornes: [null, 40], decimales: 0 },
  alat: { label: "ALAT", unite: "UI/L", bornes: [null, 40], decimales: 0 },
  bili: { label: "Bilirubine totale", unite: "mg/L", bornes: [null, 12], decimales: 0 },
  lipase: { label: "Lipase", unite: "UI/L", bornes: [null, 60], decimales: 0 },
  cpk: { label: "CPK", unite: "UI/L", bornes: [null, 200], decimales: 0 },
  // Cardiaque / thrombose
  bnp: { label: "BNP", unite: "pg/mL", bornes: [null, 100], decimales: 0 },
  ddimeres: { label: "D-dimères", unite: "ng/mL", bornes: [null, 500], decimales: 0 },
  // Autres
  lactates: { label: "Lactates", unite: "mmol/L", bornes: [null, 2], decimales: 1 },
  ammoniemie: { label: "Ammoniémie", unite: "µmol/L", bornes: [null, 50], decimales: 0 },
  alcoolemie: { label: "Alcoolémie", unite: "g/L", bornes: [null, 0], decimales: 2 },
  // Gaz du sang
  ph: { label: "pH", unite: "", bornes: [7.35, 7.45], decimales: 2 },
  paco2: { label: "PaCO₂", unite: "mmHg", bornes: [35, 45], decimales: 0 },
  pao2: { label: "PaO₂", unite: "mmHg", bornes: [80, null], decimales: 0 },
  gds_hco3: { label: "HCO₃⁻", unite: "mmol/L", bornes: [22, 26], decimales: 0 },
  be: { label: "BE", unite: "mmol/L", bornes: [-2, 2], decimales: 1 },
  sao2: { label: "SaO₂", unite: "%", bornes: [94, null], decimales: 0 },
  hbco: { label: "HbCO", unite: "%", bornes: [null, 5], decimales: 1 },
  // Troponine : l'unité et le seuil (99e percentile) dépendent du laboratoire → saisis avec le résultat
  troponine_unites: ["ng/L", "ng/mL", "µg/L", "pg/mL"],
};
