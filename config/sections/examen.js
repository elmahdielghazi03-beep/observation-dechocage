// SECTION 6 — Examen clinique par appareil
// Les modules ajoutent leur examen ciblé AVANT le groupe « Autres appareils » (marqué fin: true).

const appareil = (id, label, normal, nomAnormal) => [
  {
    id,
    type: "choix",
    label,
    options: [
      { v: "normal", label: "Normal", texte: normal },
      { v: "anormal", label: "Anormal", texte: `${nomAnormal}[ : {${id}_detail}]`, anormal: true },
    ],
  },
  { id: `${id}_detail`, type: "texte", label: `${label} : préciser`, si: `${id} == 'anormal'`, sortie: false },
];

export default {
  id: "examen",
  titre: "Examen clinique par appareil",
  icone: "🔍",
  groupes: [
    {
      id: "ex_autres",
      titre: "Autres appareils",
      fin: true,
      normal: {
        label: "Tout normal",
        valeurs: {
          ex_cardio: "normal",
          ex_pulmo: "normal",
          ex_abdo: "normal",
          ex_neuro: "normal",
          ex_orl: "normal",
          ex_uro: "normal",
          ex_osteo: "normal",
          ex_cutane: "normal",
          ex_ganglions: "normal",
        },
        phrase: "Le reste de l'examen somatique est sans particularité : abdomen souple, dépressible et indolore, aires ganglionnaires libres.",
      },
      champs: [
        ...appareil("ex_cardio", "Cardio-vasculaire", "examen cardio-vasculaire sans autre particularité", "examen cardio-vasculaire anormal"),
        ...appareil("ex_pulmo", "Pleuro-pulmonaire", "examen pleuro-pulmonaire sans autre particularité", "examen pleuro-pulmonaire anormal"),
        ...appareil("ex_abdo", "Abdominal", "abdomen souple, dépressible et indolore", "examen abdominal anormal"),
        ...appareil("ex_neuro", "Neurologique", "examen neurologique sans autre particularité", "examen neurologique anormal"),
        ...appareil("ex_orl", "ORL / ophtalmologique", "examen ORL et ophtalmologique sans particularité", "examen ORL / ophtalmologique anormal"),
        ...appareil("ex_uro", "Uro-génital", "examen uro-génital sans particularité", "examen uro-génital anormal"),
        ...appareil("ex_osteo", "Ostéo-articulaire", "examen ostéo-articulaire sans particularité", "examen ostéo-articulaire anormal"),
        ...appareil("ex_cutane", "Cutanéo-muqueux", "examen cutanéo-muqueux sans autre particularité", "examen cutanéo-muqueux anormal"),
        ...appareil("ex_ganglions", "Aires ganglionnaires", "aires ganglionnaires libres", "adénopathies"),
      ],
    },
  ],
};
