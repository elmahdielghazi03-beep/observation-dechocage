// Mini-langage des conditions « si » utilisé dans les fichiers de configuration.
//
//   "age_ans < 15"                         comparaisons : == != < <= > >=
//   "sexe == 'F' && age_ans >= 12"         logique : && || !   arithmétique : + - * /
//   "motif('coma')"                        fonctions fournies par le contexte
//   "coche('lutte', 'tirage_ic')"          (voir js/engine/contexte.js)
//
// Pas d'eval : la chaîne est découpée, analysée puis transformée en fonction.
// Une donnée absente rend toute comparaison fausse (ex. "pas < 90" est faux si la PA est vide).

const cache = new Map();

export function compiler(src) {
  if (src === undefined || src === null || src === "") return () => true;
  if (typeof src === "boolean") return () => src;
  if (typeof src === "function") return src;
  const cle = String(src);
  let fn = cache.get(cle);
  if (!fn) {
    fn = analyser(cle);
    cache.set(cle, fn);
  }
  return fn;
}

export function evaluer(src, ctx) {
  try {
    return compiler(src)(ctx);
  } catch (e) {
    console.warn(`Condition invalide « ${src} » : ${e.message}`);
    return undefined;
  }
}

function decouper(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1]))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      toks.push({ t: "num", v: parseFloat(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j++;
      if (j >= src.length) throw new Error("guillemet non fermé");
      toks.push({ t: "str", v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    const deux = src.slice(i, i + 2);
    if (["&&", "||", "==", "!=", "<=", ">="].includes(deux)) {
      toks.push({ t: "op", v: deux });
      i += 2;
      continue;
    }
    if ("<>!()+-*/,".includes(c)) {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error(`caractère inattendu « ${c} »`);
  }
  return toks;
}

const vide = (x) => x === undefined || x === null || x === "" || Number.isNaN(x);
const comparer = (f) => (a, b) => (vide(a) || vide(b) ? false : f(Number(a), Number(b)));
const egal = (a, b) => {
  if (vide(a) && vide(b)) return true;
  if (vide(a) || vide(b)) return false;
  // eslint-disable-next-line eqeqeq
  return a == b;
};
const OPS_CMP = {
  "==": egal,
  "!=": (a, b) => !egal(a, b),
  "<": comparer((a, b) => a < b),
  "<=": comparer((a, b) => a <= b),
  ">": comparer((a, b) => a > b),
  ">=": comparer((a, b) => a >= b),
};
const nombre = (x) => (vide(x) ? NaN : Number(x));

function analyser(src) {
  const toks = decouper(src);
  let p = 0;
  const est = (v) => toks[p] && toks[p].t === "op" && toks[p].v === v;
  const prendre = (v) => {
    if (!est(v)) throw new Error(`« ${v} » attendu`);
    p++;
  };

  function ou() {
    let g = et();
    while (est("||")) {
      p++;
      const a = g, b = et();
      g = (c) => a(c) || b(c);
    }
    return g;
  }
  function et() {
    let g = non();
    while (est("&&")) {
      p++;
      const a = g, b = non();
      g = (c) => a(c) && b(c);
    }
    return g;
  }
  function non() {
    if (est("!")) {
      p++;
      const a = non();
      return (c) => !a(c);
    }
    return comparaison();
  }
  function comparaison() {
    let g = addition();
    while (toks[p] && toks[p].t === "op" && OPS_CMP[toks[p].v]) {
      const f = OPS_CMP[toks[p++].v];
      const a = g, b = addition();
      g = (c) => f(a(c), b(c));
    }
    return g;
  }
  function addition() {
    let g = produit();
    while (est("+") || est("-")) {
      const op = toks[p++].v;
      const a = g, b = produit();
      g = op === "+" ? (c) => nombre(a(c)) + nombre(b(c)) : (c) => nombre(a(c)) - nombre(b(c));
    }
    return g;
  }
  function produit() {
    let g = unaire();
    while (est("*") || est("/")) {
      const op = toks[p++].v;
      const a = g, b = unaire();
      g = op === "*" ? (c) => nombre(a(c)) * nombre(b(c)) : (c) => nombre(a(c)) / nombre(b(c));
    }
    return g;
  }
  function unaire() {
    if (est("-")) {
      p++;
      const a = unaire();
      return (c) => -nombre(a(c));
    }
    if (est("!")) return non();
    return primaire();
  }
  function primaire() {
    const t = toks[p];
    if (!t) throw new Error("expression incomplète");
    if (t.t === "num" || t.t === "str") {
      p++;
      const v = t.v;
      return () => v;
    }
    if (est("(")) {
      p++;
      const g = ou();
      prendre(")");
      return g;
    }
    if (t.t === "id") {
      p++;
      if (t.v === "true") return () => true;
      if (t.v === "false") return () => false;
      if (t.v === "null") return () => null;
      if (est("(")) {
        p++;
        const args = [];
        if (!est(")")) {
          args.push(ou());
          while (est(",")) {
            p++;
            args.push(ou());
          }
        }
        prendre(")");
        const nom = t.v;
        return (c) => {
          const f = c.fn && c.fn[nom];
          if (!f) throw new Error(`fonction inconnue « ${nom} »`);
          return f(...args.map((a) => a(c)));
        };
      }
      const nom = t.v;
      return (c) => c.get(nom);
    }
    throw new Error(`symbole inattendu « ${t.v} »`);
  }

  const g = ou();
  if (p < toks.length) throw new Error(`symbole inattendu « ${toks[p].v} »`);
  return g;
}
