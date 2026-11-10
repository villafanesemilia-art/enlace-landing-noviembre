-- Pegalo en Supabase → SQL Editor → Run
create table if not exists public.enlace_inscriptos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  edicion text not null,
  nombre text not null,
  email text not null,
  whatsapp text not null,
  codigo text,
  precio integer not null,
  estado text not null default 'pendiente de pago'
);

-- Evita que la misma persona ocupe dos lugares en la misma edición
create unique index if not exists enlace_inscriptos_edicion_email_uk
  on public.enlace_inscriptos (edicion, lower(email));

-- Sin políticas: solo se accede con la service role key, desde el servidor
alter table public.enlace_inscriptos enable row level security;
