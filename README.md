# Observation Déchocage — V1

Application web installable (PWA) qui aide à rédiger une observation médicale de déchocage complète, en français, à partir de saisies rapides. Elle fonctionne **hors ligne** et garde **toutes les données sur le téléphone**.

- **Formulaire adaptatif** : l'âge, le sexe, les motifs et les réponses font apparaître ou disparaître les questions (pédiatrie, grossesse, sujet âgé, trauma, GCS ≤ 8, instabilité…).
- **Tronc commun complet** : identité, motifs, antécédents, histoire, ABCDE avec boutons « Normal », examen, examens complémentaires, gestes horodatés, réévaluations, synthèse, orientation.
- **3 modules en V1** : polytraumatisme, dyspnée / détresse respiratoire, troubles de conscience / coma (plus « autre motif »).
- **Normes selon l'âge** : valeurs hors normes en rouge, et marquées ⚠ dans le texte copié.
- **Anti-oubli** avant la génération, puis **Copier**, **PDF** et **Modifier**.
- **Aucune interprétation** : l'app fait des calculs (PAM, index de choc, scores, mL/kg) mais ne coche jamais d'hypothèse à ta place.

## Documents

- [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) — mise en ligne gratuite (GitHub Pages) et installation sur Android.
- [docs/AJOUTER_UN_MOTIF.md](docs/AJOUTER_UN_MOTIF.md) — ajouter ou modifier un motif, les champs et les phrases.

## Organisation

```
index.html, manifest.webmanifest, sw.js   page, installation, hors ligne
css/app.css                                apparence (sombre / clair)
js/engine/                                 moteur : conditions, calculs, rédaction, checklist
js/ui/                                     écrans et widgets de saisie
config/                                    TOUT le contenu médical (modifiable)
  sections/       tronc commun (une section par fichier)
  motifs/         un fichier par motif + index.js
  scores/         scores réutilisables
  normes.js, normes_bio.js, gravite.js, checklist.js, gestes.js, medicaments.js
  modele_observation.js   plan et phrases de l'observation générée
docs/                                      guides
```

Aucun outil à installer : on modifie un fichier et on le remet en ligne tel quel.
