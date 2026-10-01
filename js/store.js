// Sauvegarde locale : chaque patient est enregistré dans le stockage du navigateur du téléphone.
// Rien n'est envoyé sur Internet.

const P = "obsdc:p:";
const REGLAGES = "obsdc:reglages";

export const nouvelId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function lister() {
  const l = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(P)) continue;
      try {
        l.push(JSON.parse(localStorage.getItem(k)));
      } catch {
        /* entrée illisible ignorée */
      }
    }
  } catch {
    return [];
  }
  return l.filter(Boolean).sort((a, b) => String(b.cree).localeCompare(String(a.cree)));
}

export function lire(id) {
  try {
    const t = localStorage.getItem(P + id);
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

export function ecrire(p) {
  p.modifie = new Date().toISOString();
  try {
    localStorage.setItem(P + p.id, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function supprimer(id) {
  try {
    localStorage.removeItem(P + id);
  } catch {
    /* rien */
  }
}

export function toutEffacer() {
  for (const p of lister()) supprimer(p.id);
}

export function reglages(defauts) {
  try {
    return { ...defauts, ...JSON.parse(localStorage.getItem(REGLAGES) || "{}") };
  } catch {
    return { ...defauts };
  }
}

export function sauverReglages(r) {
  try {
    localStorage.setItem(REGLAGES, JSON.stringify(r));
  } catch {
    /* rien */
  }
}

// Demande au navigateur de ne pas effacer les données en cas de manque de place
export async function demanderPersistance() {
  try {
    if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
  } catch {
    /* non supporté */
  }
}
