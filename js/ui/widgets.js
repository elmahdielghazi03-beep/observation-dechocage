// Widgets de saisie : un widget par type de champ des fichiers de configuration.
// Chaque widget s'enregistre via env.lier(fn) : fn(ctx) met à jour l'affichage après chaque saisie.
//
// env = { val(id), ecrire(id, valeur, {differe}), ecrireLot(objet), ctx(), lier(fn),
//         geste(item, preset), gestes(), suggeres() }

import { h } from "./dom.js";
import * as C from "../engine/champs.js";
import * as T from "../engine/texte.js";

const saisie = (v) => (v === undefined || v === null ? "" : String(v).replace(".", ","));

function etiquette(def, opts = {}) {
  if (!def.label) return null;
  return h(
    "div",
    { class: "champ-label" },
    h("span", {}, opts.compact ? def.court ?? def.label : def.label),
    def.aide && !opts.compact ? h("span", { class: "aide" }, def.aide) : null,
  );
}

export function rendreChamp(def, env, opts = {}) {
  const f = W[def.type];
  if (!f) return null;
  const el = f(def, env, opts);
  if (!el) return null;
  el.classList.add("champ", "t-" + def.type);
  if (opts.compact) el.classList.add("compact");
  if (def.id && !opts.compact) el.dataset.id = def.id;
  if (def.si && !opts.compact && !opts.local) el.classList.add("cond");
  env.lier((ctx) => {
    el.hidden = !C.visible(def, ctx);
  });
  return el;
}

// Boutons d'options (choix unique ou multiple), avec intertitres facultatifs (option.groupe)
function boutonsOptions(def, env, { surClic, estSel, classe = "" }) {
  const box = h("div", { class: "options " + classe + (def.grand ? " grand" : "") });
  const btns = [];
  const groupes = [];
  let courant = null;
  for (const o of C.options(def, env.ctx())) {
    if (o.groupe && o.groupe !== courant?.nom) {
      courant = { nom: o.groupe, el: h("div", { class: "opt-groupe" }, o.groupe), btns: [] };
      groupes.push(courant);
      box.append(courant.el);
    }
    const b = h("button", { type: "button", class: "opt", onclick: () => surClic(o) }, o.icone ? h("span", { class: "opt-icone" }, o.icone) : null, o.label);
    btns.push([b, o]);
    if (courant) courant.btns.push(b);
    box.append(b);
  }
  env.lier((ctx) => {
    const sugg = env.suggeres ? env.suggeres() : null;
    for (const [b, o] of btns) {
      const sel = estSel(o, ctx);
      b.classList.toggle("sel", sel);
      b.classList.toggle("ano", sel && !!o.anormal);
      b.setAttribute("aria-pressed", sel ? "true" : "false");
      b.hidden = !C.optionVisible(o, ctx);
      const suggere = (sugg && sugg.has(o.v)) || (o.suggere_si && C.optionVisible({ si: o.suggere_si }, ctx));
      b.classList.toggle("sugg", !!suggere && !sel);
    }
    for (const g of groupes) g.el.hidden = g.btns.every((b) => b.hidden);
  });
  return box;
}

function champTexteAnnexe(id, env, placeholder) {
  const input = h("input", { type: "text", class: "annexe", placeholder, autocomplete: "off" });
  input.addEventListener("input", () => env.ecrire(id, input.value.trim() ? input.value : undefined, { differe: true }));
  env.lier((ctx) => {
    if (document.activeElement !== input) input.value = ctx.val(id) ?? "";
  });
  return input;
}

const W = {};

W.choix = (def, env, opts) => {
  const box = boutonsOptions(def, env, {
    estSel: (o, ctx) => {
      const v = ctx.val(def.id);
      return v !== undefined && v !== null && String(v) === String(o.v);
    },
    surClic: (o) => {
      const cur = env.val(def.id);
      if (cur !== undefined && String(cur) === String(o.v)) env.ecrire(def.id, undefined);
      else env.ecrireLot({ [def.id]: o.v, ...(o.defauts || {}) });
    },
  });
  return h("div", {}, etiquette(def, opts), box);
};

W.multi = (def, env, opts) => {
  const exclusifs = new Set((def.options || []).filter((o) => o.exclusif).map((o) => o.v));
  const box = boutonsOptions(def, env, {
    classe: "puces",
    estSel: (o, ctx) => {
      const v = ctx.val(def.id);
      return Array.isArray(v) && v.includes(o.v);
    },
    surClic: (o) => {
      const cur = Array.isArray(env.val(def.id)) ? env.val(def.id) : [];
      let nv;
      if (cur.includes(o.v)) nv = cur.filter((x) => x !== o.v);
      else if (o.exclusif) nv = [o.v];
      else nv = [...cur.filter((x) => !exclusifs.has(x)), o.v];
      env.ecrire(def.id, nv.length ? nv : undefined);
    },
  });
  const el = h("div", {}, etiquette(def, opts), box);
  if (def.autre) el.append(champTexteAnnexe(def.id + "_autre", env, "Autre (texte libre)…"));
  if (def.precision) el.append(champTexteAnnexe(def.id + "_precision", env, "Précision (localisation, détail)…"));
  return el;
};

function texteNorme(b, def) {
  if (!b) return "";
  const u = def.unite ? " " + def.unite : "";
  const [a, z] = b;
  const fa = (x) => T.nombre(x, def.decimales ?? 2);
  if (!C.estVide(a) && !C.estVide(z)) return `Normes : ${fa(a)}–${fa(z)}${u}`;
  if (!C.estVide(a)) return `Normal ≥ ${fa(a)}${u}`;
  if (!C.estVide(z)) return `Normal ≤ ${fa(z)}${u}`;
  return "";
}

W.nombre = (def, env, opts) => {
  const input = h("input", {
    type: "text",
    inputmode: def.decimales === 0 ? "numeric" : "decimal",
    autocomplete: "off",
    enterkeyhint: "next",
    placeholder: def.placeholder ?? (opts.compact ? "—" : ""),
    "aria-label": def.label,
  });
  input.addEventListener("input", () => env.ecrire(def.id, T.parseNombre(input.value), { differe: true }));
  input.addEventListener("blur", () => {
    input.value = saisie(env.val(def.id));
  });
  const ligne = h("div", { class: "nombre" }, input, def.unite ? h("span", { class: "unite" }, def.unite) : null);
  const el = h("div", {}, etiquette(def, opts), ligne);
  if (def.raccourcis && !opts.compact) {
    ligne.append(
      ...def.raccourcis.map((r) =>
        h("button", { type: "button", class: "btn-mini", onclick: () => env.ecrire(def.id, r) }, T.nombre(r, 2)),
      ),
    );
  }
  let sugg = null;
  if (def.suggestion && !opts.compact) {
    sugg = h("div", { class: "suggestion" });
    el.append(sugg);
  }
  const norme = h("div", { class: "norme" });
  if (!opts.compact) el.append(norme);
  env.lier((ctx) => {
    const v = ctx.val(def.id);
    if (document.activeElement !== input) input.value = saisie(v);
    el.classList.toggle("ano", C.sensAnomalie(def, v, ctx) !== 0);
    const improbable = typeof v === "number" && ((def.min !== undefined && v < def.min) || (def.max !== undefined && v > def.max));
    el.classList.toggle("improbable", improbable);
    norme.textContent = improbable ? "Valeur improbable : vérifie la saisie" : texteNorme(C.bornesDe(def, ctx), def);
    if (sugg) {
      const sv = ctx.get(def.suggestion.var);
      sugg.replaceChildren();
      if (C.estVide(v) && !C.estVide(sv)) {
        sugg.append(
          h("span", {}, `${def.suggestion.label} : ${T.nombre(sv, 1)} ${def.suggestion.unite ?? ""}`),
          h("button", { type: "button", class: "btn-mini", onclick: () => env.ecrireLot({ [def.id]: sv, ...(def.suggestion.valeurs || {}) }) }, "Utiliser"),
        );
      }
    }
  });
  return el;
};

W.pa = (def, env, opts) => {
  const mk = (id, ph) => {
    const i = h("input", { type: "text", inputmode: "numeric", autocomplete: "off", placeholder: ph, "aria-label": ph });
    i.addEventListener("input", () => env.ecrire(id, T.parseNombre(i.value), { differe: true }));
    i.addEventListener("blur", () => (i.value = saisie(env.val(id))));
    return i;
  };
  const s = mk(def.id_pas, "PAS");
  const d = mk(def.id_pad, "PAD");
  const pam = h("span", { class: "pam" });
  const norme = h("div", { class: "norme" });
  const el = h(
    "div",
    {},
    etiquette(def, opts),
    h("div", { class: "nombre pa" }, s, h("span", { class: "sep" }, "/"), d, h("span", { class: "unite" }, "mmHg"), opts.compact ? null : pam),
    opts.compact ? null : norme,
  );
  env.lier((ctx) => {
    const modele = def.norme ?? ctx.d.R.normes.texte_norme_pa;
    if (modele) norme.textContent = T.rendre(modele, (n) => C.resoudreNom(n, ctx));
    const vs = ctx.val(def.id_pas), vd = ctx.val(def.id_pad);
    if (document.activeElement !== s) s.value = saisie(vs);
    if (document.activeElement !== d) d.value = saisie(vd);
    el.classList.toggle("ano", C.rempli(def, ctx) && C.anormal(def, ctx));
    const p = typeof vs === "number" && typeof vd === "number" ? Math.round((vs + 2 * vd) / 3) : null;
    pam.textContent = p === null ? "" : `PAM ${p}`;
  });
  return el;
};

W.paire = (def, env, opts) => {
  const ligne = (cote, nom) => {
    const box = boutonsOptions(def, env, {
      estSel: (o, ctx) => (ctx.val(def.id) || {})[cote] === o.v,
      surClic: (o) => {
        const cur = { ...(env.val(def.id) || {}) };
        cur[cote] = cur[cote] === o.v ? undefined : o.v;
        env.ecrire(def.id, C.estVide(cur) ? undefined : cur);
      },
    });
    return h("div", { class: "paire-ligne" }, h("span", { class: "paire-cote" }, nom), box);
  };
  const copier = h(
    "button",
    {
      type: "button",
      class: "btn-mini",
      onclick: () => {
        const cur = env.val(def.id) || {};
        if (cur.d) env.ecrire(def.id, { d: cur.d, g: cur.d });
      },
    },
    "Gauche = droite",
  );
  const el = h("div", {}, etiquette(def, opts), ligne("d", "Droite"), ligne("g", "Gauche"), copier);
  env.lier((ctx) => el.classList.toggle("ano", C.rempli(def, ctx) && C.anormal(def, ctx)));
  return el;
};

W.heure = (def, env, opts) => {
  const input = h("input", { type: "datetime-local", "aria-label": def.label });
  input.addEventListener("change", () => env.ecrire(def.id, input.value || undefined));
  const decaler = (min) => {
    const base = T.parseDT(env.val(def.id)) || new Date();
    env.ecrire(def.id, T.dtLocal(new Date(base.getTime() + min * 60000)));
  };
  const rel = h("span", { class: "rel" });
  const el = h(
    "div",
    {},
    etiquette(def, opts),
    h(
      "div",
      { class: "heure" },
      input,
      h("button", { type: "button", class: "btn-mini", onclick: () => env.ecrire(def.id, T.dtLocal()) }, "Maintenant"),
      h("button", { type: "button", class: "btn-mini", onclick: () => decaler(-5) }, "−5 min"),
      h("button", { type: "button", class: "btn-mini", onclick: () => decaler(5) }, "+5 min"),
    ),
    rel,
  );
  env.lier((ctx) => {
    const v = ctx.val(def.id);
    if (document.activeElement !== input) input.value = v ?? "";
    rel.textContent = v ? T.ilya(v) : "";
  });
  return el;
};

W.date = (def, env, opts) => {
  const input = h("input", { type: "date", "aria-label": def.label });
  input.addEventListener("change", () => env.ecrire(def.id, input.value || undefined));
  const inconnu = def.inconnu
    ? h("button", { type: "button", class: "btn-mini", onclick: () => env.ecrire(def.id, env.val(def.id) === "inconnue" ? undefined : "inconnue") }, "Inconnue")
    : null;
  const el = h("div", {}, etiquette(def, opts), h("div", { class: "heure" }, input, inconnu));
  env.lier((ctx) => {
    const v = ctx.val(def.id);
    if (document.activeElement !== input) input.value = v && v !== "inconnue" ? v : "";
    if (inconnu) inconnu.classList.toggle("sel", v === "inconnue");
  });
  return el;
};

W.texte = (def, env, opts) => {
  const input = h("input", {
    type: "text",
    autocomplete: "off",
    placeholder: def.placeholder ?? "",
    maxlength: def.max ?? null,
    autocapitalize: def.majuscules ? "characters" : "sentences",
    "aria-label": def.label,
  });
  input.addEventListener("input", () => {
    if (def.majuscules) {
      const p = input.selectionStart;
      input.value = input.value.toUpperCase();
      input.setSelectionRange(p, p);
    }
    env.ecrire(def.id, input.value.trim() ? input.value : undefined, { differe: true });
  });
  env.lier((ctx) => {
    if (document.activeElement !== input) input.value = ctx.val(def.id) ?? "";
  });
  return h("div", {}, etiquette(def, opts), input);
};

function zoneTexte(def, env, id = def.id) {
  const ta = h("textarea", { rows: 2, placeholder: def.placeholder ?? "Texte libre (dictée vocale possible)…", "aria-label": def.label });
  const ajuster = () => {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight + 2, 320) + "px";
  };
  ta.addEventListener("input", () => {
    ajuster();
    env.ecrire(id, ta.value.trim() ? ta.value : undefined, { differe: true });
  });
  env.lier((ctx) => {
    if (document.activeElement !== ta) {
      ta.value = ctx.val(id) ?? "";
      ajuster();
    }
  });
  return ta;
}

W.texte_long = (def, env, opts) => h("div", {}, etiquette(def, opts), zoneTexte(def, env));

W.curseur = (def, env, opts) => {
  const max = def.max ?? 10;
  const input = h("input", { type: "range", min: 0, max, step: 1, "aria-label": def.label });
  const val = h("span", { class: "curseur-val" });
  input.addEventListener("input", () => env.ecrire(def.id, Number(input.value)));
  const effacer = h("button", { type: "button", class: "btn-mini", onclick: () => env.ecrire(def.id, undefined) }, "Effacer");
  const el = h("div", {}, etiquette(def, opts), h("div", { class: "curseur" }, input, val, effacer));
  env.lier((ctx) => {
    const v = ctx.val(def.id);
    input.value = v ?? 0;
    input.classList.toggle("vide", v === undefined);
    val.textContent = v === undefined ? "—" : `${v}/${max}`;
    el.classList.toggle("ano", C.sensAnomalie(def, v, ctx) !== 0);
  });
  return el;
};

W.calcul = (def, env, opts) => {
  const v = h("strong", {});
  const el = h("div", { class: "calcul" }, h("span", {}, opts.compact ? def.court ?? def.label : def.label), v);
  env.lier((ctx) => {
    const x = C.valeurCalcul(def, ctx);
    const vide = C.estVide(x);
    el.classList.toggle("vide", vide);
    v.textContent = vide ? "—" : (def.texte_var ? ctx.get(def.texte_var) : T.nombre(x, def.decimales ?? 2)) + (def.unite && !def.texte_var ? " " + def.unite : "");
    el.classList.toggle("ano", !vide && C.sensAnomalie(def, x, ctx) !== 0);
  });
  return el;
};

W.score = (def, env) => {
  const total = h("span", { class: "score-total" });
  const items = h("div", { class: "score-items" });
  const lignes = [];
  let categorie = null;
  for (const it of def.items) {
    if (it.categorie && it.categorie !== categorie) {
      categorie = it.categorie;
      items.append(h("div", { class: "opt-groupe" }, categorie));
    }
    if (it.options) {
      const btns = it.options.map((o) => {
        const b = h(
          "button",
          {
            type: "button",
            class: "opt",
            onclick: () => {
              const cur = env.val(it.id);
              env.ecrire(it.id, cur !== undefined && String(cur) === String(o.v) ? undefined : o.v);
            },
          },
          o.label,
        );
        return [b, o];
      });
      const ligne = h("div", { class: "score-item" }, h("div", { class: "champ-label" }, it.label), h("div", { class: "options" }, btns.map((x) => x[0])));
      items.append(ligne);
      lignes.push((ctx) => {
        ligne.hidden = !!it.si && !C.optionVisible({ si: it.si }, ctx);
        const r = C.optionItem(it, ctx);
        for (const [b, o] of btns) {
          const sel = r.o === o;
          b.classList.toggle("sel", sel);
          b.classList.toggle("auto", sel && r.auto);
        }
      });
    } else {
      const coche = h("span", { class: "case" });
      const tag = h("span", { class: "tag-auto" }, "auto");
      const b = h(
        "button",
        {
          type: "button",
          class: "critere",
          onclick: () => {
            const ctx = env.ctx();
            const e = C.etatItem(it, ctx);
            const voulu = !e.on;
            const auto = it.auto ? C.etatItem({ ...it, id: "__aucun__" }, ctx).on : false;
            env.ecrire(it.id, voulu === auto ? undefined : voulu);
          },
        },
        coche,
        h("span", { class: "critere-label" }, it.label, it.points !== undefined && def.type === "score" ? ` (+${T.nombre(it.points, 1)})` : ""),
        tag,
      );
      items.append(b);
      lignes.push((ctx) => {
        b.hidden = !!it.si && !C.optionVisible({ si: it.si }, ctx);
        const e = C.etatItem(it, ctx);
        b.classList.toggle("on", e.on);
        b.classList.toggle("inconnu", !!e.inconnu);
        tag.hidden = !e.auto;
        b.setAttribute("aria-pressed", e.on ? "true" : "false");
      });
    }
  }
  const reinit = h(
    "button",
    {
      type: "button",
      class: "btn-mini",
      onclick: () => {
        const lot = {};
        for (const it of def.items) lot[it.id] = undefined;
        env.ecrireLot(lot);
      },
    },
    "Réinitialiser",
  );
  const el = h(
    "div",
    { class: "score-carte" },
    h("div", { class: "score-tete" }, h("span", { class: "score-titre" }, def.label), def.type === "score" ? total : null),
    def.aide ? h("div", { class: "aide" }, def.aide) : null,
    items,
    h("div", { class: "score-pied" }, reinit),
  );
  env.lier((ctx) => {
    for (const f of lignes) f(ctx);
    const sc = C.calculerScore(def, ctx);
    if (def.type === "score") {
      total.textContent = sc.engage
        ? `${T.nombre(sc.total, 1)}${def.max !== undefined ? "/" + def.max : ""}${sc.classe ? " · " + sc.classe.texte : ""}${sc.complet ? "" : " (incomplet)"}`
        : "—";
      el.classList.toggle("ano", sc.engage && C.anormal(def, ctx));
    } else {
      el.classList.toggle("ano", sc.positifs.length > 0);
    }
  });
  return el;
};
W.criteres = W.score;

W.geste = (def, env) => {
  const b = h("button", { type: "button", class: "btn btn-geste", onclick: () => env.geste(def.item, def.preset) });
  env.lier(() => {
    const liste = (env.gestes ? env.gestes() : []).filter(
      (g) => g.item === def.item && (!def.preset?.medicament || g.d?.medicament === def.preset.medicament),
    );
    const dernier = liste[liste.length - 1];
    b.textContent = dernier ? `✓ ${def.label} — ${T.heureTexte(T.parseDT(dernier.heure))} (ajouter)` : `+ ${def.label}`;
    b.classList.toggle("fait", !!dernier);
  });
  return h("div", {}, b);
};

W.info = (def, env) => {
  const el = h("div", { class: "info" + (def.alerte ? " alerte" : "") });
  env.lier((ctx) => {
    el.textContent = T.rendre(def.texte, (n) => C.resoudreNom(n, ctx));
  });
  return el;
};

W.resume = (def, env, opts) => {
  const brouillon = h("div", { class: "brouillon" });
  const modifier = h(
    "button",
    {
      type: "button",
      class: "btn-mini",
      onclick: () => env.ecrire(def.id, env.ctx().d.brouillonResume(env.ctx())),
    },
    "Modifier ce brouillon",
  );
  const ta = zoneTexte(def, env);
  const revenir = h("button", { type: "button", class: "btn-mini", onclick: () => env.ecrire(def.id, undefined) }, "Revenir au brouillon automatique");
  const el = h("div", {}, etiquette(def, opts), brouillon, modifier, ta, revenir);
  env.lier((ctx) => {
    const v = ctx.val(def.id);
    const auto = C.estVide(v);
    brouillon.hidden = modifier.hidden = !auto;
    ta.hidden = revenir.hidden = auto;
    if (auto) brouillon.textContent = ctx.d.brouillonResume(ctx) || "Le brouillon apparaîtra quand l'âge, le motif et l'évaluation initiale seront renseignés.";
  });
  return el;
};
