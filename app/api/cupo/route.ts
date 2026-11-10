import { NextResponse } from "next/server";
import { getCupo } from "@/lib/cupo";

export const dynamic = "force-dynamic";

export async function GET() {
  const cupo = await getCupo();
  return NextResponse.json(
    { capacity: cupo.capacity, remaining: cupo.remaining, soldOut: cupo.soldOut },
    { headers: { "Cache-Control": "no-store" } },
  );
}
