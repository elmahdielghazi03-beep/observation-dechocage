// MÉDICAMENTS proposés dans « + Geste → Médicament » — fichier modifiable.
// L'app ne propose AUCUNE dose : tu saisis la dose, l'unité et la voie.
// nom      : texte écrit dans l'observation
// unite    : unité présélectionnée ; voie : voie présélectionnée (modifiables à la saisie)
// majeur   : cité dans le brouillon de synthèse
// delai_depuis : affiche le délai depuis un événement (ex. acide tranexamique / accident)

export const classes = [
  { id: "catecho", label: "Catécholamines / vasoactifs" },
  { id: "sedation", label: "Sédation / analgésie / curares" },
  { id: "antiepileptique", label: "Antiépileptiques" },
  { id: "respiratoire", label: "Respiratoire" },
  { id: "corticoide", label: "Corticoïdes" },
  { id: "antibiotique", label: "Antibiotiques / antiviraux" },
  { id: "hemostase", label: "Hémostase / anticoagulation" },
  { id: "metabolique", label: "Métabolique / électrolytes" },
  { id: "antidote", label: "Antidotes" },
  { id: "cardio", label: "Cardiovasculaire" },
  { id: "digestif", label: "Digestif / antiémétiques" },
  { id: "autre", label: "Autres" },
];

export default [
  // Catécholamines / vasoactifs
  { id: "noradrenaline", nom: "noradrénaline", classe: "catecho", unite: "mg/h", voie: "IVSE", majeur: true },
  { id: "adrenaline", nom: "adrénaline", classe: "catecho", unite: "mg", voie: "IVD", majeur: true },
  { id: "dobutamine", nom: "dobutamine", classe: "catecho", unite: "µg/kg/min", voie: "IVSE", majeur: true },
  { id: "ephedrine", nom: "éphédrine", classe: "catecho", unite: "mg", voie: "IVD" },
  { id: "atropine", nom: "atropine", classe: "catecho", unite: "mg", voie: "IVD" },

  // Sédation / analgésie / curares
  { id: "etomidate", nom: "étomidate", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "ketamine", nom: "kétamine", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "propofol", nom: "propofol", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "midazolam", nom: "midazolam", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "fentanyl", nom: "fentanyl", classe: "sedation", unite: "µg", voie: "IVD" },
  { id: "sufentanil", nom: "sufentanil", classe: "sedation", unite: "µg", voie: "IVD" },
  { id: "morphine", nom: "morphine", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "paracetamol", nom: "paracétamol", classe: "sedation", unite: "g", voie: "IVL" },
  { id: "nefopam", nom: "néfopam", classe: "sedation", unite: "mg", voie: "IVL" },
  { id: "tramadol", nom: "tramadol", classe: "sedation", unite: "mg", voie: "IVL" },
  { id: "ketoprofene", nom: "kétoprofène", classe: "sedation", unite: "mg", voie: "IVL" },
  { id: "succinylcholine", nom: "succinylcholine", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "rocuronium", nom: "rocuronium", classe: "sedation", unite: "mg", voie: "IVD" },
  { id: "cisatracurium", nom: "cisatracurium", classe: "sedation", unite: "mg", voie: "IVD" },

  // Antiépileptiques
  { id: "diazepam", nom: "diazépam", classe: "antiepileptique", unite: "mg", voie: "IVD" },
  { id: "clonazepam", nom: "clonazépam", classe: "antiepileptique", unite: "mg", voie: "IVD" },
  { id: "phenobarbital", nom: "phénobarbital", classe: "antiepileptique", unite: "mg", voie: "IVL" },
  { id: "valproate", nom: "valproate de sodium", classe: "antiepileptique", unite: "mg", voie: "IVL" },
  { id: "levetiracetam", nom: "lévétiracétam", classe: "antiepileptique", unite: "mg", voie: "IVL" },
  { id: "phenytoine", nom: "phénytoïne", classe: "antiepileptique", unite: "mg", voie: "IVL" },

  // Respiratoire
  { id: "salbutamol", nom: "salbutamol", classe: "respiratoire", unite: "mg", voie: "nebulisation" },
  { id: "ipratropium", nom: "bromure d'ipratropium", classe: "respiratoire", unite: "mg", voie: "nebulisation" },
  { id: "terbutaline", nom: "terbutaline", classe: "respiratoire", unite: "mg", voie: "nebulisation" },
  { id: "sulfate_magnesium", nom: "sulfate de magnésium", classe: "respiratoire", unite: "g", voie: "IVL" },
  { id: "budesonide", nom: "budésonide", classe: "respiratoire", unite: "mg", voie: "nebulisation" },

  // Corticoïdes
  { id: "methylprednisolone", nom: "méthylprednisolone", classe: "corticoide", unite: "mg", voie: "IVD" },
  { id: "hydrocortisone", nom: "hémisuccinate d'hydrocortisone", classe: "corticoide", unite: "mg", voie: "IVD" },
  { id: "dexamethasone", nom: "dexaméthasone", classe: "corticoide", unite: "mg", voie: "IVD" },
  { id: "prednisolone", nom: "prednisolone", classe: "corticoide", unite: "mg", voie: "PO" },
  { id: "betamethasone", nom: "bétaméthasone", classe: "corticoide", unite: "mg", voie: "IM" },

  // Antibiotiques / antiviraux
  { id: "ceftriaxone", nom: "ceftriaxone", classe: "antibiotique", unite: "g", voie: "IVL", majeur: true },
  { id: "cefotaxime", nom: "céfotaxime", classe: "antibiotique", unite: "g", voie: "IVL", majeur: true },
  { id: "amoxicilline", nom: "amoxicilline", classe: "antibiotique", unite: "g", voie: "IVL" },
  { id: "amox_clav", nom: "amoxicilline-acide clavulanique", classe: "antibiotique", unite: "g", voie: "IVL" },
  { id: "gentamicine", nom: "gentamicine", classe: "antibiotique", unite: "mg", voie: "IVL" },
  { id: "amikacine", nom: "amikacine", classe: "antibiotique", unite: "mg", voie: "IVL" },
  { id: "vancomycine", nom: "vancomycine", classe: "antibiotique", unite: "mg", voie: "IVL" },
  { id: "metronidazole", nom: "métronidazole", classe: "antibiotique", unite: "mg", voie: "IVL" },
  { id: "pip_tazo", nom: "pipéracilline-tazobactam", classe: "antibiotique", unite: "g", voie: "IVL" },
  { id: "imipeneme", nom: "imipénème", classe: "antibiotique", unite: "g", voie: "IVL" },
  { id: "ciprofloxacine", nom: "ciprofloxacine", classe: "antibiotique", unite: "mg", voie: "IVL" },
  { id: "aciclovir", nom: "aciclovir", classe: "antibiotique", unite: "mg", voie: "IVL" },

  // Hémostase / anticoagulation
  {
    id: "acide_tranexamique",
    nom: "acide tranexamique",
    classe: "hemostase",
    unite: "g",
    voie: "IVL",
    majeur: true,
    delai_depuis: { champ: "pt_heure", texte: "{delai} après l'accident" },
  },
  { id: "vitamine_k", nom: "vitamine K", classe: "hemostase", unite: "mg", voie: "IVL" },
  { id: "fibrinogene", nom: "fibrinogène", classe: "hemostase", unite: "g", voie: "IVL", majeur: true },
  { id: "ppsb", nom: "complexe prothrombinique (PPSB)", classe: "hemostase", unite: "UI", voie: "IVL" },
  { id: "protamine", nom: "protamine", classe: "hemostase", unite: "mg", voie: "IVL" },
  { id: "heparine", nom: "héparine non fractionnée", classe: "hemostase", unite: "UI", voie: "IVD" },
  { id: "enoxaparine", nom: "énoxaparine", classe: "hemostase", unite: "UI", voie: "SC" },
  { id: "aspirine", nom: "aspirine", classe: "hemostase", unite: "mg", voie: "IVD" },
  { id: "clopidogrel", nom: "clopidogrel", classe: "hemostase", unite: "mg", voie: "PO" },

  // Métabolique / électrolytes
  { id: "g30", nom: "sérum glucosé 30 %", classe: "metabolique", unite: "mL", voie: "IVD" },
  { id: "g10", nom: "sérum glucosé 10 %", classe: "metabolique", unite: "mL", voie: "IVL" },
  { id: "glucagon", nom: "glucagon", classe: "metabolique", unite: "mg", voie: "IM" },
  { id: "insuline", nom: "insuline rapide", classe: "metabolique", unite: "UI/h", voie: "IVSE" },
  { id: "kcl", nom: "chlorure de potassium", classe: "metabolique", unite: "g", voie: "IVSE" },
  { id: "gluconate_ca", nom: "gluconate de calcium 10 %", classe: "metabolique", unite: "g", voie: "IVL" },
  { id: "chlorure_ca", nom: "chlorure de calcium", classe: "metabolique", unite: "g", voie: "IVL" },
  { id: "bicarbonate", nom: "bicarbonate de sodium 8,4 %", classe: "metabolique", unite: "mL", voie: "IVL" },
  { id: "thiamine", nom: "thiamine (vitamine B1)", classe: "metabolique", unite: "mg", voie: "IVL" },
  { id: "ssh", nom: "sérum salé hypertonique", classe: "metabolique", unite: "mL", voie: "IVL" },
  { id: "mannitol", nom: "mannitol 20 %", classe: "metabolique", unite: "mL", voie: "IVL" },

  // Antidotes
  { id: "naloxone", nom: "naloxone", classe: "antidote", unite: "mg", voie: "IVD" },
  { id: "flumazenil", nom: "flumazénil", classe: "antidote", unite: "mg", voie: "IVD" },
  { id: "nac", nom: "N-acétylcystéine", classe: "antidote", unite: "g", voie: "IVL" },
  { id: "pralidoxime", nom: "pralidoxime", classe: "antidote", unite: "g", voie: "IVL" },
  { id: "hydroxocobalamine", nom: "hydroxocobalamine", classe: "antidote", unite: "g", voie: "IVL" },
  { id: "charbon", nom: "charbon activé", classe: "antidote", unite: "g", voie: "PO" },

  // Cardiovasculaire
  { id: "amiodarone", nom: "amiodarone", classe: "cardio", unite: "mg", voie: "IVL" },
  { id: "adenosine", nom: "adénosine", classe: "cardio", unite: "mg", voie: "IVD" },
  { id: "furosemide", nom: "furosémide", classe: "cardio", unite: "mg", voie: "IVD" },
  { id: "trinitrine", nom: "trinitrine", classe: "cardio", unite: "mg/h", voie: "IVSE" },
  { id: "isosorbide", nom: "dinitrate d'isosorbide", classe: "cardio", unite: "mg/h", voie: "IVSE" },
  { id: "nicardipine", nom: "nicardipine", classe: "cardio", unite: "mg/h", voie: "IVSE" },
  { id: "urapidil", nom: "urapidil", classe: "cardio", unite: "mg", voie: "IVD" },
  { id: "labetalol", nom: "labétalol", classe: "cardio", unite: "mg", voie: "IVD" },
  { id: "digoxine", nom: "digoxine", classe: "cardio", unite: "mg", voie: "IVL" },

  // Digestif / antiémétiques
  { id: "omeprazole", nom: "oméprazole", classe: "digestif", unite: "mg", voie: "IVL" },
  { id: "esomeprazole", nom: "ésoméprazole", classe: "digestif", unite: "mg", voie: "IVL" },
  { id: "metoclopramide", nom: "métoclopramide", classe: "digestif", unite: "mg", voie: "IVL" },
  { id: "ondansetron", nom: "ondansétron", classe: "digestif", unite: "mg", voie: "IVL" },
  { id: "octreotide", nom: "octréotide", classe: "digestif", unite: "µg", voie: "IVD" },
  { id: "terlipressine", nom: "terlipressine", classe: "digestif", unite: "mg", voie: "IVD" },

  // Autres
  { id: "vat", nom: "vaccin antitétanique", classe: "autre", unite: "dose", voie: "IM" },
  { id: "igat", nom: "immunoglobulines antitétaniques", classe: "autre", unite: "UI", voie: "IM" },
  { id: "dexchlorpheniramine", nom: "dexchlorphéniramine", classe: "autre", unite: "mg", voie: "IVD" },
];
