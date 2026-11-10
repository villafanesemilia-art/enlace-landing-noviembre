// Control de cupo. Cuenta las inscripciones de ESTA edición (campo "edicion")
// en Supabase o, si no está configurado, en la API de Formspree.
import { EVENT } from "./event";

export type Cupo = {
  capacity: number;
  taken: number | null; // null = no se pudo / no se configuró el conteo
  remaining: number | null;
  soldOut: boolean;
  source: "supabase" | "formspree" | "manual" | "none";
};

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || "enlace_inscriptos";
const FORMSPREE_KEY = process.env.FORMSPREE_API_KEY;
export const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_URL || process.env.FORMSPREE_ENDPOINT || "https://formspree.io/f/mnppjqrl";
const FORMSPREE_FORM_ID = FORMSPREE_ENDPOINT.split("/").filter(Boolean).pop() as string;

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

function supabaseHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_KEY as string,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    ...extra,
  };
}

async function countSupabase(): Promise<number> {
  const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id&edicion=eq.${encodeURIComponent(EVENT.slug)}`;
  const res = await fetch(url, {
    headers: supabaseHeaders({ Prefer: "count=exact", Range: "0-0" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  const total = Number(res.headers.get("content-range")?.split("/")[1]);
  if (!Number.isFinite(total)) throw new Error("Supabase: content-range inválido");
  return total;
}

async function countFormspree(): Promise<number> {
  const limit = 100;
  let count = 0;
  for (let page = 0; page < 20; page++) {
    const url = `https://formspree.io/api/0/forms/${FORMSPREE_FORM_ID}/submissions?limit=${limit}&offset=${page * limit}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${FORMSPREE_KEY}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Formspree ${res.status}`);
    const data = (await res.json()) as { submissions?: Array<Record<string, unknown>> };
    const list = Array.isArray(data.submissions) ? data.submissions : [];
    count += list.filter((s) => s?.edicion === EVENT.slug).length;
    if (list.length < limit) break;
  }
  return count;
}

export async function insertSupabase(record: Record<string, unknown>): Promise<"created" | "duplicate"> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(record),
    cache: "no-store",
  });
  if (res.status === 409) return "duplicate"; // índice único (edicion + email)
  if (!res.ok) throw new Error(`Supabase insert ${res.status}`);
  return "created";
}

let cache: { at: number; value: Cupo } | null = null;

export async function getCupo(fresh = false): Promise<Cupo> {
  if (!fresh && cache && Date.now() - cache.at < 10_000) return cache.value;

  let taken: number | null = null;
  let source: Cupo["source"] = "none";
  try {
    if (hasSupabase && process.env.CUPO_AUTO_COUNT === "true") {
      taken = await countSupabase();
      source = "supabase";
    } else if (FORMSPREE_KEY) {
      taken = await countFormspree();
      source = "formspree";
    }
    // Sin conteo automático: usa el contador manual (NEXT_PUBLIC_CUPOS_OCUPADOS), si existe.
    const manual = process.env.NEXT_PUBLIC_CUPOS_OCUPADOS;
    if (taken === null && manual && Number.isFinite(Number(manual))) {
      taken = Math.max(0, Number(manual));
      source = "manual";
    }
  } catch (err) {
    // Si el conteo falla se deja inscribir (no perder ventas) y queda el error en los logs.
    console.error("[cupo] no se pudo contar inscriptos:", err);
  }

  // Bandera manual de cupos agotados (cualquiera de las dos cierra la inscripción).
  const forced = process.env.NEXT_PUBLIC_CUPOS_AGOTADOS === "true" || process.env.FORCE_SOLD_OUT === "true";
  const remaining = taken === null ? null : Math.max(0, EVENT.capacity - taken);
  const value: Cupo = {
    capacity: EVENT.capacity,
    taken,
    remaining: forced ? 0 : remaining,
    soldOut: forced || (taken !== null && taken >= EVENT.capacity),
    source,
  };
  cache = { at: Date.now(), value };
  return value;
}
