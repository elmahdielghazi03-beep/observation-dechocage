// MODULE — POLYTRAUMATISME
// Ajoute : mécanisme (histoire), bilan lésionnel tête aux pieds (examen), scores ABC / T-RTS / PTS,
// critères de Vittel (synthèse), hypothèses, anti-oubli, gestes et examens mis en avant.
import abc from "../scores/abc.js";
import rts from "../scores/rts.js";
import pts from "../scores/pts.js";

// Région du bilan lésionnel : « RAS » ou lésions (choix multiple) + précision libre
const region = (id, label, ras, lesions, extra = {}) => ({
  id,
  type: "multi",
  label,
  precision: true,
  nouvelle: true,
  phrase: `${label.charAt(0).toLowerCase() + label.slice(1)} : {valeur}`,
  options: [{ v: "ras", label: "RAS", texte: ras, exclusif: true }, ...lesions.map(([v, l, t]) => ({ v, label: l, texte: t ?? l.toLowerCase(), anormal: true }))],
  ...extra,
});

const LESIONS_MEMBRE = [
  ["douleur", "Douleur"],
  ["deformation", "Déformation"],
  ["impotence", "Impotence fonctionnelle"],
  ["plaie", "Plaie"],
  ["fracture_ouverte", "Fracture ouverte", "fracture ouverte"],
  ["amputation", "Amputation"],
];

// Membre : lésions + pouls distal + sensibilité/motricité distales (si lésion)
const membre = (id, label, pouls) => {
  const lese = `rempli('${id}') && !coche('${id}', 'ras')`;
  return [
    region(id, label, `${label.charAt(0).toLowerCase() + label.slice(1)} sans lésion`, LESIONS_MEMBRE),
    {
      id: `${id}_pouls`,
      type: "choix",
      label: `${label} : pouls ${pouls}`,
      si: lese,
      options: [
        { v: "percu", label: "Perçu", texte: `pouls ${pouls} perçu` },
        { v: "absent", label: "Aboli", texte: `pouls ${pouls} aboli`, anormal: true },
      ],
    },
    {
      id: `${id}_neuro`,
      type: "choix",
      label: `${label} : sensibilité / motricité distales`,
      si: lese,
      options: [
        { v: "conservee", label: "Conservées", texte: "sensibilité et motricité distales conservées" },
        { v: "alteree", label: "Altérées", texte: "déficit sensitivo-moteur distal", anormal: true },
      ],
    },
  ];
};

export default {
  id: "polytraumatisme",
  titre: "Polytraumatisme",
  icone: "🚑",
  texte_motif: "polytraumatisme",

  groupes: [
    // ---------------------------------------------------------------- Histoire : mécanisme
    {
      section: "hdm",
      apres: "hdm_debut_g",
      id: "pt_mecanisme_g",
      titre: "Traumatisme — mécanisme",
      champs: [
        { id: "pt_heure", type: "heure", label: "Heure de l'accident", cle: true, sortie: false },
        {
          id: "pt_mecanisme",
          type: "choix",
          label: "Mécanisme",
          cle: true,
          phrase: "{Le_patient} a été victime[ {pt_heure}][ ({delai:pt_heure} avant l'admission)] {valeur}",
          options: [
            { v: "avp", label: "AVP", texte: "d'un accident de la voie publique" },
            { v: "chute", label: "Chute", texte: "d'une chute[ d'une hauteur d'environ {pt_chute_hauteur} m]" },
            { v: "arme_blanche", label: "Arme blanche", texte: "d'une agression par arme blanche" },
            { v: "arme_feu", label: "Arme à feu", texte: "d'une blessure par arme à feu" },
            { v: "agression", label: "Agression (coups)", texte: "d'une agression (coups)" },
            { v: "ecrasement", label: "Écrasement / ensevelissement", texte: "d'un écrasement ou ensevelissement[ ({pt_ecrasement_duree} min)]" },
            { v: "explosion", label: "Explosion / blast", texte: "d'une explosion (blast)" },
            { v: "travail", label: "Accident de travail", texte: "d'un accident de travail" },
            { v: "autre", label: "Autre", texte: "d'un traumatisme[ ({pt_mecanisme_autre})]" },
          ],
        },
        { id: "pt_mecanisme_autre", type: "texte", label: "Préciser", si: "pt_mecanisme == 'autre'", sortie: false },
        // AVP
        {
          id: "pt_victime",
          type: "choix",
          label: "Victime",
          si: "pt_mecanisme == 'avp'",
          options: [
            { v: "conducteur", label: "Conducteur voiture", texte: "conducteur d'un véhicule léger", texte_f: "conductrice d'un véhicule léger" },
            { v: "passager_av", label: "Passager avant", texte: "passager avant", texte_f: "passagère avant" },
            { v: "passager_ar", label: "Passager arrière", texte: "passager arrière", texte_f: "passagère arrière" },
            { v: "moto", label: "Motocycliste", texte: "conducteur d'un deux-roues motorisé", texte_f: "conductrice d'un deux-roues motorisé" },
            { v: "passager_moto", label: "Passager 2-roues", texte: "passager d'un deux-roues motorisé", texte_f: "passagère d'un deux-roues motorisé" },
            { v: "cycliste", label: "Cycliste", texte: "cycliste" },
            { v: "pieton", label: "Piéton", texte: "piéton", texte_f: "piétonne" },
          ],
        },
        {
          id: "pt_contre",
          type: "choix",
          label: "Contre",
          si: "pt_mecanisme == 'avp'",
          options: [
            { v: "voiture", label: "Voiture", texte: "impliquant une voiture" },
            { v: "poids_lourd", label: "Poids lourd", texte: "impliquant un poids lourd" },
            { v: "deux_roues", label: "Deux-roues", texte: "impliquant un deux-roues" },
            { v: "bus", label: "Bus / autocar", texte: "impliquant un bus" },
            { v: "obstacle", label: "Obstacle fixe", texte: "contre un obstacle fixe" },
            { v: "seul", label: "Sans tiers", texte: "sans tiers impliqué (perte de contrôle)" },
          ],
        },
        {
          id: "pt_vitesse",
          type: "choix",
          label: "Vitesse estimée",
          si: "pt_mecanisme == 'avp'",
          options: [
            { v: "faible", label: "Faible", texte: "à faible vitesse" },
            { v: "moyenne", label: "Modérée", texte: "à vitesse modérée" },
            { v: "elevee", label: "Élevée", texte: "à vitesse élevée[ (environ {pt_vitesse_kmh} km/h)]", anormal: true },
          ],
        },
        { id: "pt_vitesse_kmh", type: "nombre", label: "Vitesse (km/h)", decimales: 0, si: "pt_vitesse == 'elevee'", sortie: false },
        {
          id: "pt_ceinture",
          type: "choix",
          label: "Ceinture de sécurité",
          si: "dans(pt_victime, 'conducteur', 'passager_av', 'passager_ar')",
          options: [
            { v: "oui", label: "Attachée", texte: "ceinture de sécurité attachée" },
            { v: "non", label: "Non attachée", texte: "ceinture de sécurité non attachée", anormal: true },
          ],
        },
        {
          id: "pt_voiture",
          type: "multi",
          label: "Éléments de cinétique (véhicule)",
          si: "dans(pt_victime, 'conducteur', 'passager_av', 'passager_ar')",
          options: [
            { v: "airbag", label: "Airbag déclenché", texte: "airbag déclenché" },
            { v: "ejection", label: "Éjection", texte: "éjection du véhicule", anormal: true },
            { v: "incarceration", label: "Incarcération", texte: "incarcération[ ({pt_incarceration} min)]", anormal: true },
            { v: "tonneaux", label: "Tonneaux", texte: "tonneaux", anormal: true },
            { v: "deformation", label: "Habitacle déformé", texte: "déformation importante de l'habitacle", anormal: true },
            { v: "deces", label: "Décès d'un occupant", texte: "décès d'un occupant du même véhicule", anormal: true },
          ],
        },
        { id: "pt_incarceration", type: "nombre", label: "Durée d'incarcération (min)", decimales: 0, si: "coche('pt_voiture', 'incarceration')", sortie: false },
        {
          id: "pt_casque",
          type: "choix",
          label: "Casque",
          si: "dans(pt_victime, 'moto', 'passager_moto', 'cycliste')",
          options: [
            { v: "oui", label: "Casqué", texte: "casqué{e}" },
            { v: "non", label: "Non casqué", texte: "non casqué{e}", anormal: true },
          ],
        },
        {
          id: "pt_projection",
          type: "choix",
          label: "Projection",
          si: "dans(pt_victime, 'moto', 'passager_moto', 'cycliste', 'pieton')",
          options: [
            { v: "non", label: "Non", texte: "sans projection" },
            { v: "oui", label: "Oui", texte: "avec projection[ à environ {pt_projection_m} m]", anormal: true },
          ],
        },
        { id: "pt_projection_m", type: "nombre", label: "Distance de projection (m)", decimales: 0, si: "pt_projection == 'oui'", sortie: false },
        // Chute
        {
          id: "pt_chute_hauteur",
          type: "nombre",
          label: "Hauteur de chute (m)",
          decimales: 1,
          si: "pt_mecanisme == 'chute'",
          sortie: false,
          anormal_si: "valeur > 6 || (age_ans < 15 && valeur > 3)",
        },
        {
          id: "pt_chute_impact",
          type: "multi",
          label: "Point d'impact",
          si: "pt_mecanisme == 'chute'",
          phrase: "avec réception sur {valeur}",
          options: [
            { v: "pieds", label: "Pieds", texte: "les pieds" },
            { v: "tete", label: "Tête", texte: "la tête" },
            { v: "dos", label: "Dos", texte: "le dos" },
            { v: "bassin", label: "Bassin", texte: "le bassin" },
            { v: "membres_sup", label: "Membres supérieurs", texte: "les membres supérieurs" },
          ],
        },
        // Arme
        {
          id: "pt_plaies_nb",
          type: "nombre",
          label: "Nombre de plaies",
          decimales: 0,
          si: "dans(pt_mecanisme, 'arme_blanche', 'arme_feu')",
          phrase: "{valeur} plaie(s)[ au niveau {pt_plaies_loc}]",
        },
        {
          id: "pt_plaies_loc",
          type: "multi",
          label: "Localisation des plaies",
          si: "dans(pt_mecanisme, 'arme_blanche', 'arme_feu')",
          sortie: false,
          options: [
            { v: "tete", label: "Tête", texte: "de la tête" },
            { v: "cou", label: "Cou", texte: "du cou" },
            { v: "thorax", label: "Thorax", texte: "du thorax" },
            { v: "abdomen", label: "Abdomen", texte: "de l'abdomen" },
            { v: "dos", label: "Dos", texte: "du dos" },
            { v: "bassin", label: "Bassin / périnée", texte: "du bassin" },
            { v: "membres", label: "Membres", texte: "des membres" },
          ],
        },
        {
          id: "pt_orifice_sortie",
          type: "choix",
          label: "Orifice de sortie",
          si: "pt_mecanisme == 'arme_feu'",
          options: [
            { v: "oui", label: "Retrouvé", texte: "orifice de sortie retrouvé" },
            { v: "non", label: "Absent", texte: "pas d'orifice de sortie retrouvé" },
          ],
        },
        // Écrasement
        { id: "pt_ecrasement_duree", type: "nombre", label: "Durée d'écrasement (min)", decimales: 0, si: "pt_mecanisme == 'ecrasement'", sortie: false },
        // Commun
        {
          id: "pt_pci",
          type: "choix",
          label: "Perte de connaissance initiale",
          cle: true,
          nouvelle: true,
          options: [
            { v: "non", label: "Non", texte: "pas de perte de connaissance initiale" },
            { v: "oui", label: "Oui", texte: "notion de perte de connaissance initiale[ d'environ {pt_pci_duree} min]", anormal: true },
            { v: "inconnue", label: "Inconnue", texte: "perte de connaissance initiale non précisée" },
          ],
        },
        { id: "pt_pci_duree", type: "nombre", label: "Durée (min)", decimales: 0, si: "pt_pci == 'oui'", sortie: false },
        {
          id: "pt_douleurs",
          type: "multi",
          label: "Douleurs exprimées",
          autre: true,
          phrase: "douleurs rapportées au niveau {valeur}",
          options: [
            { v: "crane", label: "Crâne", texte: "du crâne" },
            { v: "cervical", label: "Rachis cervical", texte: "du rachis cervical" },
            { v: "thorax", label: "Thorax", texte: "du thorax" },
            { v: "abdomen", label: "Abdomen", texte: "de l'abdomen" },
            { v: "bassin", label: "Bassin", texte: "du bassin" },
            { v: "dos", label: "Dos", texte: "du rachis dorso-lombaire" },
            { v: "msd", label: "MSD", texte: "du membre supérieur droit" },
            { v: "msg", label: "MSG", texte: "du membre supérieur gauche" },
            { v: "mid", label: "MID", texte: "du membre inférieur droit" },
            { v: "mig", label: "MIG", texte: "du membre inférieur gauche" },
          ],
        },
        {
          id: "pt_toxiques",
          type: "choix",
          label: "Alcool / toxiques",
          options: [
            { v: "non", label: "Non", texte: "pas de notion de prise d'alcool ou de toxiques" },
            { v: "alcool", label: "Alcool", texte: "notion de prise d'alcool", anormal: true },
            { v: "toxiques", label: "Toxiques", texte: "notion de prise de toxiques", anormal: true },
          ],
        },
      ],
    },

    // ---------------------------------------------------------------- Examen : bilan lésionnel
    {
      section: "examen",
      id: "pt_bilan",
      titre: "Bilan lésionnel (tête aux pieds)",
      prefixe: "Bilan lésionnel : ",
      normal: {
        label: "Tout RAS",
        valeurs: {
          pt_crane: ["ras"],
          pt_rachis_cervical: ["ras"],
          pt_thorax: ["ras"],
          pt_abdomen: ["ras"],
          pt_bassin: ["ras"],
          pt_perinee: ["ras"],
          pt_rachis_dl: ["ras"],
          pt_msd: ["ras"],
          pt_msg: ["ras"],
          pt_mid: ["ras"],
          pt_mig: ["ras"],
          pt_medullaire: ["ras"],
        },
        phrase: "examen de la tête aux pieds sans lésion traumatique retrouvée (crâne, face, rachis, thorax, abdomen, bassin, périnée et membres), pas de signe d'atteinte médullaire.",
      },
      champs: [
        region("pt_crane", "Crâne et face", "crâne et face sans lésion", [
          ["plaie_scalp", "Plaie du scalp"],
          ["embarrure", "Embarrure"],
          ["otorragie", "Otorragie"],
          ["rhinorrhee", "Rhinorrhée / otoliquorrhée", "rhinorrhée ou otoliquorrhée"],
          ["lunettes", "Ecchymose en lunettes", "ecchymose périorbitaire en lunettes"],
          ["battle", "Ecchymose rétro-auriculaire"],
          ["fracture_face", "Fracture faciale suspectée"],
          ["oeil", "Traumatisme oculaire"],
        ]),
        region("pt_rachis_cervical", "Rachis cervical", "rachis cervical indolore", [
          ["douleur", "Douleur des épineuses", "douleur à la palpation des épineuses"],
          ["contracture", "Contracture"],
          ["deformation", "Déformation"],
        ]),
        region("pt_thorax", "Thorax", "thorax sans lésion pariétale", [
          ["douleur", "Douleur costale", "douleur costale à la palpation"],
          ["ecchymose", "Ecchymose / dermabrasion"],
          ["plaie", "Plaie"],
          ["deformation", "Déformation"],
        ]),
        region("pt_abdomen", "Abdomen", "abdomen souple, dépressible et indolore", [
          ["sensibilite", "Sensibilité"],
          ["defense", "Défense"],
          ["contracture", "Contracture"],
          ["distension", "Distension"],
          ["ceinture", "Ecchymose en ceinture", "ecchymose en bande (signe de la ceinture)"],
          ["plaie", "Plaie"],
          ["evisceration", "Éviscération"],
        ]),
        region(
          "pt_bassin",
          "Bassin",
          "bassin stable et indolore",
          [
            ["douleur", "Douleur"],
            ["instabilite", "Instabilité"],
            ["deformation", "Déformation"],
          ],
          { aide: "Instabilité : à tester une seule fois." },
        ),
        region("pt_perinee", "Périnée / OGE", "périnée sans lésion", [
          ["uretrorragie", "Urétrorragie"],
          ["hematome", "Hématome périnéal"],
          ["plaie", "Plaie"],
          ["tr_sang", "Sang au TR", "sang au toucher rectal"],
        ]),
        region("pt_rachis_dl", "Rachis dorso-lombaire", "rachis dorso-lombaire indolore à l'examen en monobloc", [
          ["douleur", "Douleur"],
          ["deformation", "Déformation"],
          ["marche", "Marche d'escalier"],
        ]),
        ...membre("pt_msd", "Membre supérieur droit", "radial"),
        ...membre("pt_msg", "Membre supérieur gauche", "radial"),
        ...membre("pt_mid", "Membre inférieur droit", "pédieux"),
        ...membre("pt_mig", "Membre inférieur gauche", "pédieux"),
        region("pt_medullaire", "Examen médullaire", "pas de signe d'atteinte médullaire", [
          ["niveau", "Niveau sensitif", "niveau sensitif"],
          ["deficit", "Déficit moteur des membres", "déficit moteur des membres"],
          ["priapisme", "Priapisme"],
          ["selle", "Anesthésie en selle"],
        ]),
      ],
    },

    // ---------------------------------------------------------------- Examen : scores
    {
      section: "examen",
      id: "pt_scores",
      titre: "Scores — traumatisé",
      prefixe: "Scores : ",
      champs: [abc, rts, pts],
    },

    // ---------------------------------------------------------------- Synthèse : Vittel
    {
      section: "synthese",
      apres: "syn_gravite",
      id: "pt_vittel_g",
      titre: "Critères de Vittel (traumatisé)",
      champs: [
        {
          type: "criteres",
          id: "vittel",
          label: "Critères de Vittel",
          aide: "Pré-cochés d'après les données — un seul critère suffit à définir un traumatisé grave.",
          phrase: "Critères de Vittel présents : {liste}",
          marquer: true,
          items: [
            { id: "vit_gcs", categorie: "Variables physiologiques", label: "GCS < 13", auto: "gcs < 13", detail: ["GCS {gcs_court}"] },
            { id: "vit_pas", categorie: "Variables physiologiques", label: "PAS < 90 mmHg", auto: "pas < 90", detail: ["{pas} mmHg"] },
            { id: "vit_spo2", categorie: "Variables physiologiques", label: "SpO2 < 90 %", auto: "spo2 < 90", detail: ["{spo2} %"] },
            { id: "vit_ejection", categorie: "Éléments de cinétique", label: "Éjection d'un véhicule", auto: "coche('pt_voiture', 'ejection')" },
            { id: "vit_deces", categorie: "Éléments de cinétique", label: "Autre passager décédé dans le même véhicule", auto: "coche('pt_voiture', 'deces')" },
            { id: "vit_chute", categorie: "Éléments de cinétique", label: "Chute > 6 m", auto: "pt_chute_hauteur > 6" },
            { id: "vit_projection", categorie: "Éléments de cinétique", label: "Victime projetée ou écrasée", auto: "pt_projection == 'oui' || pt_mecanisme == 'ecrasement'" },
            {
              id: "vit_appreciation",
              categorie: "Éléments de cinétique",
              label: "Appréciation globale (déformation du véhicule, vitesse, absence de casque ou de ceinture)",
              texte: "cinétique élevée (appréciation globale)",
              auto: "pt_vitesse == 'elevee' || coche('pt_voiture', 'deformation') || pt_casque == 'non' || pt_ceinture == 'non'",
            },
            { id: "vit_blast", categorie: "Éléments de cinétique", label: "Blast", auto: "pt_mecanisme == 'explosion'" },
            {
              id: "vit_penetrant",
              categorie: "Lésions anatomiques",
              label: "Traumatisme pénétrant (tête, cou, thorax, abdomen, bassin, bras, cuisse)",
              texte: "traumatisme pénétrant",
              auto: "dans(pt_mecanisme, 'arme_blanche', 'arme_feu')",
            },
            { id: "vit_volet", categorie: "Lésions anatomiques", label: "Volet thoracique", auto: "coche('thorax_trauma', 'volet')" },
            { id: "vit_brulure", categorie: "Lésions anatomiques", label: "Brûlure sévère, inhalation de fumées" },
            { id: "vit_bassin", categorie: "Lésions anatomiques", label: "Fracas du bassin", auto: "coche('pt_bassin', 'instabilite')" },
            { id: "vit_medullaire", categorie: "Lésions anatomiques", label: "Suspicion d'atteinte médullaire", auto: "rempli('pt_medullaire') && !coche('pt_medullaire', 'ras')" },
            {
              id: "vit_amputation",
              categorie: "Lésions anatomiques",
              label: "Amputation au niveau du poignet, de la cheville ou au-dessus",
              texte: "amputation",
              auto: "coche('pt_msd', 'amputation') || coche('pt_msg', 'amputation') || coche('pt_mid', 'amputation') || coche('pt_mig', 'amputation')",
            },
            {
              id: "vit_ischemie",
              categorie: "Lésions anatomiques",
              label: "Ischémie aiguë de membre",
              auto: "pt_msd_pouls == 'absent' || pt_msg_pouls == 'absent' || pt_mid_pouls == 'absent' || pt_mig_pouls == 'absent'",
            },
            { id: "vit_ventilation", categorie: "Réanimation pré-hospitalière", label: "Ventilation assistée", auto: "coche('ph_gestes', 'iot')" },
            { id: "vit_remplissage", categorie: "Réanimation pré-hospitalière", label: "Remplissage > 1 000 mL de colloïdes" },
            { id: "vit_catecho", categorie: "Réanimation pré-hospitalière", label: "Catécholamines" },
            { id: "vit_pantalon", categorie: "Réanimation pré-hospitalière", label: "Pantalon antichoc gonflé" },
            { id: "vit_age", categorie: "Terrain (à prendre en compte)", label: "Âge > 65 ans", auto: "age_ans > 65" },
            { id: "vit_ic", categorie: "Terrain (à prendre en compte)", label: "Insuffisance cardiaque ou coronarienne", auto: "coche('atcd_med', 'ic') || coche('atcd_med', 'coronarien')" },
            { id: "vit_ir", categorie: "Terrain (à prendre en compte)", label: "Insuffisance respiratoire", auto: "coche('atcd_med', 'bpco')" },
            { id: "vit_grossesse", categorie: "Terrain (à prendre en compte)", label: "Grossesse (2e ou 3e trimestre)", auto: "grossesse == 'oui' && grossesse_terme >= 14" },
            {
              id: "vit_crase",
              categorie: "Terrain (à prendre en compte)",
              label: "Trouble de la crase sanguine (dont anticoagulant)",
              texte: "trouble de la crase sanguine",
              auto: "coche('atcd_med', 'hemostase') || coche('ttt_classes', 'anticoag')",
            },
          ],
        },
      ],
    },
  ],

  hypotheses: [
    "Choc hémorragique",
    "Hémopéritoine",
    "Lésion splénique",
    "Lésion hépatique",
    "Hémothorax",
    "Pneumothorax",
    "Pneumothorax compressif",
    "Contusion pulmonaire",
    "Tamponnade",
    "Traumatisme crânien grave",
    "Traumatisme crânien léger",
    "Lésion médullaire",
    "Fracture du bassin",
    "Fracture(s) de membre(s)",
    "Fracture ouverte",
    "Lésion vasculaire",
    "Traumatisme rénal / urétral",
  ],

  checklist: [
    { si: "vide('pt_mecanisme')", message: "Polytrauma : mécanisme non renseigné", aller: "pt_mecanisme" },
    { si: "vide('pt_heure')", message: "Polytrauma : heure de l'accident non renseignée", aller: "pt_heure" },
    { si: "vide('va_rachis')", message: "Polytrauma : rachis cervical / collier non documenté", aller: "va_rachis" },
    { si: "!coche('ex_demandes', 'efast')", message: "Polytrauma : eFAST non documentée", aller: "ex_demandes" },
    { si: "!coche('ex_demandes', 'groupage')", message: "Polytrauma : groupage ABO-Rh + RAI non demandé", aller: "ex_demandes" },
    { si: "!coche('ex_demandes', 'nfs') && !coche('ex_demandes', 'hemocue')", message: "Polytrauma : hémoglobine non demandée", aller: "ex_demandes" },
    {
      si: "femme_procreer && !coche('ex_demandes', 'bhcg') && !coche('ex_demandes', 'bhcg_plasma')",
      message: "Polytrauma : βHCG non demandés (femme en âge de procréer)",
      aller: "ex_demandes",
    },
    { si: "vide('pt_bassin')", message: "Polytrauma : bassin non examiné", aller: "pt_bassin" },
    { si: "visible('pt_msd_pouls') && vide('pt_msd_pouls')", message: "Membre supérieur droit lésé : pouls distal non noté", aller: "pt_msd_pouls" },
    { si: "visible('pt_msg_pouls') && vide('pt_msg_pouls')", message: "Membre supérieur gauche lésé : pouls distal non noté", aller: "pt_msg_pouls" },
    { si: "visible('pt_mid_pouls') && vide('pt_mid_pouls')", message: "Membre inférieur droit lésé : pouls distal non noté", aller: "pt_mid_pouls" },
    { si: "visible('pt_mig_pouls') && vide('pt_mig_pouls')", message: "Membre inférieur gauche lésé : pouls distal non noté", aller: "pt_mig_pouls" },
  ],

  suggestions: [{ si: "pt_pci == 'oui' || gcs < 15", module: "traumatisme_cranien", message: "PCI ou GCS < 15" }],

  gestes_favoris: [
    { item: "o2", label: "O2" },
    { item: "vvp", label: "VVP" },
    { item: "collier", label: "Collier cervical" },
    { item: "ceinture_pelvienne", label: "Ceinture pelvienne" },
    { item: "garrot", label: "Garrot" },
    { item: "remplissage", label: "Remplissage" },
    { item: "medicament", preset: { classe: "hemostase", medicament: "acide_tranexamique" }, label: "Acide tranexamique" },
    { item: "cgr", label: "Transfusion CGR" },
    { item: "exsufflation", label: "Exsufflation" },
    { item: "drain", label: "Drain thoracique" },
  ],

  examens_suggeres: ["efast", "groupage", "nfs", "hemostase", "gds", "iono", "renal", "rx_thorax", "rx_bassin", "body_scanner", "bhcg"],
};
