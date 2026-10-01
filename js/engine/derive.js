// Variables calculées à partir des saisies (âge, normes, PAM, index de choc, GCS…).
// Ce ne sont que des calculs : aucune interprétation diagnostique.
// Les seuils viennent de config/normes.js ; les « drapeaux » (conditions cliniques) y sont aussi.

import { evaluer } from "./expr.js";
import * as T from "./texte.js";

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const arrondi = (x, d = 0) => (x === undefined ? undefined : Math.round(x * 10 ** d) / 10 ** d);

export function creerDerives(N, champsPaire = []) {
  const D = {
    // ---- Âge ----
    age_jours: (c) => {
      const a = num(c.get("age"));
      if (a === undefined) return undefined;
      const u = c.get("age_unite") || "ans";
      return u === "jours" ? a : u === "mois" ? a * 30.4375 : a * 365.25;
    },
    age_ans: (c) => {
      const j = c.get("age_jours");
      return j === undefined ? undefined : j / 365.25;
    },
    age_mois: (c) => {
      const j = c.get("age_jours");
      return j === undefined ? undefined : j / 30.4375;
    },
    age_texte: (c) => {
      const a = num(c.get("age"));
      if (a === undefined) return undefined;
      const u = c.get("age_unite") || "ans";
      const n = String(a).replace(".", ",");
      if (u === "jours") return `${n} jour${a > 1 ? "s" : ""}`;
      if (u === "mois") return `${n} mois`;
      return `${n} an${a >= 2 ? "s" : ""}`;
    },
    tranche: (c) => {
      const j = c.get("age_jours");
      if (j === undefined) return undefined;
      for (const t of N.tranches) {
        if (t.age_max_jours !== undefined && j < t.age_max_jours) return t.id;
        if (t.age_max_ans !== undefined && j / 365.25 < t.age_max_ans) return t.id;
        if (t.age_max_jours === undefined && t.age_max_ans === undefined) return t.id;
      }
      return undefined;
    },
    pediatrique: (c) => c.get("age_ans") < N.age_pediatrique,
    femme_procreer: (c) => {
      const a = c.get("age_ans");
      return c.get("sexe") === "F" && a >= N.age_procreer[0] && a <= N.age_procreer[1];
    },

    // ---- Normes des constantes selon l'âge ----
    _bande: (c) => {
      const a = c.get("age_ans");
      if (a === undefined) return N.constantes[N.constantes.length - 1];
      return N.constantes.find((b) => a < b.age_max) || N.constantes[N.constantes.length - 1];
    },
    fc_min: (c) => c.get("_bande").fc?.[0],
    fc_max: (c) => c.get("_bande").fc?.[1],
    fr_min: (c) => c.get("_bande").fr?.[0],
    fr_max: (c) => c.get("_bande").fr?.[1],
    pas_min: (c) => {
      const v = c.get("_bande").pas_min;
      return typeof v === "string" ? evaluer(v, c) : v;
    },
    pas_max: (c) => c.get("_bande").pas_max,
    pad_max: (c) => c.get("_bande").pad_max,
    spo2_min: (c) => (evaluer(N.bpco_si, c) ? N.spo2_min_bpco : N.spo2_min),
    temp_min: () => N.temperature[0],
    temp_max: () => N.temperature[1],
    gly_min: (c) => (c.get("tranche") === "nouveau_ne" ? N.glycemie_min_nouveau_ne : N.glycemie[0]),
    gly_max: () => N.glycemie[1],
    pam_min: (c) => c.get("_bande").pam_min,
    ic_max: (c) => {
      const a = c.get("age_ans");
      const b = N.index_choc.find((x) => (a === undefined ? x.age_max >= 999 : a >= x.age_min && a < x.age_max));
      return b ? b.max : undefined;
    },
    ic_eleve: (c) => {
      const a = c.get("age_ans");
      const b = N.index_choc.find((x) => (a === undefined ? x.age_max >= 999 : a >= x.age_min && a < x.age_max));
      return b ? b.eleve ?? b.max : undefined;
    },

    // ---- Poids ----
    poids_apls: (c) => {
      const a = c.get("age_ans");
      if (a === undefined) return undefined;
      const f = N.poids_estime.find((x) => a < x.age_max);
      if (!f) return undefined;
      return arrondi(num(evaluer(f.formule, c)), 0);
    },

    // ---- Hémodynamique ----
    pam: (c) => {
      const s = num(c.get("pas")), d = num(c.get("pad"));
      return s === undefined || d === undefined ? undefined : Math.round((s + 2 * d) / 3);
    },
    index_choc: (c) => {
      const f = num(c.get("fc")), s = num(c.get("pas"));
      return f === undefined || !s ? undefined : arrondi(f / s, 2);
    },
    diurese_kg: (c) => {
      const d = num(c.get("diurese")), p = num(c.get("poids"));
      return d === undefined || !p ? undefined : arrondi(d / p, 2);
    },
    imc: (c) => {
      const p = num(c.get("poids")), t = num(c.get("taille"));
      return p === undefined || !t ? undefined : arrondi(p / (t / 100) ** 2, 1);
    },

    // ---- Neurologique ----
    gcs: (c) => {
      const y = Number(c.get("gcs_y")), m = Number(c.get("gcs_m"));
      const vv = c.get("gcs_v");
      if (!y || !m || !vv) return undefined;
      return y + (vv === "T" ? 1 : Number(vv)) + m;
    },
    gcs_court: (c) => {
      const g = c.get("gcs");
      if (g === undefined) return undefined;
      return c.get("gcs_v") === "T" ? `${g - 1}T/15` : `${g}/15`;
    },
    gcs_texte: (c) => {
      const g = c.get("gcs");
      if (g === undefined) return undefined;
      const vv = c.get("gcs_v");
      return vv === "T"
        ? `${g - 1}T/15 (Y${c.get("gcs_y")} VT M${c.get("gcs_m")}, patient intubé)`
        : `${g}/15 (Y${c.get("gcs_y")} V${vv} M${c.get("gcs_m")})`;
    },

    // ---- Gaz du sang / biologie ----
    pf_ratio: (c) => {
      const pao2 = num(c.get("gds_pao2"));
      const fio2 = c.get("gds_condition") === "aa" ? 21 : num(c.get("gds_fio2"));
      return pao2 === undefined || !fio2 ? undefined : Math.round(pao2 / (fio2 / 100));
    },
    trou_anionique: (c) => {
      const na = num(c.get("na")), cl = num(c.get("cl")), hco3 = num(c.get("hco3") ?? c.get("gds_hco3"));
      return na === undefined || cl === undefined || hco3 === undefined ? undefined : arrondi(na - (cl + hco3), 1);
    },
  };

  // Champs « paire » (ex. pupilles) : asymétrie et anomalie
  for (const p of champsPaire) {
    D[p.id + "_asym"] = (c) => {
      const v = c.val(p.id) || {};
      const od = p.options.find((o) => o.v === v.d), og = p.options.find((o) => o.v === v.g);
      return !!(od && og && (od.classe ?? od.v) !== (og.classe ?? og.v));
    };
    D[p.id + "_anormal"] = (c) => {
      const v = c.val(p.id) || {};
      const od = p.options.find((o) => o.v === v.d), og = p.options.find((o) => o.v === v.g);
      return !!(od?.anormal || og?.anormal || c.get(p.id + "_asym"));
    };
  }

  // Listes conditionnelles (config/normes.js → listes) : texte des éléments dont la condition est vraie
  const formater = (v) => (typeof v === "number" ? T.nombre(v, 2) : v ?? "");
  for (const [nom, items] of Object.entries(N.listes || {})) {
    D[nom] = (c) => {
      const l = items.filter((it) => evaluer(it.si, c)).map((it) => T.rendre(it.texte, (n) => formater(c.get(n))));
      return l.length ? T.listeFr(l) : undefined;
    };
  }

  // Drapeaux cliniques définis dans config/normes.js
  for (const [nom, expr] of Object.entries(N.drapeaux || {})) D[nom] = (c) => !!evaluer(expr, c);

  return D;
}
