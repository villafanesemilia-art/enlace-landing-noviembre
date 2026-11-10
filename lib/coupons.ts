// SOLO se importa desde rutas /api (servidor): así los códigos no viajan al navegador.
import { EVENT } from "./event";

export type Plan = {
  code: string | null;
  price: number;
  link: string;
  label: string;
};

export const REGULAR: Plan = {
  code: null,
  price: EVENT.regularPrice,
  link: process.env.MP_LINK_FULL || EVENT.regularLink,
  label: "Inversión general",
};

// Mercado Pago tiene un link por monto. Para sumar un código nuevo,
// creá su link de pago y agregalo acá.
const COUPONS: Record<string, Plan> = {
  ENLACE02: {
    code: "ENLACE02",
    price: 25000,
    link: process.env.MP_LINK_ENLACE02 || "https://mpago.la/22CTrdn",
    label: "Precio bonificado",
  },
};

export function normalizeCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toUpperCase().replace(/\s+/g, "") : "";
}

export function resolvePlan(raw: unknown): { ok: true; plan: Plan } | { ok: false } {
  const code = normalizeCode(raw);
  if (!code) return { ok: true, plan: REGULAR };
  const plan = COUPONS[code];
  return plan ? { ok: true, plan } : { ok: false };
}
