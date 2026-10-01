// Rédaction de l'observation à partir des saisies, selon config/modele_observation.js.
// L'application met en forme les données : elle n'ajoute aucune information.

import * as C from "./champs.js";
import * as T from "./texte.js";
import { evaluer } from "./expr.js";
import { contexteLocal } from "./contexte.js";

const accordeur = (ctx) => (t) => T.accorder(t, ctx.get("sexe"), ctx.get("tranche"));

export function generer(dossier) {
  const ctx = dossier.rafraichir();
  const M = dossier.R.modele;
  const acc = accordeur(ctx);
  const sections = [];
  for (const s of M.sections) {
    let paras = [];
    if (s.source === "gestes") paras = lignesGestes(dossier, ctx);
    else if (s.source === "reevaluation") paras = lignesReevaluations(dossier, ctx);
    else {
      const sec = dossier.form.sections.find((x) => x.id === s.source);
      if (!sec || (sec.si && !evaluer(sec.si, ctx))) continue;
      for (const g of sec.groupes) {
        const p = C.composerGroupe(g, ctx);
        if (p) paras.push(p);
      }
    }
    paras = paras.map(acc).filter((p) => T.sansMarques(p).trim());
    if (paras.length) sections.push({ titre: s.titre, paragraphes: paras });
  }
  const maintenant = new Date();
  const extra = { date_redaction: T.dateTexte(maintenant), heure_redaction: T.heureTexte(maintenant) };
  const sousTitre = acc(T.rendre(M.sous_titre || "", (n) => C.resoudreNom(n, ctx, undefined, extra)));
  return { titre: M.titre, sousTitre, sections };
}

export function versTexteBrut(obs) {
  const l = [obs.titre.toUpperCase()];
  if (obs.sousTitre) l.push(obs.sousTitre);
  for (const s of obs.sections) {
    l.push("", s.titre.toUpperCase());
    for (const p of s.paragraphes) l.push(T.versTexte(p));
  }
  return l.join("\n");
}

// ---------- Gestes horodatés ----------
function quand(heure, ctx, M) {
  const d = T.parseDT(heure);
  if (!d) return "";
  const adm = C.admission(ctx);
  return !adm || T.memeJour(d, adm)
    ? T.rendre(M.quand_meme_jour ?? "À {heure}", () => T.heureTexte(d))
    : T.rendre(M.quand_autre_jour ?? "Le {date} à {heure}", (n) => (n === "date" ? T.dateTexte(d) : T.heureTexte(d)));
}

export function trierParHeure(liste) {
  return [...(liste || [])].sort((a, b) => String(a.heure || "").localeCompare(String(b.heure || "")));
}

export function texteGeste(g, dossier) {
  const item = dossier.R.gestesIndex[g.item];
  if (!item) return g.d?.libre || "";
  const lctx = contexteLocal(dossier, item.champs || [], g.d || {});
  const extra = { par_kg: () => parKg(item, lctx, dossier), delai_ref: () => delaiReference(item, g, lctx, dossier) };
  const res = (n) => C.resoudreNom(n, lctx, undefined, extra);
  let t = T.rendre(item.texte, res);
  const details = (item.details || []).map((x) => T.rendre(`[${x}]`, res)).filter((x) => T.sansMarques(x).trim());
  if (details.length) t += ` (${details.join(", ")})`;
  if (g.d?.commentaire) t += ` — ${String(g.d.commentaire).trim()}`;
  return T.accorder(t, dossier.ctx.get("sexe"), dossier.ctx.get("tranche"));
}

const UNITES_PAR_KG = new Set(["mg", "g", "µg", "UI", "mL", "mmol"]);
function parKg(item, lctx, dossier) {
  if (!item.par_kg) return "";
  const v = lctx.val(item.par_kg.valeur);
  const unite = item.par_kg.unite_fixe ?? lctx.val(item.par_kg.unite);
  const poids = dossier.patient.v.poids;
  if (typeof v !== "number" || !poids || !UNITES_PAR_KG.has(unite)) return "";
  let x = v / poids;
  let u = unite;
  const plusPetite = { g: "mg", mg: "µg" };
  while (x < 1 && plusPetite[u]) {
    x *= 1000;
    u = plusPetite[u];
  }
  return `soit ${T.nombre(x, x < 1 ? 2 : 1)} ${u}/kg`;
}

function delaiReference(item, g, lctx, dossier) {
  const def = lctx.champ("medicament");
  const o = def ? C.optionChoisie(def, lctx) : null;
  const ref = o?.delai_depuis;
  if (!ref) return "";
  const debut = T.parseDT(dossier.patient.v[ref.champ]);
  const m = T.minutesEntre(debut, T.parseDT(g.heure));
  if (m === undefined || m < 0) return "";
  return T.rendre(ref.texte, () => T.duree(m));
}

function lignesGestes(dossier, ctx) {
  const M = dossier.R.modele;
  return trierParHeure(dossier.patient.gestes).map((g) => {
    const res = (n) => (n === "quand" ? quand(g.heure, ctx, M) : n === "texte" ? texteGeste(g, dossier) : "");
    return T.majuscule(T.rendre(M.gestes.ligne, res));
  });
}

// ---------- Réévaluations ----------
const HORS_CONSTANTES = new Set(["heure", "evolution", "commentaire"]);

export function texteReevaluation(r, dossier) {
  const M = dossier.R.modele;
  const ctx = dossier.ctx;
  const champs = dossier.R.sectionsParId.reevaluation.champs;
  const lctx = contexteLocal(dossier, champs, r);
  const constantes = champs
    .filter((c) => !HORS_CONSTANTES.has(c.id))
    .map((c) => C.fragment(c, lctx))
    .filter(Boolean)
    .join(", ");
  const adm = C.admission(ctx);
  const m = T.minutesEntre(adm, T.parseDT(r.heure));
  const extra = {
    quand: () => quand(r.heure, ctx, M).replace(/^À /, "à ").replace(/^Le /, "le "),
    delai: () => (m !== undefined && m >= 0 ? T.duree(m) : ""),
    constantes,
    evolution: () => {
      const def = champs.find((c) => c.id === "evolution");
      return def ? C.texteValeur(def, lctx) : "";
    },
    commentaire: () => (r.commentaire ? String(r.commentaire).trim() : ""),
  };
  const t = T.rendre(M.reevaluation.ligne, (n) => C.resoudreNom(n, lctx, undefined, extra));
  return T.accorder(T.phrases(t), ctx.get("sexe"), ctx.get("tranche"));
}

function lignesReevaluations(dossier) {
  return trierParHeure(dossier.patient.reevals).map((r) => texteReevaluation(r, dossier));
}

// ---------- Brouillon de synthèse ----------
export function brouillonResume(ctx) {
  const d = ctx.d;
  const M = d.R.modele;
  const extra = {
    atcd: () => resumeAntecedents(ctx, M),
    motifs: () => {
      const def = ctx.champ("motifs");
      return def ? C.texteValeur(def, ctx) : "";
    },
    anomalies: () => anomaliesInitiales(ctx),
    gestes: () => gestesMajeurs(d),
  };
  const t = T.rendre(M.resume, (n) => C.resoudreNom(n, ctx, undefined, extra));
  return T.sansMarques(T.accorder(T.phrases(t), ctx.get("sexe"), ctx.get("tranche")));
}

function resumeAntecedents(ctx, M) {
  const def = ctx.champ("atcd_med");
  if (!def || !C.rempli(def, ctx)) return "";
  const v = ctx.val("atcd_med") || [];
  if (v.length === 1 && v[0] === "aucun" && !ctx.val("atcd_med_autre")) return M.resume_atcd.aucun;
  return T.rendre(M.resume_atcd.liste, () => C.texteValeur(def, ctx));
}

function anomaliesInitiales(ctx) {
  const sec = ctx.d.form.sections.find((s) => s.id === "abcde");
  if (!sec) return "";
  const l = [];
  for (const g of sec.groupes) {
    if (!C.groupeVisible(g, ctx)) continue;
    for (const c of g.champs) {
      if (!c.resume || !C.visible(c, ctx) || !C.rempli(c, ctx) || !C.anormal(c, ctx)) continue;
      const t = c.resume === true ? C.fragment(c, ctx, true) : T.rendre(c.resume, (n) => C.resoudreNom(n, ctx, C.texteValeur(c, ctx)));
      if (t) l.push(T.sansMarques(t));
    }
  }
  return T.listeFr(l);
}

function gestesMajeurs(d) {
  const vus = new Set();
  const l = [];
  for (const g of trierParHeure(d.patient.gestes)) {
    const item = d.R.gestesIndex[g.item];
    if (!item) continue;
    let nom = null;
    if (item.id === "medicament") {
      const med = d.R.medicaments.find((m) => m.id === g.d?.medicament);
      if (med?.majeur) nom = med.nom;
    } else if (item.majeur) nom = item.court ?? T.minuscule1(item.label);
    if (nom && !vus.has(nom)) {
      vus.add(nom);
      l.push(nom);
    }
  }
  return T.listeFr(l);
}
