// Logique des champs : visibilité, valeur, anomalie, texte, phrase, scores.
// Fonctions pures : elles reçoivent la définition du champ (config) et un contexte.

import { evaluer } from "./expr.js";
import * as T from "./texte.js";

export const estVide = (v) =>
  v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v)) ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.values(v).every(estVide));

export function egalProfond(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x) => b.includes(x));
  if (a && b && typeof a === "object" && typeof b === "object") {
    const k = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...k].every((x) => egalProfond(a[x], b[x]));
  }
  if (estVide(a) && estVide(b)) return true;
  return String(a) === String(b);
}

const SANS_VALEUR = new Set(["info", "geste"]);

// Fenêtres d'un examen (ex. eFAST) : positives (option anormale), non contributives (option nc), négatives
function classerFenetres(def, ctx) {
  const pos = [];
  const neg = [];
  const nc = [];
  let total = 0;
  for (const id of def.champs) {
    const f = ctx.champ(id);
    if (!f || !visible(f, ctx)) continue;
    total++;
    const o = optionChoisie(f, ctx);
    if (!o) continue;
    const nom = f.court ?? T.minuscule1(f.label);
    if (o.nc) nc.push(nom);
    else if (o.anormal) pos.push(texteOption(o, ctx));
    else neg.push(nom);
  }
  return { pos, neg, nc, total, complet: pos.length + neg.length + nc.length === total };
}

// ---------- Visibilité ----------
export function groupeVisible(g, ctx) {
  if (!g) return true;
  const sec = g._sectionDef;
  if (sec && sec.si && !evaluer(sec.si, ctx)) return false;
  return g.si ? !!evaluer(g.si, ctx) : true;
}

export function visible(def, ctx) {
  const memo = ctx.vis;
  if (memo && memo.has(def)) return memo.get(def);
  const r = groupeVisible(def._groupe, ctx) && (def.si ? !!evaluer(def.si, ctx) : true);
  if (memo) memo.set(def, r);
  return r;
}

// ---------- Options ----------
export function options(def, ctx) {
  return def.options_de ? ctx.d.optionsDynamiques(def.options_de) : def.options || [];
}
export const optionVisible = (o, ctx) => !o.si || !!evaluer(o.si, ctx);

export function optionChoisie(def, ctx) {
  const v = ctx.val(def.id);
  if (estVide(v)) return null;
  const o = options(def, ctx).find((x) => String(x.v) === String(v));
  return o && optionVisible(o, ctx) ? o : null;
}

export function optionsChoisies(def, ctx) {
  const v = ctx.val(def.id);
  if (!Array.isArray(v)) return [];
  return options(def, ctx).filter((o) => v.includes(o.v) && optionVisible(o, ctx));
}

export function texteOption(o, ctx) {
  const brut = ctx.get("sexe") === "F" && o.texte_f !== undefined ? o.texte_f : o.texte ?? T.minuscule1(o.label);
  return T.rendre(brut, (n) => resoudreNom(n, ctx));
}

// ---------- Valeurs ----------
export function valeurCalcul(def, ctx) {
  if (def.formule) {
    const r = evaluer(def.formule, ctx);
    return typeof r === "number" && Number.isFinite(r) ? r : undefined;
  }
  const r = ctx.get(def.var ?? def.id);
  return r === null || (typeof r === "number" && !Number.isFinite(r)) ? undefined : r;
}

export function rempli(def, ctx) {
  switch (def.type) {
    case "pa":
      return !estVide(ctx.val(def.id_pas));
    case "calcul":
      return !estVide(valeurCalcul(def, ctx));
    case "score":
      return calculerScore(def, ctx).engage;
    case "criteres":
      return calculerScore(def, ctx).positifs.length > 0;
    case "multi":
      return optionsChoisies(def, ctx).length > 0 || (!!def.autre && !estVide(ctx.val(def.id + "_autre")));
    case "choix":
      return !!optionChoisie(def, ctx);
    case "info":
    case "geste":
      return false;
    case "synthese": {
      const r = classerFenetres(def, ctx);
      return r.pos.length + r.neg.length + r.nc.length > 0;
    }
    case "resume":
      return !estVide(ctx.val(def.id)) || !!ctx.d.brouillonResume?.(ctx);
    default:
      return !estVide(ctx.val(def.id));
  }
}

// ---------- Anomalies ----------
export function bornesDe(def, ctx, cle = "bornes") {
  const b = def[cle];
  if (!b) return null;
  return b.map((x) => (typeof x === "string" ? ctx.get(x) : x));
}

// -1 trop bas, +1 trop haut, 2 anormal (règle anormal_si), 0 normal
export function sensAnomalie(def, v, ctx, cle = "bornes") {
  if (estVide(v)) return 0;
  const b = bornesDe(def, ctx, cle);
  if (b) {
    if (!estVide(b[0]) && v < b[0]) return -1;
    if (!estVide(b[1]) && v > b[1]) return 1;
  }
  if (def.anormal_si && evaluer(def.anormal_si, ctx.avec({ valeur: v }))) return 2;
  return 0;
}

export function anormal(def, ctx) {
  switch (def.type) {
    case "nombre":
    case "curseur":
      return sensAnomalie(def, ctx.val(def.id), ctx) !== 0;
    case "calcul":
      return sensAnomalie(def, valeurCalcul(def, ctx), ctx) !== 0;
    case "pa": {
      const vs = ctx.val(def.id_pas), vd = ctx.val(def.id_pad);
      const s = sensAnomalie(def, vs, ctx, "bornes_pas");
      const d = sensAnomalie(def, vd, ctx, "bornes_pad");
      const pam = typeof vs === "number" && typeof vd === "number" ? Math.round((vs + 2 * vd) / 3) : undefined;
      const pamMin = ctx.get("pam_min");
      return s !== 0 || d !== 0 || (pam !== undefined && !estVide(pamMin) && pam < pamMin);
    }
    case "choix":
      return !!optionChoisie(def, ctx)?.anormal;
    case "multi":
      return optionsChoisies(def, ctx).some((o) => o.anormal);
    case "paire":
      return !!ctx.get(def.id + "_anormal");
    case "synthese":
      return classerFenetres(def, ctx).pos.length > 0;
    case "score": {
      if (!def.anormal_si) return false;
      const sc = calculerScore(def, ctx);
      return sc.engage && !!evaluer(def.anormal_si, ctx.avec({ total: sc.total }));
    }
    default:
      return false;
  }
}

// ---------- Texte des valeurs ----------
function formaterVar(v, dec = 2) {
  if (v === undefined || v === null || typeof v === "boolean") return "";
  if (typeof v === "number") return T.nombre(v, dec);
  if (Array.isArray(v)) return T.listeFr(v.map(String));
  return String(v);
}

export function admission(ctx) {
  return T.parseDT(ctx.d.patient.v.admission);
}

export function delaiAdmission(id, ctx) {
  const d = T.parseDT(ctx.val(id));
  const a = admission(ctx);
  const m = T.minutesEntre(d, a);
  if (m === undefined || m < 0) return "";
  return T.duree(m);
}

function textePaire(def, ctx) {
  const v = ctx.val(def.id) || {};
  const os = options(def, ctx);
  const od = os.find((o) => o.v === v.d);
  const og = os.find((o) => o.v === v.g);
  if (!od && !og) return "";
  if (od && og && od.v === og.v) return T.rendre(od.texte_bilateral ?? texteOption(od, ctx), (n) => resoudreNom(n, ctx));
  const res = (n) => {
    if (n === "d") return od ? texteOption(od, ctx) : def.non_evalue ?? "non évaluée";
    if (n === "g") return og ? texteOption(og, ctx) : def.non_evalue ?? "non évaluée";
    if (n === "asym") return ctx.get(def.id + "_asym") ? def.texte_asym : "";
    return resoudreNom(n, ctx);
  };
  return T.rendre(def.phrase_asym ?? "à droite {d}, à gauche {g}", res);
}

export function texteValeur(def, ctx) {
  switch (def.type) {
    case "choix": {
      const o = optionChoisie(def, ctx);
      return o ? texteOption(o, ctx) : "";
    }
    case "multi": {
      const items = optionsChoisies(def, ctx).map((o) => texteOption(o, ctx));
      const autre = def.autre ? ctx.val(def.id + "_autre") : "";
      if (autre) items.push(String(autre).trim());
      return T.listeFr(items, def.liaison ?? "et");
    }
    case "nombre":
    case "curseur":
      return formaterVar(ctx.val(def.id), def.decimales ?? 2);
    case "calcul":
      return def.texte_var ? formaterVar(ctx.get(def.texte_var)) : formaterVar(valeurCalcul(def, ctx), def.decimales ?? 2);
    case "pa": {
      const s = ctx.val(def.id_pas), d = ctx.val(def.id_pad);
      if (estVide(s)) return "";
      return estVide(d) ? `${T.nombre(s, 0)}` : `${T.nombre(s, 0)}/${T.nombre(d, 0)}`;
    }
    case "heure":
      return T.heureRelative(ctx.val(def.id), admission(ctx), def.format === "complet");
    case "date": {
      const d = T.parseDT(ctx.val(def.id));
      return d ? T.dateTexte(d) : "";
    }
    case "paire":
      return textePaire(def, ctx);
    case "texte":
    case "texte_long":
      return estVide(ctx.val(def.id)) ? "" : String(ctx.val(def.id)).trim();
    case "resume":
      return estVide(ctx.val(def.id)) ? ctx.d.brouillonResume?.(ctx) ?? "" : String(ctx.val(def.id)).trim();
    default:
      return "";
  }
}

// Résout un nom placé entre accolades dans un modèle de phrase
export function resoudreNom(nom, ctx, valeur, extra) {
  let maj = false;
  let frag = false;
  if (nom[0] === "^") {
    maj = true;
    nom = nom.slice(1);
  }
  if (nom[0] === "@") {
    frag = true;
    nom = nom.slice(1);
  }
  let r;
  if (nom === "valeur" && valeur !== undefined) r = valeur;
  else if (extra && nom in extra) r = typeof extra[nom] === "function" ? extra[nom]() : extra[nom];
  else if (nom.startsWith("delai:")) r = delaiAdmission(nom.slice(6), ctx);
  else {
    const def = ctx.champ(nom);
    if (def) {
      if (!visible(def, ctx) || !rempli(def, ctx)) r = "";
      else r = frag ? fragment(def, ctx, true) : texteValeur(def, ctx);
    } else {
      r = formaterVar(ctx.get(nom));
    }
  }
  if (r && maj) r = T.majuscule(r);
  return r;
}

function phraseParDefaut(def) {
  if (def.type === "nombre" || def.type === "curseur") {
    return `${T.minuscule1(def.label)} à {valeur}${def.unite ? " " + def.unite : ""}`;
  }
  return "{valeur}";
}

// Phrase complète d'un champ (avec marquage d'anomalie), ou null s'il n'y a rien à écrire
export function fragment(def, ctx, ignorerSortie = false) {
  if (!ignorerSortie && def.sortie === false) return null;
  if (SANS_VALEUR.has(def.type)) return null;
  if (!visible(def, ctx) || !rempli(def, ctx)) return null;
  if (def.type === "score") return fragmentScore(def, ctx);
  if (def.type === "criteres") return fragmentCriteres(def, ctx);
  if (def.type === "date" && def.inconnu && ctx.val(def.id) === "inconnue") return def.inconnu;
  if (def.type === "synthese") return fragmentSynthese(def, ctx);

  const valTxt = texteValeur(def, ctx);
  let modele;
  if (def.type === "multi") {
    const os = optionsChoisies(def, ctx);
    if (os.length && os.every((o) => o.exclusif || o.phrase_seule) && !(def.autre && ctx.val(def.id + "_autre"))) modele = "{valeur}";
  }
  if (def.type === "choix" && optionChoisie(def, ctx)?.phrase_seule) modele = "{valeur}";
  if (!modele && (def.phrase_haut || def.phrase_bas || def.phrase_normale)) {
    const s = def.type === "pa" ? sensAnomalie(def, ctx.val(def.id_pas), ctx, "bornes_pas") : sensAnomalie(def, ctx.val(def.id), ctx);
    modele = s < 0 ? def.phrase_bas : s === 1 ? def.phrase_haut : s === 0 ? def.phrase_normale : null;
  }
  modele = modele ?? def.phrase ?? phraseParDefaut(def);
  let t = T.rendre(modele, (n) => resoudreNom(n, ctx, valTxt));
  if (def.precision) {
    const p = ctx.val(def.id + "_precision");
    if (!estVide(p)) t += ` (${String(p).trim()})`;
  }
  if (!T.sansMarques(t).trim()) return null;
  return anormal(def, ctx) ? T.marquer(t) : t;
}

// Toutes négatives → une phrase courte ; sinon seules les fenêtres positives sont détaillées
function fragmentSynthese(def, ctx) {
  const r = classerFenetres(def, ctx);
  const extra = {
    positifs: T.listeFr(r.pos),
    non_contributives: T.listeFr(r.nc),
    negatives_partielles: r.complet ? "" : T.listeFr(r.neg),
    autres_negatives: r.neg.length ? (r.complet ? def.texte_autres_negatives : `${def.texte_negatives_liste} ${T.listeFr(r.neg)}`) : "",
  };
  const modele = r.pos.length ? def.phrase : r.neg.length ? def.phrase_negative : def.phrase_non_contributive;
  const t = T.rendre(modele, (n) => resoudreNom(n, ctx, undefined, extra));
  return r.pos.length ? T.marquer(t) : t;
}

// ---------- Scores et listes de critères ----------
export function etatItem(item, ctx) {
  const v = ctx.val(item.id);
  if (v === true || v === false) return { on: v, auto: false, manuel: true };
  if (item.auto) {
    const a = !!evaluer(item.auto, ctx);
    if (a) return { on: true, auto: true, manuel: false };
    const manque = (item.requis || []).some((n) => estVide(ctx.get(n)));
    return { on: false, auto: false, manuel: false, inconnu: manque };
  }
  return { on: false, auto: false, manuel: false };
}

export function optionItem(item, ctx) {
  const v = ctx.val(item.id);
  if (!estVide(v)) return { o: item.options.find((o) => String(o.v) === String(v)) || null, auto: false };
  for (const o of item.options) if (o.auto && evaluer(o.auto, ctx)) return { o, auto: true };
  return { o: null, auto: false };
}

export function calculerScore(def, ctx) {
  const memo = ctx.scores;
  if (memo && memo.has(def)) return memo.get(def);
  let total = 0;
  let engage = false;
  let complet = true;
  const positifs = [];
  for (const it of def.items) {
    if (it.si && !evaluer(it.si, ctx)) continue;
    if (it.options) {
      const r = optionItem(it, ctx);
      if (r.o) {
        total += r.o.points ?? 0;
        engage = true;
      } else complet = false;
    } else {
      const e = etatItem(it, ctx);
      if (e.inconnu) complet = false;
      if (e.on) {
        total += it.points ?? 1;
        engage = true;
        positifs.push(it);
      }
      if (e.manuel) engage = true;
    }
  }
  const classe = (def.classes || []).find((k) => (k.min == null || total >= k.min) && (k.max == null || total <= k.max));
  const r = { total, engage, complet, classe, positifs };
  if (memo) memo.set(def, r);
  return r;
}

export function texteItem(it, ctx) {
  const res = (n) => resoudreNom(n, ctx);
  let t = T.rendre(it.texte ?? T.minuscule1(it.label), res);
  const details = (it.detail || []).map((d) => T.rendre(`[${d}]`, res)).filter((x) => T.sansMarques(x).trim());
  if (details.length) t += ` (${details.join(", ")})`;
  return t;
}

function fragmentScore(def, ctx) {
  const sc = calculerScore(def, ctx);
  if (!sc.engage) return null;
  const extra = {
    total: T.nombre(sc.total, 1),
    max: def.max !== undefined ? String(def.max) : "",
    classe: sc.classe ? sc.classe.texte : "",
    liste: T.listeFr(sc.positifs.map((it) => texteItem(it, ctx))),
    incomplet: sc.complet ? "" : " (score incomplet)",
    label: T.minuscule1(def.label),
  };
  const modele = def.phrase ?? "{label} à {total}[/{max}][ ({classe})]{incomplet}";
  const t = T.rendre(modele, (n) => resoudreNom(n, ctx, undefined, extra));
  return anormal(def, ctx) ? T.marquer(t) : t;
}

function fragmentCriteres(def, ctx) {
  const sc = calculerScore(def, ctx);
  if (!sc.positifs.length) return null;
  const extra = {
    liste: T.listeFr(sc.positifs.map((it) => texteItem(it, ctx)), def.liaison ?? ";"),
    nombre: String(sc.positifs.length),
    label: T.minuscule1(def.label),
  };
  const t = T.rendre(def.phrase ?? "{label} : {liste}", (n) => resoudreNom(n, ctx, undefined, extra));
  return def.marquer ? T.marquer(t) : t;
}

// ---------- Groupes ----------
export function estNormal(g, ctx) {
  if (!g.normal) return false;
  const nv = g.normal.valeurs || {};
  const aut = new Set(g.normal.autorises || []);
  if (g.normal.complet) {
    for (const id of Object.keys(nv)) {
      const c = g.champs.find((x) => x.id === id);
      if (c && visible(c, ctx) && !rempli(c, ctx)) return false;
    }
  }
  let auMoinsUn = false;
  for (const c of g.champs) {
    if (SANS_VALEUR.has(c.type) || c.type === "synthese" || !visible(c, ctx) || !rempli(c, ctx)) continue;
    if (c.id in nv) {
      if (!egalProfond(ctx.val(c.id), nv[c.id])) return false;
      auMoinsUn = true;
      continue;
    }
    if (aut.has(c.id)) {
      if (anormal(c, ctx)) return false;
      continue;
    }
    if (c.sortie === false) continue;
    return false;
  }
  return auMoinsUn;
}

export function composerGroupe(g, ctx) {
  if (g.sortie === false || !groupeVisible(g, ctx)) return null;
  const res = (n) => resoudreNom(n, ctx);
  const prefixe = g.prefixe ? T.rendre(g.prefixe, res) : "";
  if (g.normal && estNormal(g, ctx)) return T.phrases(prefixe + T.rendre(g.normal.phrase, res));
  if (g.phrase) {
    const t = T.rendre(g.phrase, res);
    return T.sansMarques(t).replace(/[\s.,;:()]/g, "") ? T.phrases(prefixe + t) : null;
  }
  const frags = [];
  for (const c of g.champs) {
    const f = fragment(c, ctx);
    if (f) frags.push({ t: f, nouvelle: c.nouvelle });
  }
  if (!frags.length) return null;
  return T.assembler(frags, prefixe);
}
