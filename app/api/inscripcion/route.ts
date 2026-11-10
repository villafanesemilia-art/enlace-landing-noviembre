import { NextResponse } from "next/server";
import { EVENT } from "@/lib/event";
import { resolvePlan } from "@/lib/coupons";
import { getCupo, hasSupabase, insertSupabase } from "@/lib/cupo";
import { clientIp, limited } from "@/lib/ratelimit";

// Guarda la inscripción en Supabase (tabla enlace_inscriptos) con la clave secreta, que solo vive en el servidor.
// El envío a Formspree lo hace el formulario desde el navegador.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fail(error: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

export async function POST(req: Request) {
  if (limited(`inscripcion:${clientIp(req)}`, 6)) {
    return fail("rate_limited", "Demasiados intentos. Probá de nuevo en un minuto.", 429);
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("bad_request", "Solicitud inválida.", 400);

  const name = String(body.name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 150);
  const whatsapp = String(body.whatsapp ?? "").replace(/\D/g, "").slice(0, 15);

  if (name.length < 2) return fail("invalid_name", "Escribí tu nombre completo.", 400);
  if (!EMAIL_RE.test(email)) return fail("invalid_email", "Revisá tu email.", 400);
  if (whatsapp.length < 8) return fail("invalid_whatsapp", "Revisá tu WhatsApp (con código de área).", 400);

  // Precio y código se resuelven acá: no se confía en lo que manda el navegador.
  const result = resolvePlan(body.code);
  if (!result.ok) return fail("invalid_code", "Ese código no es válido o ya no está vigente.", 400);
  const { plan } = result;

  const cupo = await getCupo(true);
  if (cupo.soldOut) return fail("sold_out", "Los cupos para esta edición están completos.", 409);

  // Supabase sin configurar: no se pierde la venta, queda el registro en Formspree.
  if (!hasSupabase) return NextResponse.json({ ok: true, saved: false });

  try {
    const saved = await insertSupabase({
      edicion: EVENT.slug,
      nombre: name,
      email,
      whatsapp,
      codigo: plan.code,
      precio: plan.price,
      estado: "pendiente de pago",
    });
    return NextResponse.json({ ok: true, saved: true, duplicate: saved === "duplicate" });
  } catch (err) {
    console.error("[inscripcion] Supabase:", err);
    return NextResponse.json({ ok: true, saved: false });
  }
}
