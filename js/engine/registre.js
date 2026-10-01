// Chargement des fichiers de configuration et construction du formulaire d'un patient
// (tronc commun + groupes ajoutés par les modules de ses motifs).

import app from "../../config/app.js";
import normes from "../../config/normes.js";
import normesBio from "../../config/normes_bio.js";
import modele from "../../config/modele_observation.js";
import checklist from "../../config/checklist.js";
import suggestions from "../../config/suggestions.js";
import gestes from "../../config/gestes.js";
import medicaments from "../../config/medicaments.js";
import demo from "../../config/demo.js";
import sections from "../../config/sections/index.js";
import motifs from "../../config/motifs/index.js";
import { creerDerives } from "./derive.js";

function annoterGroupe(g, sectionDef) {
  g._sectionDef = sectionDef;
  for (const c of g.champs || []) {
    c._groupe = g;
    for (const it of c.items || []) it._score = c;
  }
}

export function chargerRegistre() {
  const sectionsParId = {};
  for (const s of sections) {
    sectionsParId[s.id] = s;
    for (const g of s.groupes || []) annoterGroupe(g, s);
  }
  const motifsParId = {};
  for (const m of motifs) {
    motifsParId[m.id] = m;
    for (const g of m.groupes || []) {
      const s = sectionsParId[g.section];
      if (!s) console.warn(`Motif « ${m.id} » : section inconnue « ${g.section} »`);
      annoterGroupe(g, s);
      g._module = m.id;
    }
  }
  const tousGroupes = [...sections.flatMap((s) => s.groupes || []), ...motifs.flatMap((m) => m.groupes || [])];
  const paires = [];
  for (const g of tousGroupes) for (const c of g.champs || []) if (c.type === "paire") paires.push(c);

  const gestesIndex = {};
  for (const cat of gestes.categories) {
    for (const it of cat.items) {
      it._categorie = cat;
      gestesIndex[it.id] = it;
    }
  }

  const R = {
    app,
    normes,
    normesBio,
    modele,
    checklist,
    suggestions,
    gestes,
    gestesIndex,
    medicaments,
    demo,
    sections,
    sectionsParId,
    motifs: motifsParId,
    listeMotifs: motifs,
    derives: creerDerives(normes, paires),
  };
  verifierIdentifiants(tousGroupes);
  return R;
}

// Signale dans la console les identifiants en double (erreur fréquente en éditant un motif)
function verifierIdentifiants(groupes) {
  const vus = new Map();
  for (const g of groupes) {
    for (const c of g.champs || []) {
      const ids = [c.id, ...(c.items || []).map((i) => i.id)].filter(Boolean);
      for (const id of ids) {
        if (vus.has(id) && !c.si && !vus.get(id).si) console.warn(`Identifiant en double : « ${id} » (groupes ${vus.get(id).g} et ${g.id})`);
        vus.set(id, { g: g.id, si: c.si });
      }
    }
  }
}

export function construireFormulaire(patient, R) {
  const actifs = (patient.v.motifs || []).map((id) => R.motifs[id]).filter(Boolean);
  const secs = R.sections.map((s) => ({ ...s, groupes: [...(s.groupes || [])] }));
  const parId = Object.fromEntries(secs.map((s) => [s.id, s]));
  for (const m of actifs) {
    for (const g of m.groupes || []) {
      const s = parId[g.section];
      if (!s) continue;
      let i;
      if (g.apres) {
        i = s.groupes.findIndex((x) => x.id === g.apres);
        if (i < 0) i = s.groupes.length;
        else {
          i++;
          while (i < s.groupes.length && s.groupes[i]._module && s.groupes[i].apres === g.apres) i++;
        }
      } else if (g.position === "debut") {
        i = 0;
        while (i < s.groupes.length && s.groupes[i]._module && s.groupes[i].position === "debut") i++;
      } else {
        i = s.groupes.findIndex((x) => x.fin);
        if (i < 0) i = s.groupes.length;
      }
      s.groupes.splice(i, 0, g);
    }
  }
  const index = { champs: {}, scores: {}, items: {} };
  for (const s of secs) {
    for (const g of s.groupes) {
      for (const c of g.champs || []) {
        if (c.id) (index.champs[c.id] ||= []).push(c);
        if (c.type === "score" || c.type === "criteres") {
          index.scores[c.id] = c;
          for (const it of c.items) index.items[it.id] = it;
        }
      }
    }
  }
  return { sections: secs, index };
}
