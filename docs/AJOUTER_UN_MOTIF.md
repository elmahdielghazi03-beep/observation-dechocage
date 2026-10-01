# Ajouter ou modifier un motif

Chaque motif est un **fichier** dans `config/motifs/`. Le code de l'application ne contient aucune question médicale : tout est dans ces fichiers.

## En bref

1. Copie un motif existant, par exemple `config/motifs/coma.js` → `config/motifs/convulsions.js`.
2. Modifie `id`, `titre`, `icone` et `texte_motif`, puis les questions (voir ci-dessous).
3. Dans `config/motifs/index.js`, ajoute deux choses :
   ```js
   import convulsions from "./convulsions.js";
   export default [polytraumatisme, detresseRespiratoire, coma, convulsions, autre];
   ```
4. Teste sur l'ordinateur (voir `DEPLOIEMENT.md`, partie 4), puis mets en ligne (augmente `VERSION` dans `sw.js`).

> Si l'écran affiche « Erreur au chargement », il manque presque toujours une **virgule** entre deux éléments, ou un guillemet ou une accolade fermante. Le message donne le fichier et la ligne.

---

## Structure d'un fichier motif

```js
export default {
  id: "convulsions",                 // identifiant unique, sans espace ni accent
  titre: "Convulsions / état de mal",
  icone: "⚡",
  texte_motif: "crise convulsive",   // écrit dans « Admis pour … »

  groupes: [                         // questions ajoutées au formulaire
    {
      section: "hdm",                // où les placer (voir la liste des sections)
      apres: "hdm_debut_g",          // optionnel : après quel groupe
      id: "cv_hdm",
      titre: "Crise — histoire",
      champs: [ /* champs */ ],
    },
  ],

  hypotheses: ["État de mal épileptique", "Convulsion fébrile"],  // proposées, jamais pré-cochées
  checklist: [ { si: "vide('cv_debut')", message: "Heure de début de crise manquante", aller: "cv_debut" } ],
  suggestions: [ { si: "temp >= 38", module: "sepsis", message: "Fièvre" } ],
  gestes_favoris: [ { item: "medicament", preset: { classe: "antiepileptique", medicament: "diazepam" }, label: "Diazépam" } ],
  examens_suggeres: ["iono", "calcemie", "tdm_cerebrale"],          // marqués ★ dans les examens
};
```

**Sections disponibles** : `identite`, `motifs`, `antecedents`, `hdm`, `abcde`, `examen`, `examens_complementaires`, `synthese`, `orientation`.
Sans `apres`, le groupe est placé à la fin de la section (dans `examen`, avant « Autres appareils » ; avec `position: "debut"`, au début).

---

## Les types de champs

| type | Saisie | Exemple |
|---|---|---|
| `choix` | gros boutons, une seule réponse | mode d'installation |
| `multi` | puces, plusieurs réponses (`exclusif: true` pour « Aucun ») | signes associés |
| `nombre` | pavé numérique (`unite`, `decimales`, `bornes`) | FC, glycémie |
| `pa` | PAS / PAD (`id_pas`, `id_pad`) | pression artérielle |
| `paire` | droite / gauche | pupilles |
| `heure` | date et heure + « Maintenant » | heure de début |
| `date` | date | DDR |
| `texte` / `texte_long` | clavier (dictée possible) | précisions |
| `curseur` | réglette 0–10 | douleur |
| `calcul` | valeur calculée (`formule: "a / b * 100"`) | DEP en % |
| `score` | score à items avec points, total et classes | Silverman |
| `criteres` | liste de critères (pré-cochés par `auto`) | Vittel |
| `synthese` | résumé d'une série de fenêtres (`champs: [...]`) : une phrase courte si tout est négatif, sinon seules les fenêtres positives (option `anormal`) sont détaillées | eFAST |
| `geste` | bouton qui ouvre « + Geste » prérempli | « Noter l'IOT » |
| `info` | encadré d'information (`alerte: true` = rouge) | rappel |

### Exemple de champ `choix`

```js
{
  id: "cv_type",
  type: "choix",
  label: "Type de crise",
  cle: true,                                     // compte dans la progression
  options: [
    { v: "gtc", label: "Tonico-clonique généralisée", texte: "crise tonico-clonique généralisée" },
    { v: "focale", label: "Focale", texte: "crise focale", anormal: true },
  ],
  phrase: "{valeur}",                            // phrase écrite dans l'observation
},
```

- `label` : ce que tu vois sur le bouton.
- `texte` : ce qui est écrit dans l'observation.
- `anormal: true` : l'élément est mis en évidence (gras rouge, ⚠ dans le texte copié).

### Exemple de champ `nombre` avec normes

```js
{ id: "cv_duree", type: "nombre", label: "Durée de la crise", unite: "min", decimales: 0,
  bornes: [null, 5],                             // au-delà de 5 min : rouge
  phrase: "crise d'une durée de {valeur} min" },
```

`bornes` accepte des nombres, ou des noms de normes qui dépendent de l'âge : `["fc_min", "fc_max"]`, `["pas_min", "pas_max"]`, `["spo2_min", null]`, `["gly_min", "gly_max"]`…

---

## Faire apparaître une question seulement si… (`si`)

Ajoute `si: "condition"` à un champ, à une option ou à un groupe.

| Condition | Signification |
|---|---|
| `age_ans < 15` | enfant |
| `age_mois < 18` | moins de 18 mois |
| `sexe == 'F' && age_ans >= 12` | fille ou femme de 12 ans ou plus |
| `motif('polytraumatisme')` | motif coché |
| `cv_type == 'focale'` | réponse donnée à un choix |
| `coche('lutte', 'tirage_ic')` | option cochée dans un choix multiple |
| `vide('glycemie')` / `rempli('glycemie')` | champ vide / rempli |
| `dans(arrivee, 'samu', 'pc')` | valeur parmi une liste |
| `gcs <= 8`, `pas < pas_min`, `temp >= 38` | valeurs et normes calculées |
| `geste('iot')` | un geste « IOT » a été noté |
| `!condition`, `a && b`, `a \|\| b`, `( … )` | non, et, ou, parenthèses |

**Variables calculées utilisables** : `age_ans`, `age_mois`, `age_jours`, `tranche` (`nouveau_ne`, `nourrisson`, `enfant`, `adulte`, `sujet_age`), `pediatrique`, `femme_procreer`, `gcs`, `pam`, `index_choc`, `pf_ratio`, `trou_anionique`, `poids_apls`, les normes de l'âge (`fc_min`, `fc_max`, `fr_min`, `fr_max`, `pas_min`, `spo2_min`, `gly_min`…), et les drapeaux de `config/normes.js` (`trauma`, `instabilite`, `detresse_respiratoire`, `trouble_conscience`, `plaie`).

---

## Écrire les phrases

Dans `phrase`, `texte` ou les modèles :

| Syntaxe | Effet |
|---|---|
| `{valeur}` | la réponse de ce champ |
| `{autre_champ}` | la réponse d'un autre champ |
| `{delai:cv_debut}` | délai entre cette heure et l'admission (« 50 min ») |
| `[ … ]` | partie supprimée si une donnée qu'elle contient manque |
| `{e}` | accord féminin (admis{e} → admise) |
| `{Le_patient}` | Le patient / La patiente / L'enfant / Le nourrisson |
| `{es}` | accord avec ce nom (« Le nourrisson … trouvé{es} » reste masculin) |

Exemple : `"crise[ d'une durée de {cv_duree} min][ ({cv_type})]"`.

Un champ qui sert seulement à compléter la phrase d'un autre champ prend `sortie: false`.

---

## Bouton « Normal » d'un groupe

```js
normal: {
  label: "Normal",                              // texte du bouton (optionnel)
  valeurs: { cv_conscience: "normale" },        // réponses mises par le bouton
  autorises: ["cv_duree"],                      // champs chiffrés acceptés dans l'état « normal »
  phrase: "Reprise d'une conscience normale[, crise de {cv_duree} min].",
},
```

---

## Scores et critères

```js
{
  type: "score", id: "mon_score", label: "Mon score", max: 6,
  anormal_si: "total >= 3",
  phrase: "mon score à {total}/6[ ({classe})]",
  classes: [ { min: 0, max: 2, texte: "faible" }, { min: 3, texte: "élevé" } ],
  items: [
    { id: "ms_a", label: "Critère A", points: 2, auto: "fc > 120" },       // case pré-cochée si vrai
    { id: "ms_b", label: "Item B", options: [                               // item à plusieurs niveaux
        { v: "0", label: "0 — absent", points: 0 },
        { v: "2", label: "2 — présent", points: 2 } ] },
  ],
}
```

Pour une liste de critères sans total (comme Vittel), utilise `type: "criteres"` et `phrase: "… : {liste}"`.

---

## Autres fichiers modifiables

| Fichier | Contenu |
|---|---|
| `config/modele_observation.js` | plan, titres et phrases de liaison de l'observation générée |
| `config/normes.js` | normes des constantes par âge, seuils, poids estimé, drapeaux |
| `config/normes_bio.js` | valeurs biologiques de référence et unités |
| `config/gravite.js` | critères de gravité généraux de la synthèse |
| `config/checklist.js` | rappels anti-oubli du tronc commun |
| `config/gestes.js`, `config/medicaments.js` | gestes et médicaments proposés |
| `config/sections/*.js` | questions du tronc commun |
| `config/app.js` | délai de suppression automatique, thème par défaut |
