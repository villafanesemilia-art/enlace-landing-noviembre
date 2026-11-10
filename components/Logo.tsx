// Wordmark provisorio. Para usar el logo oficial, reemplazá el contenido por un <Image> o un SVG.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Enlace Hub">
      <svg width="26" height="16" viewBox="0 0 26 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" stroke="#D95325" strokeWidth="2.5" />
        <circle cx="18" cy="8" r="6.25" stroke="#FDFBF7" strokeWidth="2.5" />
      </svg>
      <span className="font-mono text-[13px] font-semibold tracking-[0.18em] text-cream">ENLACE HUB</span>
    </span>
  );
}
