"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock, LoaderCircle, Lock, MapPin, Mic, ShieldCheck, Ticket, X } from "lucide-react";
import { EVENT } from "@/lib/event";
import { formatARS } from "@/lib/format";
import { CupoBadge } from "./CupoBadge";

type Applied = { code: string; price: number; discount: number; link: string };

// Formspree: se lee en build (NEXT_PUBLIC_*), por eso hay que reiniciar/redeployar si cambia.
const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_URL;
// Bandera manual: NEXT_PUBLIC_CUPOS_AGOTADOS=true cierra la inscripción.
const SOLD_OUT_FLAG = process.env.NEXT_PUBLIC_CUPOS_AGOTADOS === "true";
type Props = { initialRemaining: number | null; initialSoldOut: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-base text-forest placeholder:text-forest/35 focus:border-ember focus:outline-2 focus:outline-ember/30 disabled:cursor-not-allowed disabled:bg-sand/60";

export function Registration({ initialRemaining, initialSoldOut }: Props) {
  const [soldOut, setSoldOut] = useState(initialSoldOut || SOLD_OUT_FLAG);
  const [remaining, setRemaining] = useState(initialRemaining);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);
  const [codeError, setCodeError] = useState("");
  const [applying, setApplying] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Vuelve a consultar el cupo al abrir la página (por si cambió desde que se generó).
  useEffect(() => {
    fetch("/api/cupo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setSoldOut(SOLD_OUT_FLAG || Boolean(d.soldOut));
        setRemaining(typeof d.remaining === "number" ? d.remaining : null);
      })
      .catch(() => {});
  }, []);

  // Si vuelve desde Mercado Pago con el botón "atrás", destraba el botón.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setSubmitting(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const total = applied?.price ?? EVENT.regularPrice;
  const valid = name.trim().length >= 2 && EMAIL_RE.test(email.trim()) && whatsapp.replace(/\D/g, "").length >= 8;

  async function applyCode() {
    const code = codeInput.trim();
    if (!code) return;
    setApplying(true);
    setCodeError("");
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setApplied({ code: data.code, price: data.price, discount: data.discount, link: data.link });
        setCodeInput("");
      } else {
        setApplied(null);
        setCodeError(data.error || "Ese código no es válido o ya no está vigente.");
      }
    } catch {
      setCodeError("No pudimos validar el código. Probá de nuevo.");
    } finally {
      setApplying(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting || soldOut) return;
    if (company) return; // honeypot: un humano nunca lo completa
    if (!FORMSPREE_URL) {
      setFormError("El formulario no está configurado todavía (falta NEXT_PUBLIC_FORMSPREE_URL).");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      // Re-chequea el cupo justo antes de enviar (por si se llenó mientras completaba el formulario).
      const cupoRes = await fetch("/api/cupo", { cache: "no-store" }).catch(() => null);
      const cupo = cupoRes?.ok ? await cupoRes.json().catch(() => null) : null;
      if (SOLD_OUT_FLAG || cupo?.soldOut) {
        setSoldOut(true);
        setRemaining(0);
        setSubmitting(false);
        return;
      }

      // Precio y link de Mercado Pago según el código aplicado.
      const price = applied?.price ?? EVENT.regularPrice;
      const link = applied?.link ?? EVENT.regularLink;

      // 1) Guarda en Supabase (vía servidor). Si falla por otra cosa que cupo, sigue: queda el respaldo en Formspree.
      const saveRes = await fetch("/api/inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, code: applied?.code ?? "" }),
      }).catch(() => null);
      const saveData = saveRes ? await saveRes.json().catch(() => null) : null;
      if (saveData?.error === "sold_out") {
        setSoldOut(true);
        setRemaining(0);
        setSubmitting(false);
        return;
      }
      if (saveData?.error === "rate_limited" || String(saveData?.error ?? "").startsWith("invalid_")) {
        setFormError(saveData.message);
        setSubmitting(false);
        return;
      }
      const savedInDb = Boolean(saveData?.saved);

      // 2) Aviso por mail / respaldo en Formspree.
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Nueva inscripción · ${EVENT.title} (${EVENT.slug})`,
          evento: EVENT.fullName,
          edicion: EVENT.slug,
          nombre: name.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: whatsapp.replace(/\D/g, ""),
          codigo: applied?.code ?? null,
          precio: price,
          estado: "pendiente de pago",
        }),
      });
      if (res.ok || savedInDb) {
        window.location.assign(link); // → Mercado Pago
        return;
      }
      const data = await res.json().catch(() => null);
      const detail = Array.isArray(data?.errors) ? data.errors.map((er: { message?: string }) => er.message).filter(Boolean).join(" ") : "";
      setFormError(detail || "No pudimos procesar tu inscripción. Probá de nuevo.");
    } catch {
      setFormError("Sin conexión. Revisá tu internet y probá de nuevo.");
    }
    setSubmitting(false);
  }

  const info = [
    { icon: CalendarDays, label: "CUÁNDO", value: `${EVENT.weekday} ${EVENT.day}.11` },
    { icon: Clock, label: "HORA", value: EVENT.time },
    { icon: MapPin, label: "DÓNDE", value: EVENT.placeShort },
    { icon: Mic, label: "DISERTANTE", value: EVENT.speaker },
  ];

  return (
    <section id="inscripcion" className="bg-forest-deep px-5 py-16 md:py-24" aria-labelledby="reg-title">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-ember-light">INSCRIPCIÓN</p>
          <h2 id="reg-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {soldOut ? "Convocatoria cerrada" : "Reservá tu lugar"}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-cream/80">
            {soldOut
              ? `Se completaron los ${EVENT.capacity} lugares de este taller.`
              : `Completá tus datos y asegurá tu cupo para “${EVENT.title}”.`}
          </p>
          <CupoBadge cupo={{ capacity: EVENT.capacity, remaining, soldOut }} className="mt-5" />

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-cream/10 ring-1 ring-cream/10">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-forest-deep p-4">
                <dt className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.2em] text-cream/50">
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-3xl bg-cream p-6 text-forest shadow-2xl shadow-black/30 sm:p-8">
          {soldOut && (
            <div role="status" className="mb-5 flex gap-3 rounded-2xl bg-forest p-4 text-cream">
              <Lock size={20} className="mt-0.5 shrink-0 text-ember-light" aria-hidden="true" />
              <p className="text-sm leading-relaxed">
                <strong>¡Gracias por el interés!</strong> Los {EVENT.capacity} cupos para la edición del Sábado {EVENT.day} de Noviembre están completos.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            <fieldset disabled={soldOut || submitting} className="space-y-4">
              <legend className="sr-only">Datos de inscripción</legend>

              <label className="block text-sm font-semibold">
                Nombre completo
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Lucía Fernández" autoComplete="name" required />
              </label>

              <label className="block text-sm font-semibold">
                Email
                <input className={inputClass} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" required />
              </label>

              <label className="block text-sm font-semibold">
                <span className="flex items-baseline justify-between gap-2">
                  WhatsApp
                  <span className="text-xs font-normal text-forest/55">Con código de área, sin 0 ni 15</span>
                </span>
                <input className={inputClass} type="tel" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="381 555 1234" autoComplete="tel" required />
              </label>

              {/* Campo trampa anti-bots */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <input tabIndex={-1} autoComplete="off" name="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div>
                <span className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                  Código de descuento
                  <span className="text-xs font-normal text-forest/55">Opcional</span>
                </span>
                {applied ? (
                  <div className="mt-1.5 flex items-center justify-between rounded-xl border-2 border-dashed border-forest/30 bg-sand/60 px-4 py-3">
                    <span className="flex items-center gap-2 font-mono text-sm font-bold">
                      <Ticket size={16} aria-hidden="true" />
                      {applied.code}
                      <span className="rounded-md bg-ember px-1.5 py-0.5 text-[11px] text-white">BONIFICADO</span>
                    </span>
                    <button type="button" onClick={() => setApplied(null)} aria-label="Quitar código" className="rounded-full p-1 text-forest/60 hover:bg-forest/10">
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      aria-label="Código de descuento"
                      className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 font-mono text-base uppercase text-forest placeholder:text-forest/35 focus:border-ember focus:outline-2 focus:outline-ember/30 disabled:bg-sand/60"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value);
                        setCodeError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyCode();
                        }
                      }}
                      placeholder="CÓDIGO"
                      autoCapitalize="characters"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={applyCode}
                      disabled={applying || !codeInput.trim()}
                      className="shrink-0 rounded-xl bg-forest px-5 font-bold text-cream hover:bg-forest-soft disabled:opacity-50"
                    >
                      {applying ? <LoaderCircle size={18} className="animate-spin" aria-label="Validando" /> : "Aplicar"}
                    </button>
                  </div>
                )}
                {codeError && (
                  <p role="alert" className="mt-2 text-sm font-medium text-ember-dark">
                    {codeError}
                  </p>
                )}
              </div>
            </fieldset>

            <div className="mt-6 rounded-2xl bg-sand/70 p-5">
              <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-forest/55">RESUMEN</p>
              <div className="mt-3 flex justify-between text-sm">
                <span>Inversión general</span>
                <span className={applied ? "text-forest/45 line-through" : "font-semibold"}>{formatARS(EVENT.regularPrice)}</span>
              </div>
              {applied && (
                <div className="mt-2 flex justify-between text-sm font-semibold text-forest">
                  <span>Precio bonificado</span>
                  <span>− {formatARS(applied.discount)}</span>
                </div>
              )}
              <div className="mt-4 flex items-end justify-between border-t border-forest/15 pt-4">
                <span className="text-sm font-semibold">Total a pagar</span>
                <span className="text-3xl font-extrabold tracking-tight">{formatARS(total)}</span>
              </div>
            </div>

            {formError && (
              <p role="alert" className="mt-4 rounded-xl bg-ember/10 px-4 py-3 text-sm font-medium text-ember-dark">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={soldOut || submitting || !valid}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ember px-6 py-4 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(217,83,37,0.8)] transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:bg-forest/15 disabled:text-forest/45 disabled:shadow-none"
            >
              {soldOut ? (
                <>
                  <Lock size={18} aria-hidden="true" /> CUPOS AGOTADOS
                </>
              ) : submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Redirigiendo a Mercado Pago…
                </>
              ) : (
                <>
                  <Check size={18} aria-hidden="true" /> Ir a pagar {formatARS(total)}
                </>
              )}
            </button>

            {!soldOut && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-forest/60">
                <ShieldCheck size={14} aria-hidden="true" />
                Pago seguro con Mercado Pago · Completá el pago para confirmar tu lugar
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
