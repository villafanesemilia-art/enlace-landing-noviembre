import { CalendarDays, Clock, MapPin, Mic } from "lucide-react";
import { EVENT } from "@/lib/event";
import type { Cupo } from "@/lib/cupo";
import { Logo } from "./Logo";
import { CtaButton } from "./CtaButton";
import { CupoBadge } from "./CupoBadge";
import { CycleGraphic } from "./CycleGraphic";

const TICKER = Array.from({ length: 12 }, () => "ATRAER · VENDER · FIDELIZAR ·").join(" ");

export function Hero({ cupo }: { cupo: Cupo }) {
  const details = [
    { icon: CalendarDays, text: EVENT.dateLong },
    { icon: Clock, text: EVENT.time },
    { icon: MapPin, text: EVENT.place },
    { icon: Mic, text: `A cargo de ${EVENT.speaker}` },
  ];

  return (
    <header className="relative overflow-hidden bg-[radial-gradient(120%_80%_at_80%_0%,#14604e_0%,#0a3a2f_55%,#072a22_100%)]">
      <div className="overflow-hidden border-b border-cream/10 py-2" aria-hidden="true">
        <div className="animate-ticker flex w-max whitespace-nowrap font-mono text-[11px] font-semibold tracking-[0.25em] text-cream/45">
          <span className="pr-4">{TICKER}</span>
          <span className="pr-4">{TICKER}</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <a
          href="#inscripcion"
          aria-disabled={cupo.soldOut}
          className={`rounded-full px-4 py-2 font-mono text-xs font-semibold tracking-widest ${
            cupo.soldOut ? "pointer-events-none bg-cream/10 text-cream/50" : "bg-cream/10 text-cream hover:bg-cream/20"
          }`}
        >
          {cupo.soldOut ? "AGOTADO" : "RESERVAR"}
        </a>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1.15fr_0.85fr] md:gap-6 md:pb-24 md:pt-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-forest">
              <span className={`h-1.5 w-1.5 rounded-full ${cupo.soldOut ? "bg-forest/40" : "bg-ember"}`} aria-hidden="true" />
              {cupo.soldOut ? "INSCRIPCIONES CERRADAS" : "INSCRIPCIONES ABIERTAS"}
            </span>
            <span className="rounded-full bg-ember px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-white">TALLER</span>
          </div>

          <h1 className="mt-6 text-[2.75rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Atraer, vender
            <br />y <span className="text-ember">fidelizar</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/80">
            {EVENT.subtitle}. Un taller práctico para que tu emprendimiento deje de depender de la suerte.
          </p>

          <ul className="mt-7 space-y-3">
            {details.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] text-cream/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream/10 text-ember-light">
                  <Icon size={16} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-start gap-4">
            <CupoBadge cupo={cupo} />
            <div id="hero-cta" className="w-full sm:w-auto">
              <CtaButton soldOut={cupo.soldOut} className="w-full sm:w-auto" />
            </div>
            <p className="text-sm text-cream/55">
              {cupo.soldOut
                ? "Se completaron los lugares de esta edición."
                : `Cupo máximo de ${EVENT.capacity} personas · Te inscribís en 1 minuto`}
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[340px] md:max-w-none">
          <CycleGraphic className="h-auto w-full" />
        </div>
      </div>
    </header>
  );
}
