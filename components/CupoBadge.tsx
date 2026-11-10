import { Flame, Lock } from "lucide-react";
import type { Cupo } from "@/lib/cupo";

type Props = { cupo: Pick<Cupo, "capacity" | "remaining" | "soldOut">; className?: string };

// Badge de escasez. Con el conteo disponible muestra cuántos lugares quedan.
export function CupoBadge({ cupo, className = "" }: Props) {
  if (cupo.soldOut) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-2 text-sm font-semibold text-cream/80 ring-1 ring-cream/15 ${className}`}
      >
        <Lock size={15} aria-hidden="true" />
        Convocatoria cerrada · Cupos agotados
      </span>
    );
  }

  const text =
    cupo.remaining === null || cupo.remaining === cupo.capacity
      ? `¡Cupos limitados! Solo ${cupo.capacity} lugares disponibles`
      : cupo.remaining <= 3
        ? `¡Últimos lugares! Quedan ${cupo.remaining} de ${cupo.capacity}`
        : `¡Cupos limitados! Quedan ${cupo.remaining} de ${cupo.capacity} lugares`;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-ember/15 px-4 py-2 text-sm font-semibold text-ember-light ring-1 ring-ember/40 ${className}`}
    >
      <Flame size={15} aria-hidden="true" />
      {text}
    </span>
  );
}
