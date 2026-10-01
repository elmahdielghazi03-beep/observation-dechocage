// Écrans « liste des patients », « nouveau patient » et réglages.

import { h, ouvrirFeuille, aller, confirmer, toast } from "./dom.js";
import { rendreChamp } from "./widgets.js";
import * as C from "../engine/champs.js";
import * as T from "../engine/texte.js";
import { Dossier } from "../engine/contexte.js";
import { progression } from "../engine/checklist.js";
import * as S from "../store.js";

const JOUR = 24 * 3600 * 1000;

export function echeances(app) {
  const jours = Number(app.reglages.suppression_auto_jours) || 0;
  if (!jours) return { expires: [], bientot: [] };
  const maintenant = Date.now();
  const expires = [];
  const bientot = [];
  for (const p of S.lister()) {
    const age = maintenant - new Date(p.cree).getTime();
    const reporte = p.report_suppression && maintenant < new Date(p.report_suppression).getTime();
    if (age >= jours * JOUR && !reporte) expires.push(p);
    else if (age >= (jours - 1) * JOUR) bientot.push({ p, reste: Math.max(0, jours * JOUR - age) });
  }
  return { expires, bientot };
}

// ---------------------------------------------------------------- Liste
export function ecranAccueil(racine, app) {
  const patients = S.lister();
  const { bientot } = echeances(app);
  const liste = h("div", { class: "liste-patients" });
  for (const p of patients) {
    const d = new Dossier(p, app.R);
    const ctx = d.ctx;
    const prog = progression(d);
    const adm = T.parseDT(p.v.admission);
    const motifs = d.modulesActifs().map((m) => `${m.icone} ${m.titre}`);
    const exp = bientot.find((b) => b.p.id === p.id);
    liste.append(
      h(
        "button",
        { type: "button", class: "carte-patient", onclick: () => aller(`#/p/${p.id}`) },
        h("span", { class: "avatar" + (p.v.sexe === "F" ? " f" : "") }, (p.v.initiales || "?").replace(/\W/g, "").slice(0, 3) || "?"),
        h(
          "span",
          { class: "carte-infos" },
          h("strong", {}, [p.v.initiales || "Sans initiales", ctx.get("age_texte"), p.v.sexe, p.v.box ? "box " + p.v.box : null].filter(Boolean).join(" · ")),
          h("span", { class: "carte-motifs" }, motifs.join(" · ") || "Motif non renseigné"),
          h(
            "span",
            { class: "carte-meta" },
            adm ? `Admis ${T.dateTexte(adm) === T.dateTexte(new Date()) ? "aujourd'hui" : "le " + T.dateTexte(adm)} à ${T.heureTexte(adm)}` : "",
            exp ? h("span", { class: "expire" }, ` · suppression dans ${T.duree(exp.reste / 60000)}`) : null,
          ),
          h("span", { class: "mini-prog" }, h("span", { style: { width: prog.pourcent + "%" } })),
        ),
      ),
    );
  }

  const bandeauExp = bientot.length
    ? h(
        "div",
        { class: "info alerte" },
        `⏳ ${bientot.length} dossier(s) seront supprimés automatiquement dans moins de 24 h. Exporte-les en PDF si besoin (ouvre le dossier → Observation → PDF).`,
      )
    : null;

  const vide = h(
    "div",
    { class: "accueil-vide" },
    h("div", { class: "grand-icone" }, "🩺"),
    h("p", {}, "Aucun patient pour l'instant."),
    h("p", { class: "aide" }, "Touche « Nouveau patient » pour commencer, ou charge les patients de démonstration pour essayer l'app."),
    h("button", { type: "button", class: "btn", onclick: () => chargerDemos(app) }, "Charger les patients de démonstration"),
  );

  racine.replaceChildren(
    h(
      "div",
      { class: "ecran" },
      h(
        "header",
        { class: "barre-haut" },
        h("div", { class: "barre-titre" }, h("strong", {}, "Observation Déchocage"), h("span", {}, `${patients.length} patient(s) sur ce téléphone`)),
        h("button", { type: "button", class: "btn-icone", "aria-label": "Réglages", onclick: () => ouvrirReglages(app) }, "⚙"),
      ),
      h("main", { class: "contenu" }, bandeauExp, patients.length ? liste : vide),
      h("div", { class: "barre-bas simple" }, h("button", { type: "button", class: "btn btn-primaire btn-large", onclick: () => aller("#/nouveau") }, "+ Nouveau patient")),
    ),
  );
}

// ---------------------------------------------------------------- Suppression automatique
export function rappelSuppression(app) {
  const { expires } = echeances(app);
  if (!expires.length) return;
  const f = ouvrirFeuille({ titre: "Suppression automatique" });
  const jours = app.reglages.suppression_auto_jours;
  f.corps.append(
    h("p", {}, `${expires.length} dossier(s) ont plus de ${jours} jours. Exporte-les en PDF si tu en as besoin, puis supprime-les.`),
    ...expires.map((p) =>
      h(
        "div",
        { class: "ligne-export" },
        h("span", {}, `${p.v.initiales || "?"} — créé le ${T.dateTexte(new Date(p.cree))}`),
        h("button", { type: "button", class: "btn-mini", onclick: () => aller(`#/p/${p.id}/obs?imprimer=1`) }, "Exporter en PDF"),
      ),
    ),
  );
  f.pied.append(
    h(
      "button",
      {
        type: "button",
        class: "btn",
        onclick: () => {
          const demain = new Date(Date.now() + JOUR).toISOString();
          for (const p of expires) {
            p.report_suppression = demain;
            S.ecrire(p);
          }
          f.fermer();
          toast("Suppression reportée de 24 h");
        },
      },
      "Reporter 24 h",
    ),
    h(
      "button",
      {
        type: "button",
        class: "btn btn-danger",
        onclick: () => {
          for (const p of expires) S.supprimer(p.id);
          f.fermer();
          toast(`${expires.length} dossier(s) supprimé(s)`);
          setTimeout(() => window.dispatchEvent(new HashChangeEvent("hashchange")), 250);
        },
      },
      "Supprimer maintenant",
    ),
  );
}

// ---------------------------------------------------------------- Démo
function dater(x, jour) {
  if (typeof x === "string" && /^T\d\d:\d\d$/.test(x)) return jour + x;
  if (Array.isArray(x)) return x.map((y) => dater(y, jour));
  if (x && typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, dater(v, jour)]));
  return x;
}

export function chargerDemos(app) {
  const jour = T.dtLocal().slice(0, 10);
  for (const d of app.R.demo) {
    const p = dater(structuredClone(d), jour);
    p.id = S.nouvelId();
    p.format = 1;
    p.cree = new Date().toISOString();
    p.demo = true;
    S.ecrire(p);
  }
  toast("Patients de démonstration chargés");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

// ---------------------------------------------------------------- Nouveau patient
export function ecranNouveau(racine, app) {
  const patient = { id: S.nouvelId(), format: 1, cree: new Date().toISOString(), v: {}, gestes: [], reevals: [] };
  for (const s of app.R.sections) for (const g of s.groupes || []) for (const c of g.champs || []) if (c.defaut !== undefined) patient.v[c.id] = c.defaut;
  const dossier = new Dossier(patient, app.R);
  let liaisons = [];
  const maj = () => {
    dossier.rafraichir();
    for (const f of liaisons) f(dossier.ctx);
  };
  const env = {
    val: (k) => patient.v[k],
    ecrire(k, v) {
      if (C.estVide(v)) delete patient.v[k];
      else patient.v[k] = v;
      maj();
    },
    ecrireLot(lot) {
      for (const [k, v] of Object.entries(lot)) {
        if (C.estVide(v)) delete patient.v[k];
        else patient.v[k] = v;
      }
      maj();
    },
    ctx: () => dossier.ctx,
    lier: (f) => liaisons.push(f),
    geste: () => {},
    gestes: () => [],
  };
  const def = (k) => dossier.index.champs[k].find((d) => !d.si) || dossier.index.champs[k][0];
  const champ = (k, extra = {}) => rendreChamp({ ...def(k), ...extra, si: undefined, _groupe: undefined }, env);

  const creer = () => {
    patient.v.admission = patient.v.admission || T.dtLocal();
    patient.cree = new Date().toISOString();
    if (!S.ecrire(patient)) return toast("⚠ Sauvegarde impossible");
    location.replace(`#/p/${patient.id}`); // « retour » ramènera à la liste, pas à un formulaire vide
  };

  racine.replaceChildren(
    h(
      "div",
      { class: "ecran" },
      h(
        "header",
        { class: "barre-haut" },
        h("button", { type: "button", class: "btn-icone", "aria-label": "Annuler", onclick: () => aller("#/") }, "‹"),
        h("div", { class: "barre-titre" }, h("strong", {}, "Nouveau patient"), h("span", {}, "Le reste se remplit dans le dossier")),
      ),
      h(
        "main",
        { class: "contenu nouveau" },
        h(
          "div",
          { class: "groupe" },
          champ("initiales"),
          h("div", { class: "ligne-age" }, champ("age"), champ("age_unite", { label: "Unité" })),
          champ("sexe"),
          champ("motifs", { label: "Motif(s) — tu pourras en ajouter plus tard" }),
          champ("box"),
        ),
        h("p", { class: "aide" }, "Initiales uniquement. L'heure d'admission est notée automatiquement (modifiable)."),
      ),
      h("div", { class: "barre-bas simple" }, h("button", { type: "button", class: "btn btn-primaire btn-large", onclick: creer }, "Créer le dossier")),
    ),
  );
  maj();
}

// ---------------------------------------------------------------- Version et mises à jour
function blocVersion(app) {
  const etat = h("p", { class: "version-etat" }, "Version : …");
  const actions = h("div", { class: "version-actions" });
  const maj = async () => {
    const [installee, attente] = await Promise.all([app.versionInstallee?.(), app.versionEnAttente?.()]);
    etat.replaceChildren(h("strong", {}, `Version installée : ${installee ?? "inconnue (première ouverture ou mode test)"}`));
    actions.replaceChildren();
    if (attente) {
      etat.append(h("span", {}, ` — nouvelle version ${attente} prête`));
      actions.append(h("button", { type: "button", class: "btn btn-primaire", onclick: () => app.recharger() }, "Recharger maintenant"));
    } else if (app.sw) {
      actions.append(
        h(
          "button",
          {
            type: "button",
            class: "btn",
            onclick: async (e) => {
              e.target.disabled = true;
              e.target.textContent = "Recherche…";
              let r = "erreur";
              try {
                r = await app.rechercherMiseAJour();
              } catch {
                r = "erreur";
              }
              toast(
                r === "trouvee"
                  ? "Nouvelle version en cours de téléchargement : le bandeau « Recharger » apparaîtra"
                  : r === "aucune"
                    ? "Tu as déjà la dernière version"
                    : "Recherche impossible (pas de connexion ?)",
                3500,
              );
              setTimeout(maj, 1500);
            },
          },
          "Rechercher une mise à jour",
        ),
      );
    }
  };
  maj();
  return h("div", { class: "champ bloc-version" }, h("div", { class: "champ-label" }, "Application"), etat, actions);
}

// ---------------------------------------------------------------- Réglages
export function ouvrirReglages(app) {
  const f = ouvrirFeuille({ titre: "Réglages" });
  const r = app.reglages;
  const choix = (label, cle, options) => {
    const box = h("div", { class: "options" });
    const maj = () => {
      for (const b of box.children) b.classList.toggle("sel", String(r[cle]) === b.dataset.v);
    };
    for (const [v, l] of options) {
      box.append(
        h(
          "button",
          {
            type: "button",
            class: "opt",
            "data-v": String(v),
            onclick: () => {
              r[cle] = v;
              S.sauverReglages(r);
              app.appliquerTheme();
              maj();
            },
          },
          l,
        ),
      );
    }
    maj();
    return h("div", { class: "champ" }, h("div", { class: "champ-label" }, label), box);
  };
  f.corps.append(
    choix("Thème", "theme", [
      ["sombre", "Sombre"],
      ["clair", "Clair"],
      ["auto", "Comme le téléphone"],
    ]),
    choix("Suppression automatique des dossiers", "suppression_auto_jours", [
      [1, "Après 24 h"],
      [7, "Après 7 jours"],
      [30, "Après 30 jours"],
      [0, "Jamais"],
    ]),
    h("button", { type: "button", class: "ligne-sommaire", onclick: () => (f.fermer(), chargerDemos(app)) }, "🧪 Charger les patients de démonstration"),
    h(
      "button",
      {
        type: "button",
        class: "ligne-sommaire danger",
        onclick: async () => {
          if (!(await confirmer("Effacer TOUS les patients de ce téléphone ? Cette action est définitive.", { ok: "Tout effacer", danger: true }))) return;
          S.toutEffacer();
          toast("Tous les dossiers ont été effacés");
          aller("#/");
          setTimeout(() => window.dispatchEvent(new HashChangeEvent("hashchange")), 300);
        },
      },
      "🗑 Effacer tous les patients",
    ),
    blocVersion(app),
    h(
      "div",
      { class: "a-propos" },
      h("p", {}, "Aide à la rédaction : l'application met en forme tes saisies, n'ajoute aucune information et ne pose aucun diagnostic. Les doses sont celles que tu saisis : elles ne sont pas vérifiées."),
      h("p", {}, "Confidentialité : initiales uniquement, aucune donnée envoyée sur Internet. Tout reste dans ce téléphone ; désinstaller l'app ou effacer les données de Chrome efface les dossiers."),
    ),
  );
}
