// Écran « Observation » : texte rédigé, copier, PDF (impression), retour au dossier.

import { h, aller, copier, toast, ouvrirFeuille } from "./dom.js";
import * as T from "../engine/texte.js";
import { Dossier } from "../engine/contexte.js";
import { generer, versTexteBrut } from "../engine/generateur.js";
import { verifierChecklist } from "../engine/checklist.js";
import * as S from "../store.js";

export function ecranSortie(racine, app, id, params) {
  const patient = S.lire(id);
  if (!patient) return aller("#/");
  const dossier = new Dossier(patient, app.R);
  const obs = generer(dossier);
  const manques = verifierChecklist(dossier);
  const texte = versTexteBrut(obs);

  const article = h(
    "article",
    { class: "observation" },
    h("h1", {}, obs.titre),
    obs.sousTitre ? h("p", { class: "obs-sous-titre" }, obs.sousTitre) : null,
    obs.sections.map((s) => h("section", {}, h("h2", {}, s.titre), s.paragraphes.map((p) => h("p", { html: T.versHTML(p) })))),
  );

  const bandeau = manques.length
    ? h(
        "button",
        {
          type: "button",
          class: "info alerte bandeau-manques",
          onclick: () => {
            const f = ouvrirFeuille({ titre: "Éléments manquants" });
            for (const r of manques) {
              f.corps.append(h("button", { type: "button", class: "ligne-manque", onclick: () => aller(`#/p/${id}?champ=${encodeURIComponent(r.aller)}`) }, "⚠ ", r.message));
            }
          },
        },
        `⚠ ${manques.length} élément(s) important(s) non renseigné(s) — voir`,
      )
    : null;

  const imprimer = () => {
    const ancien = document.title;
    const adm = T.parseDT(patient.v.admission);
    document.title = `Observation ${patient.v.initiales || ""} ${adm ? T.dateTexte(adm).replaceAll("/", "-") : ""}`.trim();
    window.print();
    setTimeout(() => (document.title = ancien), 1000);
  };

  racine.replaceChildren(
    h(
      "div",
      { class: "ecran" },
      h(
        "header",
        { class: "barre-haut" },
        h("button", { type: "button", class: "btn-icone", "aria-label": "Retour au dossier", onclick: () => aller(`#/p/${id}`) }, "‹"),
        h("div", { class: "barre-titre" }, h("strong", {}, "Observation"), h("span", {}, `${patient.v.initiales || ""} · ⚠ = élément anormal`)),
      ),
      h("main", { class: "contenu sortie" }, bandeau, article),
      h(
        "nav",
        { class: "barre-bas" },
        h(
          "button",
          {
            type: "button",
            onclick: async () => toast((await copier(texte)) ? "Observation copiée (texte brut, anomalies marquées ⚠)" : "Copie impossible sur ce navigateur"),
          },
          h("span", { class: "ico" }, "⧉"),
          "Copier",
        ),
        h("button", { type: "button", onclick: imprimer }, h("span", { class: "ico" }, "⎙"), "PDF"),
        h("button", { type: "button", class: "principal", onclick: () => aller(`#/p/${id}`) }, h("span", { class: "ico" }, "✎"), "Modifier"),
      ),
    ),
  );
  window.scrollTo(0, 0);
  if (params.get("imprimer")) setTimeout(imprimer, 400);
}
