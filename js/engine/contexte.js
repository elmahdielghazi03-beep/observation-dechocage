// Contexte d'évaluation : donne accès aux saisies, aux variables calculées et aux
// fonctions utilisables dans les conditions des fichiers de configuration.

import * as C from "./champs.js";
import { construireFormulaire } from "./registre.js";
import { brouillonResume } from "./generateur.js";

export class Contexte {
  constructor(dossier, local = null, defsLocales = null, idsLocaux = null) {
    this.d = dossier;
    this.local = local; // valeurs d'un formulaire local (geste, réévaluation)
    this.defsLocales = defsLocales; // Map id → définition de champ locale
    this.idsLocaux = idsLocaux; // identifiants qui ne doivent jamais lire le dossier patient
    this.memo = new Map();
    this.encours = new Set();
    this.vis = new WeakMap();
    this.scores = new WeakMap();
    this.fn = fonctions(this);
  }

  estLocal(id) {
    return !!this.local && ((this.idsLocaux && this.idsLocaux.has(id)) || Object.prototype.hasOwnProperty.call(this.local, id));
  }

  // Valeur brute saisie
  val(id) {
    return this.estLocal(id) ? this.local[id] : this.d.patient.v[id];
  }

  // Valeur pour les conditions : saisie locale → variable calculée → score → saisie
  get(nom) {
    if (this.estLocal(nom)) return this.local[nom];
    if (this.memo.has(nom)) return this.memo.get(nom);
    const f = this.d.R.derives[nom];
    if (f) {
      if (this.encours.has(nom)) return undefined;
      this.encours.add(nom);
      let r;
      try {
        r = f(this);
      } finally {
        this.encours.delete(nom);
      }
      this.memo.set(nom, r);
      return r;
    }
    const defs = this.d.index.champs[nom];
    if (defs && defs[0].type === "calcul") {
      if (this.encours.has(nom)) return undefined;
      this.encours.add(nom);
      let r;
      try {
        r = C.valeurCalcul(defs[0], this);
      } finally {
        this.encours.delete(nom);
      }
      this.memo.set(nom, r);
      return r;
    }
    if (nom.startsWith("score_")) {
      const def = this.d.index.scores[nom.slice(6)];
      const r = def ? C.calculerScore(def, this).total : undefined;
      this.memo.set(nom, r);
      return r;
    }
    return this.d.patient.v[nom];
  }

  avec(local) {
    return new Contexte(this.d, { ...(this.local || {}), ...local }, this.defsLocales, this.idsLocaux);
  }

  champ(id) {
    if (this.defsLocales && this.defsLocales.has(id)) return this.defsLocales.get(id);
    const defs = this.d.index.champs[id];
    if (!defs) return null;
    if (defs.length === 1) return defs[0];
    return defs.find((x) => C.visible(x, this)) || defs[0];
  }
}

function fonctions(c) {
  const fn = {
    motif: (id) => (c.d.patient.v.motifs || []).includes(id),
    coche: (id, opt) => {
      if (opt === undefined) {
        const it = c.d.index.items[id];
        if (it) return C.etatItem(it, c).on;
        const v = c.val(id);
        return Array.isArray(v) ? v.length > 0 : !!v;
      }
      const v = c.val(id);
      return Array.isArray(v) ? v.includes(opt) : v !== undefined && v !== null && String(v) === String(opt);
    },
    vide: (id) => {
      const def = c.champ(id);
      return def ? !C.rempli(def, c) : C.estVide(c.get(id));
    },
    rempli: (id) => !fn.vide(id),
    visible: (id) => {
      const def = c.champ(id);
      return !!def && C.visible(def, c);
    },
    dans: (x, ...liste) => x !== undefined && x !== null && liste.some((y) => String(x) === String(y)),
    ent: (x) => Math.floor(Number(x)),
    geste: (item, med) => (c.d.patient.gestes || []).some((g) => g.item === item && (!med || g.d?.medicament === med)),
    nbgestes: () => (c.d.patient.gestes || []).length,
    nbreevals: () => (c.d.patient.reevals || []).length,
    nb: (id) => {
      const v = c.val(id);
      return Array.isArray(v) ? v.length : C.estVide(v) ? 0 : 1;
    },
  };
  return fn;
}

// Un dossier = un patient + le formulaire construit pour lui (tronc commun + modules de ses motifs)
export class Dossier {
  constructor(patient, R) {
    this.patient = patient;
    this.R = R;
    this.reconstruire();
  }

  reconstruire() {
    this.form = construireFormulaire(this.patient, this.R);
    this.index = this.form.index;
    this._optionsCache = {};
    return this.rafraichir();
  }

  rafraichir() {
    this.ctx = new Contexte(this);
    return this.ctx;
  }

  modulesActifs() {
    return (this.patient.v.motifs || []).map((id) => this.R.motifs[id]).filter(Boolean);
  }

  optionsDynamiques(nom) {
    if (this._optionsCache[nom]) return this._optionsCache[nom];
    let os = [];
    if (nom === "motifs") {
      os = this.R.listeMotifs.map((m) => ({ v: m.id, label: m.titre, icone: m.icone, texte: m.texte_motif ?? m.titre.toLowerCase() }));
    } else if (nom === "hypotheses") {
      const vus = new Set();
      for (const m of this.modulesActifs()) {
        for (const h of m.hypotheses || []) {
          const o = typeof h === "string" ? { label: h } : h;
          const v = o.v ?? slug(o.label);
          if (vus.has(v)) continue;
          vus.add(v);
          os.push({ v, label: o.label, texte: o.texte ?? lower1(o.label), groupe: m.titre });
        }
      }
    }
    this._optionsCache[nom] = os;
    return os;
  }

  brouillonResume(ctx = this.ctx) {
    return brouillonResume(ctx);
  }

  examensSuggeres() {
    const s = new Set();
    for (const m of this.modulesActifs()) for (const e of m.examens_suggeres || []) s.add(e);
    return s;
  }

  gestesFavoris() {
    const l = [];
    for (const m of this.modulesActifs()) for (const g of m.gestes_favoris || []) l.push(g);
    return l;
  }
}

const lower1 = (t) => (t.length > 1 && /[A-Z]/.test(t[1]) ? t : t.charAt(0).toLowerCase() + t.slice(1));
export const slug = (t) =>
  String(t)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

// Contexte d'un petit formulaire indépendant (détails d'un geste, réévaluation) :
// ses champs sont isolés du dossier, le reste (âge, poids, normes) vient du patient.
export function contexteLocal(dossier, defs, valeurs) {
  const map = new Map();
  const ids = new Set();
  for (const d of defs) {
    if (d.id) {
      map.set(d.id, d);
      ids.add(d.id);
    }
    if (d.type === "pa") {
      ids.add(d.id_pas);
      ids.add(d.id_pad);
    }
    if (d.autre) ids.add(d.id + "_autre");
  }
  return new Contexte(dossier, valeurs, map, ids);
}
