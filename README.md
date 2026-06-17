# Overr Super League

Prywatna gra online dla 10-16 znajomych, inspirowana OSM, FIFA Career Mode i Football Managerem. Ten etap repozytorium zawiera solidną bazę techniczną: Next.js, TypeScript, Tailwind CSS i Supabase, bez pełnej logiki gry.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Database

## Struktura

```txt
src/
  app/
  lib/
  components/
  hooks/
  services/
  types/
  utils/
public/
supabase/
```

## Instalacja

```bash
npm install
```

## Konfiguracja `.env.local`

Skopiuj `.env.example` do `.env.local` i uzupełnij wartości z Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Aplikacja używa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, a jeśli jej nie ma, korzysta z fallbacku `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Nie dodawaj do frontendu secret key ani service role key.

## Supabase schema i seed

W Supabase SQL Editor uruchom:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

Schema tworzy tabele `profiles`, `clubs`, `players`, `matches` i `transfers`, włącza RLS oraz dodaje podstawowe policies: zalogowani użytkownicy czytają dane ligi, właściciel klubu może edytować swój klub, a admin jest przygotowany do zarządzania danymi.

## Strony

- `/` - landing Overr Super League
- `/status` - sprawdza konfigurację Supabase i próbuje pobrać `clubs`
- `/dashboard` - placeholder panelu gry
- `/login` - logowanie Supabase magic link
- `/logout` - wylogowanie
- `/auth/callback` - callback Supabase Auth

## Uruchamianie

```bash
npm run dev
npm run build
```

## Kontrola jakości

```bash
npm run lint
```
