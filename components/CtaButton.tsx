import { ArrowRight, Ban } from "lucide-react";

type Props = {
  soldOut: boolean;
  label?: string;
  className?: string;
};

// Botón principal. Si el cupo está completo se convierte en "CUPOS AGOTADOS" y no navega a ningún lado.
export function CtaButton({ soldOut, label = "Reservar mi lugar", className = "" }: Props) {
  if (soldOut) {
    return (
      <span
        role="button"
        aria-disabled="true"
        className={`inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-cream/10 px-7 py-4 text-base font-bold tracking-wide text-cream/60 ring-1 ring-cream/15 ${className}`}
      >
        <Ban size={18} aria-hidden="true" />
        CUPOS AGOTADOS
      </span>
    );
  }
  return (
    <a
      href="#inscripcion"
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-ember px-7 py-4 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(217,83,37,0.8)] transition hover:bg-ember-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${className}`}
    >
      {label}
      <ArrowRight size={18} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}
