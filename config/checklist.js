// ANTI-OUBLI — règles du tronc commun (chaque module ajoute les siennes).
// si      : condition qui déclenche le rappel (mini-langage, voir docs/AJOUTER_UN_MOTIF.md)
// message : texte affiché
// aller   : champ vers lequel le rappel emmène quand on le touche

export default [
  { si: "vide('motifs')", message: "Motif d'admission non renseigné", aller: "motifs" },
  { si: "vide('age')", message: "Âge non renseigné", aller: "age" },
  { si: "pediatrique && vide('poids')", message: "Enfant sans poids (mesuré ou estimé)", aller: "poids" },
  { si: "femme_procreer && vide('grossesse')", message: "Femme en âge de procréer : statut de grossesse non renseigné", aller: "grossesse" },
  { si: "vide('allergies')", message: "Allergies non renseignées", aller: "allergies" },
  { si: "vide('traitements')", message: "Traitement habituel non renseigné", aller: "traitements" },

  { si: "vide('fc')", message: "FC non renseignée", aller: "fc" },
  { si: "vide('pas')", message: "PA non renseignée", aller: "pa" },
  { si: "vide('fr')", message: "FR non renseignée", aller: "fr" },
  { si: "vide('spo2')", message: "SpO2 non renseignée", aller: "spo2" },
  { si: "rempli('spo2') && vide('spo2_support')", message: "SpO2 : air ambiant ou sous O2 ?", aller: "spo2_support" },
  { si: "vide('temp')", message: "Température non renseignée", aller: "temp" },
  { si: "vide('gcs') && vide('avpu')", message: "État de conscience (GCS) non renseigné", aller: "gcs_y" },
  { si: "vide('pupilles')", message: "Pupilles non renseignées", aller: "pupilles" },
  { si: "(trouble_conscience || motif('coma')) && vide('glycemie')", message: "Troubles de conscience sans glycémie capillaire", aller: "glycemie" },
  { si: "gcs <= 8 && vide('va_protection')", message: "GCS ≤ 8 : protection des voies aériennes non documentée", aller: "va_protection" },
  { si: "instabilite && nbgestes() == 0", message: "Instabilité hémodynamique : aucune prise en charge documentée", aller: "fc" },
  { si: "coche('saignement_moyen', 'garrot') && !geste('garrot')", message: "Garrot : heure de pose non notée (+ Geste → Garrot)", aller: "saignement_moyen" },
  { si: "visible('vat') && vide('vat')", message: "Plaie : statut antitétanique non renseigné", aller: "vat" },

  { si: "nbgestes() > 0 && nbreevals() == 0", message: "Gestes réalisés mais aucune réévaluation", aller: "reevaluation" },
  { si: "vide('orientation')", message: "Orientation non renseignée", aller: "orientation" },
];
