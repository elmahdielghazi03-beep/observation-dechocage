// Petits outils d'interface : création d'éléments, feuilles (bottom sheets), confirmations, toasts.
// Le bouton « retour » d'Android ferme la feuille ouverte au lieu de quitter l'écran.

export function h(tag, props, ...enfants) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else if (k === "value" || k === "checked" || k === "disabled" || k === "hidden" || k === "open") el[k] = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const e of enfants.flat(Infinity)) {
    if (e === null || e === undefined || e === false) continue;
    el.append(e instanceof Node ? e : String(e));
  }
  return el;
}

export function differer(fn, ms) {
  let t;
  const f = (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
  f.maintenant = () => {
    clearTimeout(t);
    fn();
  };
  return f;
}

// ---------- Toast ----------
let toastT;
export function toast(message, ms = 2200) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("visible"), ms);
}

// ---------- Feuilles (bottom sheets) ----------
const pile = [];
let popIgnore = 0;
let hashEnAttente = null;

window.addEventListener("popstate", () => {
  if (hashEnAttente !== null) {
    const h2 = hashEnAttente;
    hashEnAttente = null;
    location.hash = h2;
    return;
  }
  if (popIgnore > 0) {
    popIgnore--;
    return;
  }
  const f = pile.pop();
  if (f) f._retirer();
});

export function ouvrirFeuille({ titre = "", classe = "", surFermer } = {}) {
  const racine = document.getElementById("feuilles");
  const titreEl = h("h2", { class: "feuille-titre" }, titre);
  const corps = h("div", { class: "feuille-corps" });
  const pied = h("div", { class: "feuille-pied" });
  const fermerBtn = h("button", { type: "button", class: "btn-icone", "aria-label": "Fermer", onclick: () => f.fermer() }, "✕");
  const panneau = h("div", { class: "feuille " + classe, role: "dialog", "aria-modal": "true" }, h("div", { class: "feuille-tete" }, titreEl, fermerBtn), corps, pied);
  const fond = h("div", { class: "feuille-fond", onclick: (e) => e.target === fond && f.fermer() }, panneau);
  racine.append(fond);
  void fond.offsetWidth; // force le calcul de la mise en page pour que l'animation démarre
  fond.classList.add("visible");
  document.body.classList.add("feuille-ouverte");

  const f = {
    el: panneau,
    corps,
    pied,
    titre: (t) => (titreEl.textContent = t),
    _retirer() {
      fond.classList.remove("visible");
      setTimeout(() => fond.remove(), 180);
      if (!pile.length) document.body.classList.remove("feuille-ouverte");
      if (surFermer) surFermer();
    },
    fermer() {
      const i = pile.indexOf(f);
      if (i < 0) return;
      if (i === pile.length - 1) history.back();
      else {
        pile.splice(i, 1);
        f._retirer();
      }
    },
  };
  pile.push(f);
  history.pushState({ feuille: pile.length }, "");
  return f;
}

// Navigue vers un écran en fermant d'abord les feuilles ouvertes
export function aller(hash) {
  if (pile.length) {
    const n = pile.length;
    pile.splice(0).forEach((f) => f._retirer());
    hashEnAttente = hash;
    history.go(-n);
  } else location.hash = hash;
}

export function confirmer(message, { ok = "Confirmer", annuler = "Annuler", danger = false, titre = "Confirmation" } = {}) {
  return new Promise((resoudre) => {
    let reponse = false;
    const f = ouvrirFeuille({ titre, surFermer: () => resoudre(reponse) });
    f.corps.append(h("p", { class: "confirm-texte" }, message));
    f.pied.append(
      h("button", { type: "button", class: "btn", onclick: () => f.fermer() }, annuler),
      h(
        "button",
        {
          type: "button",
          class: "btn " + (danger ? "btn-danger" : "btn-primaire"),
          onclick: () => {
            reponse = true;
            f.fermer();
          },
        },
        ok,
      ),
    );
  });
}

export async function copier(texte) {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    const ta = h("textarea", { style: { position: "fixed", opacity: "0" } });
    ta.value = texte;
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}
