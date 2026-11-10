import { NextResponse } from "next/server";
import { EVENT } from "@/lib/event";
import { REGULAR, normalizeCode, resolvePlan } from "@/lib/coupons";
import { clientIp, limited } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (limited(`coupon:${clientIp(req)}`, 15)) {
    return NextResponse.json({ valid: false, error: "Demasiados intentos. Probá en un minuto." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const code = normalizeCode(body?.code);
  const result = resolvePlan(code);

  if (!code || !result.ok || !result.plan.code) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    code: result.plan.code,
    label: result.plan.label,
    price: result.plan.price,
    link: result.plan.link,
    regular: REGULAR.price,
    discount: EVENT.regularPrice - result.plan.price,
  });
}
