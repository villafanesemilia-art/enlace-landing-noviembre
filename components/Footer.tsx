import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-forest-deep px-5 pb-28 pt-10 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-cream/50 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p>Enlace Hub · Zona Barrio Jardín · San Miguel de Tucumán</p>
      </div>
    </footer>
  );
}
