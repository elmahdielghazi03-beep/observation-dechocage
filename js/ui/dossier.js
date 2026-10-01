// Écran « dossier patient » : formulaire adaptatif, bandeau des constantes, barre d'actions.

import { h, ouvrirFeuille, aller, confirmer, toast, differer } from "./dom.js";
import { rendreChamp } from "./widgets.js";
import { ouvrirGeste, ouvrirReevaluation } from "./feuilles.js";
import * as C from "../engine/champs.js";
import * as T from "../engine/texte.js";
import { evaluer } from "../engine/expr.js";
import { Dossier } from "../engine/contexte.js";
import { texteGeste, texteReevaluation, trierParHeure } from "../engine/generateur.js";
import { verifierChecklist, progression, suggestionsActives } from "../engine/checklist.js";
import * as S from "../store.js";

const sectionsOuvertes = new Map(); // id patient → Set des sections ouvertes (pendant la session)
const CONSTANTES = ["fc", "pa", "fr", "spo2", "temp", "glycemie"];
const COURT = { fc: "FC", pa: "PA", fr: "FR", spo2: "SpO2", temp: "T°", glycemie: "Glyc." };

export function ecranDossier(racine, app, id, params) {
  const patient = S.lire(id);
  if (!patient) {
    aller("#/");
    return;
  }
  patient.gestes = patient.gestes || [];
  patient.reevals = patient.reevals || [];
  const dossier = new Dossier(patient, app.R);
  if (!sectionsOuvertes.has(id)) {
    const p0 = progression(dossier);
    const ouv = new Set(app.R.sections.filter((s) => s.ouvert).map((s) => s.id));
    if (p0.parSection.identite && p0.parSection.identite.faits < p0.parSection.identite.total) ouv.add("identite");
    sectionsOuvertes.set(id, ouv);
  }
  const ouvertes = sectionsOuvertes.get(id);

  let liaisons = [];
  const sauver = differer(() => {
    if (!S.ecrire(patient)) toast("⚠ Sauvegarde impossible (mémoire du téléphone pleine ?)", 4000);
  }, 250);
  const quitter = () => sauver.maintenant();
  window.addEventListener("pagehide", quitter);
  window.addEventListener("obs:sauver", quitter);
  document.addEventListener("visibilitychange", quitter);

  const rafraichirDiffere = differer(() => rafraichir(), 180);

  const env = {
    val: (k) => patient.v[k],
    ecrire(k, v, opts = {}) {
      if (C.estVide(v)) delete patient.v[k];
      else patient.v[k] = v;
      sauver();
      if (k === "motifs") return reconstruire();
      if (opts.differe) rafraichirDiffere();
      else rafraichir();
    },
    ecrireLot(lot) {
      for (const [k, v] of Object.entries(lot)) {
        if (C.estVide(v)) delete patient.v[k];
        else patient.v[k] = v;
      }
      sauver();
      if ("motifs" in lot) return reconstruire();
      rafraichir();
    },
    ctx: () => dossier.ctx,
    lier: (f) => liaisons.push(f),
    geste: (item, preset) => ouvrirGeste(dossier, { item, preset, surEnregistrer: apresListe }),
    gestes: () => patient.gestes,
    suggeres: () => dossier.examensSuggeres(),
  };

  // ---------- En-tête ----------
  const titre = h("div", { class: "barre-titre" });
  const puces = h("div", { class: "bandeau" });
  const barreProg = h("div", { class: "progression" }, h("div", { class: "progression-remplie" }));
  const entete = h(
    "header",
    { class: "barre-haut" },
    h("button", { type: "button", class: "btn-icone", "aria-label": "Retour à la liste", onclick: () => aller("#/") }, "‹"),
    titre,
    h("button", { type: "button", class: "btn-icone", "aria-label": "Menu", onclick: menu }, "⋮"),
  );

  // ---------- Contenu ----------
  const suggestions = h("div", { class: "suggestions" });
  const constantes = h("div", { class: "constantes" });
  const sectionsEl = h("div", { class: "sections" });
  const main = h("main", { class: "contenu dossier" }, suggestions, constantes, sectionsEl);
  const barreBas = h(
    "nav",
    { class: "barre-bas" },
    h("button", { type: "button", onclick: ouvrirSommaire }, h("span", { class: "ico" }, "☰"), "Sections"),
    h("button", { type: "button", onclick: () => env.geste() }, h("span", { class: "ico" }, "＋"), "Geste"),
    h("button", { type: "button", onclick: () => ouvrirReevaluation(dossier, { surEnregistrer: apresListe }) }, h("span", { class: "ico" }, "↻"), "Réévaluer"),
    h("button", { type: "button", class: "principal", onclick: generer }, h("span", { class: "ico" }, "✎"), "Générer"),
  );
  racine.replaceChildren(h("div", { class: "ecran" }, entete, h("div", { class: "sous-entete" }, puces, barreProg), main, barreBas));

  // ---------- Rendu ----------
  function rendreTout() {
    liaisons = [];
    rendreConstantes();
    sectionsEl.replaceChildren(...dossier.form.sections.map(rendreSection));
    rafraichir();
  }

  function reconstruire() {
    const y = window.scrollY;
    dossier.reconstruire();
    rendreTout();
    window.scrollTo(0, y);
  }

  function rendreConstantes() {
    const els = [];
    for (const k of CONSTANTES) {
      const def = (dossier.index.champs[k] || [])[0];
      if (!def) continue;
      els.push(rendreChamp({ ...def, court: COURT[k], si: undefined, _groupe: undefined }, env, { compact: true }));
    }
    const gcs = h("button", { type: "button", class: "constante-gcs", onclick: () => allerAuChamp("gcs_y") }, h("span", {}, "GCS"), h("strong", {}, "—"));
    liaisons.push((ctx) => {
      const g = ctx.get("gcs");
      gcs.querySelector("strong").textContent = g === undefined ? "—" : ctx.get("gcs_court");
      gcs.classList.toggle("ano", g !== undefined && g < 15);
    });
    constantes.replaceChildren(...els, gcs);
  }

  function rendreSection(s) {
    const prog = h("span", { class: "section-prog" });
    const pastille = h("span", { class: "pastille-ano", title: "Anomalie" });
    const tete = h(
      "button",
      { type: "button", class: "section-tete", onclick: () => basculer(s.id) },
      h("span", { class: "section-icone" }, s.icone),
      h("span", { class: "section-titre" }, s.titre),
      pastille,
      prog,
      h("span", { class: "chevron" }, "›"),
    );
    const corps = h("div", { class: "section-corps" });
    const el = h("section", { class: "section", id: "sec-" + s.id }, tete, corps);
    if (s.special === "gestes") corps.append(listeGestes());
    else if (s.special === "reevaluation") corps.append(listeReevals());
    else for (const g of s.groupes) corps.append(rendreGroupe(g));
    el.classList.toggle("ouverte", ouvertes.has(s.id));
    liaisons.push((ctx) => {
      el.hidden = !!s.si && !evaluer(s.si, ctx);
    });
    el._maj = (p) => {
      if (s.special === "gestes") prog.textContent = patient.gestes.length ? String(patient.gestes.length) : "";
      else if (s.special === "reevaluation") prog.textContent = patient.reevals.length ? String(patient.reevals.length) : "";
      else prog.textContent = p && p.total ? `${p.faits}/${p.total}` : "";
      prog.classList.toggle("complet", !!p && p.total > 0 && p.faits === p.total);
      pastille.hidden = !p || !p.anomalie;
    };
    return el;
  }

  function rendreGroupe(g) {
    const champs = g.champs.map((c) => rendreChamp(c, env)).filter(Boolean);
    let btnNormal = null;
    if (g.normal) {
      btnNormal = h("button", { type: "button", class: "btn-normal", onclick: () => basculerNormal(g) }, g.normal.label ?? "Normal");
    }
    const tete = g.titre || btnNormal ? h("div", { class: "groupe-tete" }, h("h3", {}, g.titre || ""), btnNormal) : null;
    let el;
    if (g.replie) {
      el = h("details", { class: "groupe" }, h("summary", {}, g.titre), btnNormal ? h("div", { class: "groupe-tete" }, h("span"), btnNormal) : null, champs);
    } else el = h("div", { class: "groupe" + (g._module ? " module" : "") }, tete, champs);
    el.dataset.groupe = g.id;
    liaisons.push((ctx) => {
      el.hidden = !C.groupeVisible(g, ctx) || champs.every((c) => c.hidden);
      if (btnNormal) btnNormal.classList.toggle("actif", C.estNormal(g, ctx));
    });
    return el;
  }

  function basculerNormal(g) {
    const ctx = dossier.ctx;
    const deja = C.estNormal(g, ctx);
    for (const [k, v] of Object.entries(g.normal.valeurs)) {
      const def = g.champs.find((c) => c.id === k && C.visible(c, ctx));
      if (!def) continue;
      if (deja) delete patient.v[k];
      else patient.v[k] = structuredClone(v);
    }
    sauver();
    rafraichir();
    toast(deja ? "Valeurs normales retirées" : "Valeurs normales appliquées — complète les chiffres");
  }

  // ---------- Gestes et réévaluations ----------
  const listeGestesEl = h("div", { class: "liste-horodatee" });
  const listeReevalsEl = h("div", { class: "liste-horodatee" });
  function listeGestes() {
    majListeGestes();
    return h("div", {}, listeGestesEl, h("button", { type: "button", class: "btn btn-large", onclick: () => env.geste() }, "+ Ajouter un geste"));
  }
  function listeReevals() {
    majListeReevals();
    return h(
      "div",
      {},
      listeReevalsEl,
      h("button", { type: "button", class: "btn btn-large", onclick: () => ouvrirReevaluation(dossier, { surEnregistrer: apresListe }) }, "+ Réévaluer"),
    );
  }
  function majListeGestes() {
    const l = trierParHeure(patient.gestes);
    listeGestesEl.replaceChildren(
      ...(l.length
        ? l.map((g) =>
            h(
              "button",
              { type: "button", class: "ligne-horodatee", onclick: () => ouvrirGeste(dossier, { geste: g, surEnregistrer: apresListe }) },
              h("span", { class: "heure" }, T.heureTexte(T.parseDT(g.heure))),
              h("span", { class: "texte", html: T.versHTML(T.majuscule(texteGeste(g, dossier))) }),
            ),
          )
        : [h("p", { class: "vide" }, "Aucun geste noté. Utilise « + Geste » en bas de l'écran : l'heure est notée automatiquement.")]),
    );
  }
  function majListeReevals() {
    const l = trierParHeure(patient.reevals);
    listeReevalsEl.replaceChildren(
      ...(l.length
        ? l.map((r) =>
            h(
              "button",
              { type: "button", class: "ligne-horodatee", onclick: () => ouvrirReevaluation(dossier, { reeval: r, surEnregistrer: apresListe }) },
              h("span", { class: "heure" }, T.heureTexte(T.parseDT(r.heure))),
              h("span", { class: "texte", html: T.versHTML(texteReevaluation(r, dossier)) }),
            ),
          )
        : [h("p", { class: "vide" }, "Aucune réévaluation. Après tes gestes, touche « Réévaluer ».")]),
    );
  }
  function apresListe() {
    majListeGestes();
    majListeReevals();
    rafraichir();
  }

  // ---------- Mise à jour ----------
  function rafraichir() {
    dossier.rafraichir();
    const ctx = dossier.ctx;
    for (const f of liaisons) f(ctx);
    majEntete(ctx);
    majSuggestions();
  }

  function majEntete(ctx) {
    const v = patient.v;
    const ini = v.initiales || "Patient";
    const age = ctx.get("age_texte");
    titre.replaceChildren(h("strong", {}, ini), h("span", {}, [age, v.sexe].filter(Boolean).join(" · ")));
    const l = [];
    for (const m of dossier.modulesActifs()) l.push(h("span", { class: "puce" }, `${m.icone} ${m.titre}`));
    if (v.poids) l.push(h("span", { class: "puce" }, `${T.nombre(v.poids, 1)} kg`));
    if (v.allergies === "oui") l.push(h("span", { class: "puce danger" }, `Allergie${v.allergies_detail ? " : " + v.allergies_detail : ""}`));
    if (v.grossesse === "oui" || v.grossesse === "possible") l.push(h("span", { class: "puce danger" }, v.grossesse === "oui" ? "Enceinte" : "Grossesse possible"));
    puces.replaceChildren(...l);
    const p = progression(dossier);
    barreProg.firstChild.style.width = p.pourcent + "%";
    barreProg.title = `Complété : ${p.pourcent} %`;
    for (const el of sectionsEl.children) {
      const sid = el.id.replace("sec-", "");
      el._maj && el._maj(p.parSection[sid]);
    }
  }

  function majSuggestions() {
    const l = suggestionsActives(dossier);
    suggestions.replaceChildren(
      ...l.map((s) =>
        h(
          "div",
          { class: "suggestion-carte" },
          h("span", {}, `💡 ${s.message} : ajouter le module « ${s.titre} » ?`),
          h(
            "div",
            {},
            h(
              "button",
              {
                type: "button",
                class: "btn-mini",
                onclick: () => {
                  patient.sugg_ignorees = [...(patient.sugg_ignorees || []), s.module];
                  sauver();
                  majSuggestions();
                },
              },
              "Ignorer",
            ),
            h(
              "button",
              {
                type: "button",
                class: "btn-mini primaire",
                onclick: () => env.ecrire("motifs", [...(patient.v.motifs || []), s.module]),
              },
              "Ajouter",
            ),
          ),
        ),
      ),
    );
  }

  // ---------- Navigation ----------
  function basculer(sid, forcer) {
    const el = document.getElementById("sec-" + sid);
    if (!el) return;
    const ouvrir = forcer ?? !ouvertes.has(sid);
    if (ouvrir) ouvertes.add(sid);
    else ouvertes.delete(sid);
    el.classList.toggle("ouverte", ouvrir);
  }

  function allerAuChamp(cible) {
    let el = [...main.querySelectorAll(`[data-id="${cible}"]`)].find((e) => !e.hidden) || main.querySelector(`[data-id="${cible}"]`);
    let section = el ? el.closest(".section") : document.getElementById("sec-" + cible);
    if (!section) return;
    basculer(section.id.replace("sec-", ""), true);
    const det = el && el.closest("details");
    if (det) det.open = true;
    const cibleEl = el || section;
    setTimeout(() => {
      cibleEl.scrollIntoView({ behavior: "smooth", block: "center" });
      cibleEl.classList.add("flash");
      setTimeout(() => cibleEl.classList.remove("flash"), 1600);
    }, 60);
  }

  function ouvrirSommaire() {
    const f = ouvrirFeuille({ titre: "Sections" });
    const p = progression(dossier);
    for (const s of dossier.form.sections) {
      const el = document.getElementById("sec-" + s.id);
      if (!el || el.hidden) continue;
      const ps = p.parSection[s.id];
      const compte = s.special === "gestes" ? patient.gestes.length : s.special === "reevaluation" ? patient.reevals.length : null;
      f.corps.append(
        h(
          "button",
          {
            type: "button",
            class: "ligne-sommaire",
            onclick: () => {
              f.fermer();
              setTimeout(() => allerAuChamp(s.id), 200);
            },
          },
          h("span", {}, `${s.icone} ${s.titre}`),
          ps && ps.anomalie ? h("span", { class: "pastille-ano" }) : null,
          h("span", { class: "section-prog" + (ps && ps.total && ps.faits === ps.total ? " complet" : "") }, compte !== null ? String(compte) : ps && ps.total ? `${ps.faits}/${ps.total}` : ""),
        ),
      );
    }
  }

  function generer() {
    sauver.maintenant();
    dossier.rafraichir();
    const manques = verifierChecklist(dossier);
    if (!manques.length) return aller(`#/p/${id}/obs`);
    const f = ouvrirFeuille({ titre: "Avant de générer" });
    f.corps.append(h("p", { class: "aide" }, `${manques.length} élément(s) important(s) manquant(s) pour ce patient. Touche un élément pour le compléter.`));
    for (const r of manques) {
      f.corps.append(
        h(
          "button",
          {
            type: "button",
            class: "ligne-manque",
            onclick: () => {
              f.fermer();
              setTimeout(() => allerAuChamp(r.aller), 200);
            },
          },
          "⚠ ",
          r.message,
        ),
      );
    }
    f.pied.append(
      h("button", { type: "button", class: "btn", onclick: () => f.fermer() }, "Compléter"),
      h("button", { type: "button", class: "btn btn-primaire", onclick: () => aller(`#/p/${id}/obs`) }, "Générer quand même"),
    );
  }

  function menu() {
    const f = ouvrirFeuille({ titre: patient.v.initiales || "Patient" });
    f.corps.append(
      h("button", { type: "button", class: "ligne-sommaire", onclick: () => aller(`#/p/${id}/obs`) }, "📄 Voir l'observation"),
      h(
        "button",
        {
          type: "button",
          class: "ligne-sommaire danger",
          onclick: async () => {
            if (!(await confirmer("Supprimer définitivement ce patient du téléphone ?", { ok: "Supprimer", danger: true }))) return;
            S.supprimer(id);
            aller("#/");
          },
        },
        "🗑 Supprimer ce patient",
      ),
    );
  }

  rendreTout();
  if (params.get("champ")) setTimeout(() => allerAuChamp(params.get("champ")), 150);

  return () => {
    sauver.maintenant();
    window.removeEventListener("pagehide", quitter);
    window.removeEventListener("obs:sauver", quitter);
    document.removeEventListener("visibilitychange", quitter);
  };
}
