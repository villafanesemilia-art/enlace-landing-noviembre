# Enlace Hub · Taller "Atraer, vender y fidelizar" (sábado 14/11/2026)

Landing en Next.js (App Router) + Tailwind CSS v4. Misma identidad visual de la edición anterior:
verde `#0A3A2F`, naranja `#D95325`, crema `#FDFBF7`.

## Cómo funciona

| Qué | Cómo |
| --- | --- |
| Precio regular | $35.000 → https://mpago.la/2ptDyxz |
| Código `ENLACE02` | $25.000 → https://mpago.la/22CTrdn |
| Cupo | Máximo 12 inscriptos (con y sin código) |
| Validación | Códigos, precio y links se resuelven **en el servidor** (`/api/coupon`, `/api/register`); no quedan visibles en el código de la página |

El formulario envía los datos **desde el navegador** a Formspree (`NEXT_PUBLIC_FORMSPREE_URL`) y, si salió bien,
redirige al link de Mercado Pago que corresponde (con o sin código). La validación del código sigue en el servidor (`/api/coupon`).
Al inscribirse la persona ocupa un lugar y es redirigida a Mercado Pago. Mercado Pago no avisa a la web si
pagó, así que **un lugar cuenta desde que se inscribe**. Si alguien no paga, borrá su fila (Supabase) para liberar el lugar.

Cuando se llega a 12: el botón principal pasa a **CUPOS AGOTADOS**, el formulario queda deshabilitado, se muestra
"Convocatoria cerrada" y el servidor rechaza cualquier inscripción nueva (aunque alguien intente saltearse la página).

## Control de cupo: elegí una opción

**A · Supabase (recomendada, plan gratis)**
1. En Supabase → SQL Editor, pegá y ejecutá `supabase/schema.sql`.
2. En Vercel → Settings → Environment Variables cargá `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
   (Supabase → Project Settings → API). La service role key es secreta: solo va en Vercel, nunca en el código.
3. Redeploy.

**B · Formspree**: cargá `FORMSPREE_API_KEY` (la Master key del formulario, con "HTTP API" activado en su Settings).
Ojo: la API de lectura de Formspree solo está en los planes **Professional/Business**. Sin ese plan usá la opción A.

Formspree sigue recibiendo cada inscripción como aviso por mail en cualquiera de los dos casos.
Cada inscripción lleva el campo `edicion = 2026-11-14`, así no se mezcla con la edición anterior aunque uses el mismo formulario.

Si no se configura ninguna de las dos, la página funciona pero **no cuenta** inscriptos (no bloquea sola).
Si el conteo falla momentáneamente, deja inscribir y lo registra en los logs de Vercel.

**Bandera manual:** `NEXT_PUBLIC_CUPOS_AGOTADOS=true` (y Redeploy) deja el formulario en "CUPOS AGOTADOS". Opcional: `NEXT_PUBLIC_CUPOS_OCUPADOS=N` como contador manual si no hay conteo automático.

**Freno de emergencia:** `FORCE_SOLD_OUT=true` en Vercel + Redeploy cierra la inscripción al instante.

## Subir a Vercel
1. Subí esta carpeta a un repo nuevo de GitHub.
2. Vercel → Add New → Project → Import → Deploy.
3. Cargá las variables del control de cupo y hacé Redeploy.

## Probar en tu compu
```
npm install
cp .env.example .env.local
npm run dev    # http://localhost:3000
```
Ojo: las pruebas locales también envían a Formspree y Supabase reales si cargás las claves.

## Dónde editar
- Datos del evento (fecha, hora, lugar, precio, cupo): `lib/event.ts`
- Códigos y links de pago: `lib/coupons.ts`
- Beneficios: `components/Benefits.tsx` · Comunidad: `components/Community.tsx`
- Colores: `app/globals.css` (bloque `@theme`) · Logo: `components/Logo.tsx` (provisorio)
