// Feuilles de saisie rapide : « + Geste », « Réévaluer ».

import { h, ouvrirFeuille, confirmer, toast } from "./dom.js";
import { rendreChamp } from "./widgets.js";
import * as T from "../engine/texte.js";
import * as C from "../engine/champs.js";
import { contexteLocal } from "../engine/contexte.js";
import { texteGeste, texteReevaluation } from "../engine/generateur.js";
import * as S from "../store.js";
import { nouvelId } from "../store.js";

// Petit formulaire indépendant (valeurs locales), rendu avec les mêmes widgets que le dossier
function formulaireLocal(dossier, defs, valeurs, surChangement) {
  let liaisons = [];
  const env = {
    val: (id) => valeurs[id],
    ecrire(id, v) {
      if (C.estVide(v)) delete valeurs[id];
      else valeurs[id] = v;
      majDiff();
    },
    ecrireLot(lot) {
      for (const [k, v] of Object.entries(lot)) {
        if (C.estVide(v)) delete valeurs[k];
        else valeurs[k] = v;
      }
      maj();
    },
    ctx: () => contexteLocal(dossier, defs, valeurs),
    lier: (f) => liaisons.push(f),
    geste: () => {},
    gestes: () => dossier.patient.gestes || [],
  };
  const maj = () => {
    const ctx = env.ctx();
    for (const f of liaisons) f(ctx);
    if (surChangement) surChangement();
  };
  let t;
  const majDiff = () => {
    clearTimeout(t);
    t = setTimeout(maj, 150);
  };
  const el = h("div", { class: "form-local" }, defs.map((d) => rendreChamp(d, env, { local: true })));
  return { el, maj };
}

function champHeure(valeurs) {
  const liaisons = [];
  const ctx = { val: (id) => valeurs[id], get: () => undefined };
  const env = {
    val: (id) => valeurs[id],
    ecrire: (id, v) => {
      valeurs[id] = v;
      maj();
    },
    ecrireLot: () => {},
    ctx: () => ctx,
    lier: (f) => liaisons.push(f),
  };
  const el = rendreChamp({ id: "heure", type: "heure", label: "Heure du geste" }, env, { local: true });
  const maj = () => liaisons.forEach((f) => f(ctx));
  return { el, maj };
}

// ---------------------------------------------------------------- + Geste
export function ouvrirGeste(dossier, { item, preset, geste, surEnregistrer } = {}) {
  const R = dossier.R;
  const f = ouvrirFeuille({ titre: geste ? "Modifier le geste" : "Ajouter un geste", classe: "feuille-haute" });

  function etapeCategories() {
    f.titre("Ajouter un geste");
    f.corps.replaceChildren();
    f.pied.replaceChildren();
    const favoris = dossier.gestesFavoris();
    if (favoris.length) {
      f.corps.append(
        h("div", { class: "opt-groupe" }, "Fréquents pour ce patient"),
        h(
          "div",
          { class: "tuiles" },
          favoris.map((fav) =>
            h("button", { type: "button", class: "tuile", onclick: () => etapeDetails(R.gestesIndex[fav.item], { ...(fav.preset || {}) }) }, fav.label),
          ),
        ),
      );
    }
    f.corps.append(
      h("div", { class: "opt-groupe" }, "Catégories"),
      h(
        "div",
        { class: "tuiles" },
        R.gestes.categories.map((cat) =>
          h(
            "button",
            {
              type: "button",
              class: "tuile",
              onclick: () => (cat.items.length === 1 ? etapeDetails(cat.items[0], {}) : etapeItems(cat)),
            },
            h("span", { class: "tuile-icone" }, cat.icone),
            cat.label,
          ),
        ),
      ),
    );
  }

  function etapeItems(cat) {
    f.titre(cat.label);
    f.corps.replaceChildren(
      h(
        "div",
        { class: "tuiles" },
        cat.items.map((it) => h("button", { type: "button", class: "tuile", onclick: () => etapeDetails(it, {}) }, it.label)),
      ),
    );
    f.pied.replaceChildren(h("button", { type: "button", class: "btn", onclick: etapeCategories }, "← Catégories"));
  }

  function etapeDetails(def, valeursInit, heureInit, existant) {
    f.titre(def.label);
    const valeurs = { ...valeursInit };
    const temps = { heure: heureInit ?? T.dtLocal() };
    const apercu = h("div", { class: "apercu" });
    const majApercu = () => {
      const t = texteGeste({ item: def.id, heure: temps.heure, d: valeurs }, dossier);
      apercu.textContent = t ? `Aperçu : ${T.versTexte(T.majuscule(t))}.` : "";
    };
    const form = formulaireLocal(dossier, [...(def.champs || []), { id: "commentaire", type: "texte", label: "Commentaire (optionnel)" }], valeurs, majApercu);
    const heure = champHeure(temps);
    f.corps.replaceChildren(heure.el, form.el, apercu);
    heure.maj();
    form.maj();
    majApercu();
    const enregistrer = () => {
      const p = dossier.patient;
      p.gestes = p.gestes || [];
      if (existant) {
        existant.heure = temps.heure;
        existant.d = valeurs;
      } else p.gestes.push({ id: nouvelId(), item: def.id, heure: temps.heure, d: valeurs });
      S.ecrire(p);
      f.fermer();
      toast("Geste enregistré");
      if (surEnregistrer) surEnregistrer();
    };
    f.pied.replaceChildren(
      existant
        ? h(
            "button",
            {
              type: "button",
              class: "btn btn-danger",
              onclick: async () => {
                if (!(await confirmer("Supprimer ce geste ?", { ok: "Supprimer", danger: true }))) return;
                const p = dossier.patient;
                p.gestes = (p.gestes || []).filter((g) => g !== existant);
                S.ecrire(p);
                f.fermer();
                if (surEnregistrer) surEnregistrer();
              },
            },
            "Supprimer",
          )
        : h("button", { type: "button", class: "btn", onclick: etapeCategories }, "← Retour"),
      h("button", { type: "button", class: "btn btn-primaire", onclick: enregistrer }, "Enregistrer"),
    );
  }

  if (geste) etapeDetails(R.gestesIndex[geste.item], geste.d || {}, geste.heure, geste);
  else if (item && R.gestesIndex[item]) etapeDetails(R.gestesIndex[item], { ...(preset || {}) });
  else etapeCategories();
  return f;
}

// ---------------------------------------------------------------- Réévaluer
export function ouvrirReevaluation(dossier, { reeval, surEnregistrer } = {}) {
  const defs = dossier.R.sectionsParId.reevaluation.champs;
  const f = ouvrirFeuille({ titre: reeval ? "Modifier la réévaluation" : "Réévaluation", classe: "feuille-haute" });
  const valeurs = reeval ? { ...reeval } : { heure: T.dtLocal() };
  delete valeurs.id;
  const apercu = h("div", { class: "apercu" });
  const majApercu = () => {
    apercu.textContent = "Aperçu : " + T.versTexte(texteReevaluation(valeurs, dossier));
  };
  const form = formulaireLocal(dossier, defs, valeurs, majApercu);
  f.corps.replaceChildren(form.el, apercu);
  form.maj();
  majApercu();
  const enregistrer = () => {
    const p = dossier.patient;
    p.reevals = p.reevals || [];
    if (reeval) Object.assign(reeval, valeurs);
    else p.reevals.push({ id: nouvelId(), ...valeurs });
    S.ecrire(p);
    f.fermer();
    toast("Réévaluation enregistrée");
    if (surEnregistrer) surEnregistrer();
  };
  f.pied.append(
    reeval
      ? h(
          "button",
          {
            type: "button",
            class: "btn btn-danger",
            onclick: async () => {
              if (!(await confirmer("Supprimer cette réévaluation ?", { ok: "Supprimer", danger: true }))) return;
              const p = dossier.patient;
              p.reevals = (p.reevals || []).filter((r) => r !== reeval);
              S.ecrire(p);
              f.fermer();
              if (surEnregistrer) surEnregistrer();
            },
          },
          "Supprimer",
        )
      : h("button", { type: "button", class: "btn", onclick: () => f.fermer() }, "Annuler"),
    h("button", { type: "button", class: "btn btn-primaire", onclick: enregistrer }, "Enregistrer"),
  );
  return f;
}
