// Anti-oubli, progression, suggestions de modules.

import * as C from "./champs.js";
import { evaluer } from "./expr.js";

export function verifierChecklist(dossier) {
  const ctx = dossier.ctx;
  const regles = [...dossier.R.checklist, ...dossier.modulesActifs().flatMap((m) => m.checklist || [])];
  return regles.filter((r) => !!evaluer(r.si, ctx));
}

export function progression(dossier) {
  const ctx = dossier.ctx;
  const parSection = {};
  let faits = 0;
  let total = 0;
  for (const s of dossier.form.sections) {
    let f = 0;
    let t = 0;
    let ano = false;
    if (!s.si || evaluer(s.si, ctx)) {
      for (const g of s.groupes || []) {
        if (!C.groupeVisible(g, ctx)) continue;
        for (const c of g.champs || []) {
          if (!C.visible(c, ctx)) continue;
          const r = C.rempli(c, ctx);
          if (c.cle) {
            t++;
            if (r) f++;
          }
          if (r && c.type !== "criteres" && C.anormal(c, ctx)) ano = true;
        }
      }
    }
    parSection[s.id] = { faits: f, total: t, anomalie: ano };
    faits += f;
    total += t;
  }
  return { faits, total, pourcent: total ? Math.round((100 * faits) / total) : 0, parSection };
}

export function suggestionsActives(dossier) {
  const ctx = dossier.ctx;
  const ignorees = new Set(dossier.patient.sugg_ignorees || []);
  const actifs = new Set(dossier.patient.v.motifs || []);
  const regles = [...dossier.R.suggestions, ...dossier.modulesActifs().flatMap((m) => m.suggestions || [])];
  const vues = new Set();
  const l = [];
  for (const r of regles) {
    const m = dossier.R.motifs[r.module];
    if (!m || actifs.has(r.module) || ignorees.has(r.module) || vues.has(r.module)) continue;
    if (!evaluer(r.si, ctx)) continue;
    vues.add(r.module);
    l.push({ module: r.module, titre: m.titre, icone: m.icone, message: r.message });
  }
  return l;
}
