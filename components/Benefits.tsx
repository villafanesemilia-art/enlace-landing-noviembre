const ITEMS = [
  {
    n: "01",
    tag: "ATRAER",
    title: "Estrategias de atracción",
    text: "Cómo hacer que te encuentren las personas correctas, sin gastar de más ni depender del boca en boca.",
  },
  {
    n: "02",
    tag: "VENDER",
    title: "Cierres de venta",
    text: "Pasar del “me interesa” al “lo quiero”: conversaciones, objeciones y el momento justo para cerrar.",
  },
  {
    n: "03",
    tag: "FIDELIZAR",
    title: "Fidelización de clientes",
    text: "Convertir una compra en una relación: que tus clientes regresen y te recomienden.",
  },
];

export function Benefits() {
  return (
    <section className="bg-forest-deep px-5 py-16 md:py-24" aria-labelledby="benefits-title">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.25em] text-ember-light">EL CICLO COMPLETO</p>
        <h2 id="benefits-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Qué te vas a llevar
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ITEMS.map((item) => (
            <article key={item.n} className="rounded-3xl bg-cream p-7 text-forest shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-ember">{item.n}</span>
                <span className="rounded-full bg-forest px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-cream">
                  {item.tag}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-extrabold leading-snug">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-forest/75">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
