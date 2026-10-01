// Outils de rédaction : modèles de phrases, accords, nombres, heures, listes.
//
// Syntaxe des modèles (fichiers de config) :
//   {champ}       texte de la valeur du champ (ou d'une variable calculée)
//   {@champ}      phrase complète du champ (sa « phrase » configurée)
//   {^@champ}     idem, avec majuscule initiale
//   {delai:champ} délai entre l'heure du champ et l'admission (« 50 min »)
//   [ … ]         segment optionnel : supprimé si une donnée qu'il contient manque
//   {e} {Sujet} {Le_patient} {le_patient} {du_patient} {Il} {il} : accords selon le sexe et l'âge
//   {es} : accord avec le nom « sujet » (« le nourrisson » reste masculin, « la patiente » est féminin)

// Marqueurs internes d'anomalie (convertis en gras rouge ou en « ⚠ »)
export const DEB = "";
export const FIN = "";

export const sansMarques = (t) => String(t ?? "").replaceAll(DEB, "").replaceAll(FIN, "");
export const marquer = (t) => (t ? DEB + sansMarques(t) + FIN : t);

const GENRE = new Set(["e", "es", "Il", "il", "Sujet", "sujet", "Le_patient", "le_patient", "du_patient"]);
export const estJetonGenre = (nom) => GENRE.has(nom);

export function rendre(modele, resoudre) {
  const src = String(modele ?? "");
  let i = 0;
  function segment(fin) {
    let out = "";
    let manque = false;
    let places = 0;
    let remplis = 0;
    while (i < src.length) {
      const c = src[i];
      if (fin && c === fin) {
        i++;
        break;
      }
      if (c === "[") {
        i++;
        const r = segment("]");
        places++;
        if (!r.manque && !(r.places > 0 && r.remplis === 0)) {
          out += r.out;
          remplis++;
        }
        continue;
      }
      if (c === "{") {
        const j = src.indexOf("}", i);
        if (j < 0) {
          out += src.slice(i);
          i = src.length;
          break;
        }
        const nom = src.slice(i + 1, j);
        i = j + 1;
        places++;
        const v = GENRE.has(nom) ? `{${nom}}` : resoudre(nom);
        if (v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v))) manque = true;
        else {
          out += v;
          remplis++;
        }
        continue;
      }
      out += c;
      i++;
    }
    return { out, manque, places, remplis };
  }
  return segment(null).out;
}

// Accords : remplace {e}, {Sujet}… selon le sexe et la tranche d'âge.
export function accorder(texte, sexe, tranche) {
  const F = sexe === "F";
  const nn = tranche === "nouveau_ne", nour = tranche === "nourrisson", enf = tranche === "enfant";
  const sujet = nn ? "Nouveau-né" : nour ? "Nourrisson" : enf ? "Enfant" : F ? "Patiente" : "Patient";
  const le = nn ? "Le nouveau-né" : nour ? "Le nourrisson" : enf ? "L'enfant" : F ? "La patiente" : "Le patient";
  const du = nn ? "du nouveau-né" : nour ? "du nourrisson" : enf ? "de l'enfant" : F ? "de la patiente" : "du patient";
  const table = {
    e: F ? "e" : "",
    es: F && !nn && !nour ? "e" : "",
    Il: F ? "Elle" : "Il",
    il: F ? "elle" : "il",
    Sujet: sujet,
    sujet: sujet.toLowerCase(),
    Le_patient: le,
    le_patient: le.charAt(0).toLowerCase() + le.slice(1),
    du_patient: du,
  };
  return String(texte ?? "").replace(/\{(e|es|Il|il|Sujet|sujet|Le_patient|le_patient|du_patient)\}/g, (_, k) => table[k]);
}

export function minuscule1(t) {
  t = String(t ?? "");
  const mot = t.split(/[\s,;:()/]/)[0];
  if (/[A-Z0-9]/.test(mot.slice(1))) return t; // sigle ou symbole : HTA, SpO2, PaCO2…
  return t.charAt(0).toLowerCase() + t.slice(1);
}

export function majuscule(t) {
  t = String(t ?? "");
  for (let k = 0; k < t.length; k++) {
    const c = t[k];
    if (c === DEB || c === FIN || c === " " || c === "⚠") continue;
    if (/[A-Z]/.test(t[k + 1] || "") && c === c.toLowerCase()) return t; // « eFAST », « pH » restent tels quels
    return t.slice(0, k) + c.toUpperCase() + t.slice(k + 1);
  }
  return t;
}

const finit = (t, re) => re.test(sansMarques(t).trimEnd());

// Assemble des fragments en phrases : « a, b, c. » ; un fragment « nouvelle » commence une phrase.
export function assembler(frags, prefixe = "") {
  let out = "";
  for (const f of frags) {
    const t = typeof f === "string" ? f : f.t;
    const nouvelle = typeof f === "object" && f.nouvelle;
    if (!t) continue;
    if (!out) {
      out = t;
    } else if (nouvelle || finit(out, /[.!?]$/)) {
      out += (finit(out, /[.!?]$/) ? " " : ". ") + majuscule(t);
    } else {
      out += ", " + t;
    }
  }
  if (!out) return "";
  if (!finit(out, /[.!?]$/)) out += ".";
  // Après « Titre : » on garde la minuscule ; sinon (début de paragraphe, « A — ») majuscule
  return /:\s*$/.test(prefixe) ? prefixe + out : prefixe + majuscule(out);
}

// Majuscule en début de phrase dans un texte déjà rendu (après « . »)
export function phrases(t) {
  return majuscule(String(t).replace(/([.!?]\s+)([]*)([a-zàâäéèêëîïôöùûüç])(?![A-Z])/g, (_, a, m, c) => a + m + c.toUpperCase()));
}

export function listeFr(items, liaison = "et") {
  const l = items.filter((x) => x !== undefined && x !== null && x !== "");
  if (l.length <= 1) return l[0] ?? "";
  if (liaison === ";") return l.join(" ; ");
  return l.slice(0, -1).join(", ") + ` ${liaison} ` + l[l.length - 1];
}

export function nombre(n, dec = 2) {
  if (n === undefined || n === null || n === "" || Number.isNaN(Number(n))) return "";
  return Number(n)
    .toLocaleString("fr-FR", { maximumFractionDigits: dec, minimumFractionDigits: 0 })
    .replace(/[  ]/g, " ");
}

export function parseNombre(s) {
  if (s === undefined || s === null) return undefined;
  const t = String(s).replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === "-" || t === ".") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

// ---- Heures (format stocké : "AAAA-MM-JJTHH:MM", heure locale) ----
const pad = (n) => String(n).padStart(2, "0");
export const dtLocal = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
export function parseDT(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
}
export const heureTexte = (d) => (d ? `${pad(d.getHours())}h${pad(d.getMinutes())}` : "");
export const dateTexte = (d) => (d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : "");
export const memeJour = (a, b) => a && b && a.toDateString() === b.toDateString();

// « 50 min », « 4 h 20 », « 3 j »
export function duree(minutes) {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) return "";
  const m = Math.round(Math.abs(minutes));
  if (m < 60) return `${m} min`;
  if (m < 48 * 60) {
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${pad(r)}` : `${h} h`;
  }
  return `${Math.round(m / 1440)} j`;
}
export const minutesEntre = (a, b) => (a && b ? (b.getTime() - a.getTime()) / 60000 : undefined);

// Texte d'une heure : « à 13h30 » (même jour que la référence) ou « le 30/09/2026 à 13h30 »
export function heureRelative(s, reference, complet = false) {
  const d = parseDT(s);
  if (!d) return "";
  if (!complet && reference && memeJour(d, reference)) return `à ${heureTexte(d)}`;
  return `le ${dateTexte(d)} à ${heureTexte(d)}`;
}

export function ilya(s, maintenant = new Date()) {
  const d = parseDT(s);
  if (!d) return "";
  const m = minutesEntre(d, maintenant);
  if (m < -1) return `dans ${duree(-m)}`;
  if (m < 1) return "à l'instant";
  return `il y a ${duree(m)}`;
}

// ---- Rendu final ----
const echapper = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export const versHTML = (t) => echapper(t).replaceAll(DEB, '<strong class="ano">').replaceAll(FIN, "</strong>");
export const versTexte = (t) => String(t).replaceAll(DEB, "⚠ ").replaceAll(FIN, "");
