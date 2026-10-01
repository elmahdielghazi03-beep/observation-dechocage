// Démarrage de l'application : chargement des configurations, navigation, thème, hors-ligne.

import { chargerRegistre } from "./engine/registre.js";
import * as S from "./store.js";
import { h } from "./ui/dom.js";
import { ecranAccueil, ecranNouveau, rappelSuppression } from "./ui/accueil.js";
import { ecranDossier } from "./ui/dossier.js";
import { ecranSortie } from "./ui/sortie.js";

const racine = document.getElementById("app");

let R;
try {
  R = chargerRegistre();
} catch (e) {
  racine.replaceChildren(
    h(
      "div",
      { class: "erreur-config" },
      h("h1", {}, "Erreur dans un fichier de configuration"),
      h("p", {}, "Vérifie la dernière modification (virgule ou guillemet manquant ?)."),
      h("pre", {}, String(e && e.stack ? e.stack : e)),
    ),
  );
  throw e;
}

const app = {
  R,
  reglages: S.reglages({ theme: R.app.theme, suppression_auto_jours: R.app.suppression_auto_jours }),
  appliquerTheme() {
    document.documentElement.dataset.theme = app.reglages.theme;
    const sombre = app.reglages.theme === "sombre" || (app.reglages.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", sombre ? "#0e1116" : "#f5f6f8");
  },
};
app.appliquerTheme();

// ---------- Navigation (#/ , #/nouveau , #/p/<id> , #/p/<id>/obs) ----------
let nettoyage = null;
function route() {
  if (nettoyage) {
    nettoyage();
    nettoyage = null;
  }
  const [chemin, requete] = (location.hash.replace(/^#/, "") || "/").split("?");
  const params = new URLSearchParams(requete || "");
  const m = chemin.match(/^\/p\/([\w-]+)(\/obs)?$/);
  window.scrollTo(0, 0);
  if (chemin === "/nouveau") ecranNouveau(racine, app);
  else if (m && m[2]) ecranSortie(racine, app, m[1], params);
  else if (m) nettoyage = ecranDossier(racine, app, m[1], params) || null;
  else ecranAccueil(racine, app);
}
window.addEventListener("hashchange", route);
route();

S.demanderPersistance();
if (!location.hash || location.hash === "#/") setTimeout(() => rappelSuppression(app), 400);

// ---------- Hors ligne et mises à jour (voir sw.js) ----------
let rechargementDemande = false;

function versionDe(worker) {
  return new Promise((resoudre) => {
    if (!worker) return resoudre(null);
    const canal = new MessageChannel();
    const t = setTimeout(() => resoudre(null), 1500);
    canal.port1.onmessage = (e) => {
      clearTimeout(t);
      resoudre(e.data);
    };
    worker.postMessage({ type: "version" }, [canal.port2]);
  });
}

app.versionInstallee = () => versionDe(navigator.serviceWorker && navigator.serviceWorker.controller);
app.versionEnAttente = () => versionDe(app.sw && app.sw.waiting);
app.rechercherMiseAJour = async () => {
  if (!app.sw) return "indisponible";
  await app.sw.update();
  return app.sw.installing || app.sw.waiting ? "trouvee" : "aucune";
};
app.recharger = () => {
  const w = app.sw && app.sw.waiting;
  window.dispatchEvent(new Event("obs:sauver")); // enregistre le dossier ouvert avant de recharger
  rechargementDemande = true;
  if (w) {
    w.postMessage({ type: "activer" });
    setTimeout(() => location.reload(), 4000); // secours si l'activation tarde
  } else location.reload();
};

async function proposerMiseAJour() {
  if (document.querySelector(".maj")) return;
  const v = await app.versionEnAttente();
  const b = h(
    "div",
    { class: "maj", role: "status" },
    h("span", {}, `Nouvelle version disponible${v ? " (" + v + ")" : ""}`),
    h("button", { type: "button", class: "btn-mini", onclick: app.recharger }, "Recharger"),
    h("button", { type: "button", class: "btn-mini fermer", "aria-label": "Plus tard", onclick: () => b.remove() }, "✕"),
  );
  document.body.append(b);
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker
    .register("./sw.js", { updateViaCache: "none" })
    .then((reg) => {
      app.sw = reg;
      const surveiller = (w) =>
        w &&
        w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) proposerMiseAJour();
        });
      if (reg.waiting && navigator.serviceWorker.controller) proposerMiseAJour();
      surveiller(reg.installing);
      reg.addEventListener("updatefound", () => surveiller(reg.installing));
      // Vérifie aussi quand l'app revient au premier plan (au plus toutes les 10 min) et toutes les heures
      let derniere = Date.now();
      const verifier = () => {
        derniere = Date.now();
        reg.update().catch(() => {});
      };
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && Date.now() - derniere > 10 * 60 * 1000) verifier();
      });
      setInterval(verifier, 60 * 60 * 1000);
    })
    .catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (rechargementDemande) location.reload();
  });
}
