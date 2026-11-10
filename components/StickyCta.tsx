"use client";

import { useEffect, useState } from "react";
import { CtaButton } from "./CtaButton";

// Barra fija solo en celulares. Se oculta cuando el formulario ya está a la vista.
export function StickyCta({ soldOut }: { soldOut: boolean }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const ids = ["hero-cta", "inscripcion"];
    const io = new IntersectionObserver(
      (entries) =>
        setVisible((prev) => {
          const next = { ...prev };
          entries.forEach((e) => (next[e.target.id] = e.isIntersecting));
          return next;
        }),
      { threshold: 0.15 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Se oculta cuando ya se ve el botón del hero o el formulario.
  if (visible["hero-cta"] || visible["inscripcion"]) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-forest-deep/95 p-3 backdrop-blur md:hidden">
      <CtaButton soldOut={soldOut} className="w-full" />
    </div>
  );
}
