import { getCupo } from "@/lib/cupo";
import { Hero } from "@/components/Hero";
import { Benefits } from "@/components/Benefits";
import { Community } from "@/components/Community";
import { Registration } from "@/components/Registration";
import { StickyCta } from "@/components/StickyCta";
import { Footer } from "@/components/Footer";

// El cupo se consulta en cada visita para que el bloqueo sea inmediato.
export const dynamic = "force-dynamic";

export default async function Home() {
  const cupo = await getCupo();

  return (
    <main>
      <Hero cupo={cupo} />
      <Benefits />
      <Community />
      <Registration initialRemaining={cupo.remaining} initialSoldOut={cupo.soldOut} />
      <Footer />
      <StickyCta soldOut={cupo.soldOut} />
    </main>
  );
}
