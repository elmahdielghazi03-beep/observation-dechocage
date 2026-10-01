// GESTES ET TRAITEMENTS (bouton « + Geste ») — fichier modifiable.
// Chaque geste est horodaté. texte = phrase écrite dans l'observation ; details = précisions
// ajoutées entre parenthèses ; majeur = cité dans le brouillon de synthèse.
// {par_kg} calcule l'équivalent par kg à partir du poids (calcul, jamais une recommandation).

import medicaments, { classes } from "./medicaments.js";

const majuscule1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export const UNITES = ["mg", "g", "µg", "UI", "mL", "mmol", "dose", "mg/h", "µg/min", "µg/kg/min", "mg/kg/h", "UI/h", "UI/kg/h", "mL/h", "g/h"].map(
  (u) => ({ v: u, label: u, texte: u }),
);

export const VOIES = [
  { v: "IVD", label: "IVD", texte: "en IVD" },
  { v: "IVL", label: "IVL", texte: "en IVL" },
  { v: "IVSE", label: "IVSE", texte: "en IVSE" },
  { v: "IM", label: "IM", texte: "en IM" },
  { v: "SC", label: "SC", texte: "en SC" },
  { v: "IR", label: "Intrarectale", texte: "par voie intrarectale" },
  { v: "PO", label: "Per os", texte: "per os" },
  { v: "nebulisation", label: "Nébulisation", texte: "en nébulisation" },
  { v: "intranasale", label: "Intranasale", texte: "par voie intranasale" },
  { v: "IO", label: "Intra-osseuse", texte: "par voie intra-osseuse" },
  { v: "sublinguale", label: "Sublinguale", texte: "par voie sublinguale" },
  { v: "SNG", label: "Par SNG", texte: "par la sonde nasogastrique" },
];

const COTE = {
  id: "cote",
  type: "choix",
  label: "Côté",
  options: [
    { v: "d", label: "Droite", texte: "à droite" },
    { v: "g", label: "Gauche", texte: "à gauche" },
  ],
};

const MEMBRES = [
  { v: "msd", label: "MSD", texte: "au membre supérieur droit" },
  { v: "msg", label: "MSG", texte: "au membre supérieur gauche" },
  { v: "mid", label: "MID", texte: "au membre inférieur droit" },
  { v: "mig", label: "MIG", texte: "au membre inférieur gauche" },
];

export default {
  categories: [
    {
      id: "oxygene",
      label: "Oxygène / ventilation",
      icone: "🫁",
      items: [
        {
          id: "o2",
          label: "Oxygénothérapie",
          court: "oxygénothérapie",
          champs: [
            {
              id: "support",
              type: "choix",
              label: "Support",
              options: [
                { v: "lunettes", label: "Lunettes", texte: "lunettes nasales" },
                { v: "masque", label: "Masque simple", texte: "masque simple" },
                { v: "mhc", label: "Masque haute concentration", texte: "masque à haute concentration" },
                { v: "ohd", label: "OHD", texte: "oxygénothérapie nasale à haut débit" },
              ],
            },
            { id: "debit", type: "nombre", label: "Débit", unite: "L/min", decimales: 1, raccourcis: [2, 6, 10, 15] },
            { id: "fio2", type: "nombre", label: "FiO2", unite: "%", decimales: 0, si: "support == 'ohd'" },
          ],
          texte: "oxygénothérapie[ par {support}][ à {debit} L/min][, FiO2 {fio2} %]",
        },
        {
          id: "vni",
          label: "VNI",
          majeur: true,
          court: "VNI",
          champs: [
            {
              id: "mode",
              type: "choix",
              label: "Mode",
              options: [
                { v: "vsaipep", label: "VS-AI-PEP", texte: "VS-AI-PEP" },
                { v: "cpap", label: "CPAP", texte: "CPAP" },
              ],
            },
            { id: "ai", type: "nombre", label: "AI", unite: "cmH2O", decimales: 0 },
            { id: "pep", type: "nombre", label: "PEP", unite: "cmH2O", decimales: 0 },
            { id: "fio2", type: "nombre", label: "FiO2", unite: "%", decimales: 0 },
          ],
          texte: "mise sous ventilation non invasive",
          details: ["{mode}", "AI {ai} cmH2O", "PEP {pep} cmH2O", "FiO2 {fio2} %"],
        },
        {
          id: "ventilation",
          label: "Ventilation mécanique (réglages)",
          champs: [
            {
              id: "mode",
              type: "choix",
              label: "Mode",
              options: [
                { v: "vac", label: "VAC", texte: "VAC" },
                { v: "vpc", label: "VPC", texte: "VPC" },
                { v: "vsai", label: "VS-AI", texte: "VS-AI" },
              ],
            },
            { id: "vt", type: "nombre", label: "Volume courant", unite: "mL", decimales: 0 },
            { id: "fr_vent", type: "nombre", label: "FR", unite: "/min", decimales: 0 },
            { id: "pep", type: "nombre", label: "PEP", unite: "cmH2O", decimales: 0 },
            { id: "fio2", type: "nombre", label: "FiO2", unite: "%", decimales: 0 },
          ],
          texte: "ventilation mécanique[ en {mode}]",
          details: ["VT {vt} mL", "{par_kg}", "FR {fr_vent}/min", "PEP {pep} cmH2O", "FiO2 {fio2} %"],
          par_kg: { valeur: "vt", unite_fixe: "mL" },
        },
      ],
    },
    {
      id: "voies_aeriennes",
      label: "Voies aériennes",
      icone: "🫧",
      items: [
        {
          id: "iot",
          label: "Intubation orotrachéale",
          majeur: true,
          court: "intubation orotrachéale",
          champs: [
            {
              id: "hypnotique",
              type: "choix",
              label: "Hypnotique",
              options: [
                { v: "etomidate", label: "Étomidate", texte: "étomidate" },
                { v: "ketamine", label: "Kétamine", texte: "kétamine" },
                { v: "propofol", label: "Propofol", texte: "propofol" },
                { v: "midazolam", label: "Midazolam", texte: "midazolam" },
              ],
            },
            { id: "dose_hypnotique", type: "nombre", label: "Dose hypnotique", unite: "mg", decimales: 1 },
            {
              id: "curare",
              type: "choix",
              label: "Curare",
              options: [
                { v: "succinylcholine", label: "Succinylcholine", texte: "succinylcholine" },
                { v: "rocuronium", label: "Rocuronium", texte: "rocuronium" },
                { v: "aucun", label: "Sans curare", texte: "" },
              ],
            },
            { id: "dose_curare", type: "nombre", label: "Dose curare", unite: "mg", decimales: 1, si: "dans(curare, 'succinylcholine', 'rocuronium')" },
            { id: "sonde", type: "nombre", label: "Sonde n°", decimales: 1 },
            { id: "repere", type: "nombre", label: "Repère aux arcades", unite: "cm", decimales: 0 },
            {
              id: "cormack",
              type: "choix",
              label: "Cormack-Lehane",
              options: ["I", "II", "III", "IV"].map((v) => ({ v, label: v, texte: v, anormal: v === "III" || v === "IV" })),
            },
            { id: "tentatives", type: "nombre", label: "Nombre de tentatives", decimales: 0, raccourcis: [1, 2, 3] },
            { id: "difficulte", type: "texte", label: "Difficultés / incidents" },
          ],
          texte: "intubation orotrachéale",
          details: [
            "induction par {hypnotique}[ {dose_hypnotique} mg]",
            "curarisation par {curare}[ {dose_curare} mg]",
            "sonde n° {sonde}",
            "repère {repere} cm aux arcades",
            "Cormack {cormack}",
            "{tentatives} tentative(s)",
            "{difficulte}",
          ],
        },
        { id: "aspiration", label: "Aspiration des VAS", champs: [], texte: "aspiration des voies aériennes supérieures" },
        { id: "guedel", label: "Canule de Guedel", champs: [], texte: "mise en place d'une canule de Guedel" },
        { id: "subluxation", label: "Subluxation mandibulaire", champs: [], texte: "subluxation mandibulaire" },
        { id: "pls", label: "PLS", champs: [], texte: "mise en position latérale de sécurité" },
        {
          id: "desobstruction",
          label: "Désobstruction (corps étranger)",
          champs: [
            {
              id: "technique",
              type: "multi",
              label: "Technique",
              options: [
                { v: "tapes", label: "Tapes dans le dos", texte: "tapes dans le dos" },
                { v: "heimlich", label: "Heimlich", texte: "manœuvre de Heimlich" },
                { v: "mofenson", label: "Mofenson (nourrisson)", texte: "compressions thoraciques (Mofenson)" },
                { v: "pince", label: "Pince de Magill", texte: "extraction à la pince de Magill" },
              ],
            },
          ],
          texte: "manœuvres de désobstruction des voies aériennes[ : {technique}]",
        },
        { id: "crico", label: "Cricothyroïdotomie", majeur: true, champs: [], texte: "cricothyroïdotomie" },
      ],
    },
    {
      id: "abords",
      label: "Abords vasculaires",
      icone: "💉",
      items: [
        {
          id: "vvp",
          label: "Voie veineuse périphérique",
          champs: [
            {
              id: "nombre",
              type: "choix",
              label: "Nombre",
              options: [
                { v: "1", label: "1", texte: "d'une voie veineuse périphérique" },
                { v: "2", label: "2", texte: "de deux voies veineuses périphériques" },
                { v: "3", label: "3", texte: "de trois voies veineuses périphériques" },
              ],
            },
            {
              id: "calibre",
              type: "choix",
              label: "Calibre",
              options: ["14", "16", "18", "20", "22", "24"].map((v) => ({ v, label: v + " G", texte: v + " G" })),
            },
          ],
          texte: "pose {nombre}[ de calibre {calibre}]",
        },
        {
          id: "io",
          label: "Voie intra-osseuse",
          majeur: true,
          court: "voie intra-osseuse",
          champs: [
            {
              id: "site",
              type: "choix",
              label: "Site",
              options: [
                { v: "tibia", label: "Tibial proximal", texte: "tibiale proximale" },
                { v: "humerus", label: "Huméral", texte: "humérale" },
                { v: "tibia_distal", label: "Tibial distal", texte: "tibiale distale" },
              ],
            },
          ],
          texte: "pose d'une voie intra-osseuse[ {site}]",
        },
        {
          id: "vvc",
          label: "Voie veineuse centrale",
          champs: [
            {
              id: "site",
              type: "choix",
              label: "Site",
              options: [
                { v: "jugulaire", label: "Jugulaire interne", texte: "jugulaire interne" },
                { v: "femorale", label: "Fémorale", texte: "fémorale" },
                { v: "sous_claviere", label: "Sous-clavière", texte: "sous-clavière" },
              ],
            },
            COTE,
          ],
          texte: "pose d'une voie veineuse centrale[ {site}][ {cote}]",
        },
        {
          id: "ka",
          label: "Cathéter artériel",
          champs: [
            {
              id: "site",
              type: "choix",
              label: "Site",
              options: [
                { v: "radial", label: "Radial", texte: "radial" },
                { v: "femoral", label: "Fémoral", texte: "fémoral" },
              ],
            },
          ],
          texte: "pose d'un cathéter artériel[ {site}]",
        },
      ],
    },
    {
      id: "remplissage",
      label: "Remplissage",
      icone: "💧",
      items: [
        {
          id: "remplissage",
          label: "Remplissage vasculaire",
          majeur: true,
          court: "remplissage vasculaire",
          champs: [
            {
              id: "solute",
              type: "choix",
              label: "Soluté",
              options: [
                { v: "ssi", label: "SSI 0,9 %", texte: "sérum salé isotonique 0,9 %" },
                { v: "rl", label: "Ringer lactate", texte: "Ringer lactate" },
                { v: "sg5", label: "SG 5 %", texte: "sérum glucosé 5 %" },
                { v: "sg10", label: "SG 10 %", texte: "sérum glucosé 10 %" },
                { v: "colloide", label: "Colloïde", texte: "colloïde" },
                { v: "bicar", label: "Bicarbonaté 1,4 %", texte: "sérum bicarbonaté 1,4 %" },
              ],
            },
            { id: "volume", type: "nombre", label: "Volume", unite: "mL", decimales: 0, raccourcis: [250, 500, 1000] },
            { id: "duree", type: "texte", label: "Durée de passage", placeholder: "ex. 15 min" },
          ],
          texte: "remplissage vasculaire[ par {volume} mL de][ {solute}][ en {duree}]",
          details: ["{par_kg}"],
          par_kg: { valeur: "volume", unite_fixe: "mL" },
        },
      ],
    },
    {
      id: "medicaments",
      label: "Médicament",
      icone: "💊",
      items: [
        {
          id: "medicament",
          label: "Médicament",
          champs: [
            {
              id: "classe",
              type: "choix",
              label: "Classe",
              sortie: false,
              options: classes.map((c) => ({ v: c.id, label: c.label })),
            },
            {
              id: "medicament",
              type: "choix",
              label: "Médicament",
              options: [
                ...medicaments.map((m) => ({
                  v: m.id,
                  label: majuscule1(m.nom),
                  texte: m.nom,
                  si: `classe == '${m.classe}'`,
                  defauts: { unite: m.unite, voie: m.voie },
                  delai_depuis: m.delai_depuis,
                })),
                { v: "autre", label: "Autre…", texte: "{medicament_autre}", si: "rempli('classe')" },
              ],
            },
            { id: "medicament_autre", type: "texte", label: "Nom du médicament", si: "medicament == 'autre'" },
            { id: "dose", type: "nombre", label: "Dose (saisie par toi)", decimales: 3 },
            { id: "unite", type: "choix", label: "Unité", options: UNITES },
            { id: "voie", type: "choix", label: "Voie", options: VOIES },
            { id: "repetition", type: "texte", label: "Répétition / débit (optionnel)", placeholder: "ex. 3 fois à 20 min d'intervalle" },
          ],
          texte: "{medicament}[ {dose}[ {unite}]][ {voie}][, {repetition}]",
          details: ["{par_kg}", "{delai_ref}"],
          par_kg: { valeur: "dose", unite: "unite" },
        },
      ],
    },
    {
      id: "sang",
      label: "Produits sanguins",
      icone: "🩸",
      items: [
        {
          id: "cgr",
          label: "Culots globulaires (CGR)",
          majeur: true,
          court: "transfusion",
          champs: [
            { id: "nombre", type: "nombre", label: "Nombre de CGR", decimales: 0, raccourcis: [1, 2, 4] },
            { id: "groupe", type: "texte", label: "Groupe (ex. O−)" },
          ],
          texte: "transfusion[ de {nombre}] CGR[ ({groupe})]",
        },
        {
          id: "pfc",
          label: "Plasma frais congelé (PFC)",
          majeur: true,
          court: "transfusion",
          champs: [{ id: "nombre", type: "nombre", label: "Nombre de PFC", decimales: 0, raccourcis: [1, 2, 4] }],
          texte: "transfusion[ de {nombre}] PFC",
        },
        {
          id: "plaquettes",
          label: "Plaquettes",
          majeur: true,
          court: "transfusion",
          champs: [{ id: "nombre", type: "nombre", label: "Nombre d'unités", decimales: 0 }],
          texte: "transfusion de concentrés plaquettaires[ ({nombre} unité(s))]",
        },
        {
          id: "transfusion_massive",
          label: "Protocole de transfusion massive",
          majeur: true,
          court: "protocole de transfusion massive",
          champs: [],
          texte: "déclenchement du protocole de transfusion massive",
        },
      ],
    },
    {
      id: "hemostase",
      label: "Hémostase / immobilisation",
      icone: "🩹",
      items: [
        {
          id: "garrot",
          label: "Garrot",
          majeur: true,
          court: "garrot",
          champs: [{ id: "site", type: "choix", label: "Membre", options: MEMBRES }],
          texte: "pose d'un garrot[ {site}]",
        },
        {
          id: "pansement_compressif",
          label: "Pansement compressif",
          champs: [{ id: "site", type: "texte", label: "Localisation" }],
          texte: "pansement compressif[ ({site})]",
        },
        { id: "ceinture_pelvienne", label: "Ceinture pelvienne", majeur: true, court: "ceinture pelvienne", champs: [], texte: "mise en place d'une ceinture pelvienne" },
        { id: "collier", label: "Collier cervical", champs: [], texte: "mise en place d'un collier cervical" },
        { id: "matelas", label: "Matelas immobilisateur", champs: [], texte: "immobilisation sur matelas à dépression" },
        {
          id: "attelle",
          label: "Attelle / immobilisation",
          champs: [{ id: "site", type: "texte", label: "Localisation" }],
          texte: "immobilisation par attelle[ ({site})]",
        },
        {
          id: "reduction",
          label: "Réduction / réalignement",
          champs: [{ id: "site", type: "texte", label: "Localisation" }],
          texte: "réduction[ ({site})]",
        },
      ],
    },
    {
      id: "drainage",
      label: "Drainage / ponctions",
      icone: "🧷",
      items: [
        { id: "exsufflation", label: "Exsufflation à l'aiguille", majeur: true, court: "exsufflation", champs: [COTE], texte: "exsufflation à l'aiguille[ {cote}]" },
        {
          id: "drain",
          label: "Drain thoracique",
          majeur: true,
          court: "drainage thoracique",
          champs: [
            COTE,
            { id: "calibre", type: "nombre", label: "Calibre", unite: "Ch", decimales: 0 },
            {
              id: "ramene",
              type: "choix",
              label: "Ramène",
              options: [
                { v: "air", label: "Air", texte: "de l'air" },
                { v: "sang", label: "Sang", texte: "du sang", anormal: true },
                { v: "air_sang", label: "Air + sang", texte: "de l'air et du sang", anormal: true },
                { v: "liquide", label: "Liquide séro-citrin", texte: "un liquide séro-citrin" },
                { v: "pus", label: "Pus", texte: "du pus", anormal: true },
              ],
            },
            { id: "volume", type: "nombre", label: "Volume recueilli", unite: "mL", decimales: 0 },
          ],
          texte: "drainage thoracique[ {cote}][ (drain {calibre} Ch)][ ramenant {ramene}][ ({volume} mL)]",
        },
        {
          id: "pericardiocentese",
          label: "Péricardiocentèse",
          majeur: true,
          court: "péricardiocentèse",
          champs: [{ id: "volume", type: "nombre", label: "Volume", unite: "mL", decimales: 0 }],
          texte: "péricardiocentèse[ ramenant {volume} mL]",
        },
        {
          id: "pl",
          label: "Ponction lombaire",
          champs: [{ id: "aspect", type: "texte", label: "Aspect du liquide" }],
          texte: "ponction lombaire[ ramenant un liquide {aspect}]",
        },
      ],
    },
    {
      id: "sondes",
      label: "Sondes",
      icone: "🔌",
      items: [
        { id: "sng", label: "Sonde nasogastrique", champs: [], texte: "pose d'une sonde nasogastrique" },
        {
          id: "sonde_urinaire",
          label: "Sonde urinaire",
          champs: [{ id: "diurese", type: "nombre", label: "Diurèse initiale", unite: "mL", decimales: 0 }],
          texte: "pose d'une sonde urinaire[ ramenant {diurese} mL d'urines]",
        },
      ],
    },
    {
      id: "autres",
      label: "Autres",
      icone: "➕",
      items: [
        {
          id: "rechauffement",
          label: "Réchauffement",
          champs: [
            {
              id: "moyen",
              type: "multi",
              label: "Moyens",
              options: [
                { v: "couverture", label: "Couverture", texte: "couverture" },
                { v: "air_pulse", label: "Air pulsé", texte: "couverture à air pulsé" },
                { v: "solutes", label: "Solutés réchauffés", texte: "solutés réchauffés" },
              ],
            },
          ],
          texte: "réchauffement[ ({moyen})]",
        },
        { id: "refroidissement", label: "Refroidissement", champs: [], texte: "refroidissement externe" },
        { id: "dlg", label: "Décubitus latéral gauche", champs: [], texte: "installation en décubitus latéral gauche" },
        {
          id: "pansement",
          label: "Pansement / suture",
          champs: [{ id: "site", type: "texte", label: "Localisation / détail" }],
          texte: "parage et pansement[ ({site})]",
        },
        {
          id: "libre",
          label: "Autre geste (texte libre)",
          champs: [{ id: "texte", type: "texte_long", label: "Description" }],
          texte: "{texte}",
        },
      ],
    },
  ],
};
