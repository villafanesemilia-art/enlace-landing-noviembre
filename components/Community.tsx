import { Armchair, CalendarCheck, MessageCircle, Network, Workflow } from "lucide-react";

const PERKS = [
  { icon: CalendarCheck, title: "Talleres todos los meses", text: "Charlas y talleres como este, bonificados para miembros." },
  { icon: Armchair, title: "Espacios de cowork", text: "Un lugar cómodo para trabajar, reunirte y concentrarte." },
  { icon: Workflow, title: "Gestión", text: "Apoyo para ordenar y hacer crecer tu proyecto." },
  { icon: Network, title: "Red de profesionales", text: "Gente que emprende como vos, a un mensaje de distancia." },
];

export function Community() {
  const wa = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent("Hola! Quiero ser parte de la Comunidad Enlace")}`
    : null;

  return (
    <section className="bg-forest px-5 py-16 md:py-24" aria-labelledby="community-title">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-ember-light">COMUNIDAD ENLACE</p>
          <h2 id="community-title" className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Formá parte de la Comunidad Enlace
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-cream/80">
            Talleres formativos como este se dictan <strong className="text-cream">todos los meses, bonificados para los miembros</strong> de
            la comunidad. Además, tenés acceso a espacios de cowork, gestión y una red de profesionales que te impulsa.
          </p>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 font-bold text-forest hover:bg-sand"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Quiero ser parte
            </a>
          )}
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl bg-forest-soft p-5 ring-1 ring-cream/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember text-white">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-cream/70">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
