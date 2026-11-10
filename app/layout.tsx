import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atraer, vender y fidelizar · Enlace Hub",
  description:
    "Taller presencial en Enlace Hub: el ciclo que hace crecer tu negocio. Sábado 14 de noviembre, 10 hs. Cupo máximo de 12 personas.",
  openGraph: {
    title: "Atraer, vender y fidelizar · Enlace Hub",
    description: "Taller presencial · Sábado 14 de noviembre · 10 hs · Solo 12 lugares.",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A3A2F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
