# MegaCompagnon — Dashboard MegaTv

Application web Next.js du dashboard officiel MegaTv.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase SSR Auth + Postgres/RLS
- Sentry Next SDK + API serveur admin
- TMDB via proxy Supabase existant

## Routes principales

| Route | Rôle |
|---|---|
| `/` | Landing publique MegaCompagnon |
| `/login` | Connexion MegaTv Cloud |
| `/auth/callback` | Callback Supabase SSR |
| `/companion` | Dashboard utilisateur |
| `/companion/settings` | Profils, compte, appareils |
| `/companion/admin` | Dashboard admin agrégé |

## Configuration locale

Créer `.env.local` depuis `.env.example` :

```bash
cp .env.example .env.local
```

Variables minimales :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Variables admin Sentry côté serveur uniquement :

```env
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT_ANDROID=
SENTRY_PROJECT_WEB=
SENTRY_ENVIRONMENT=production
```

## Commandes

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

## Supabase

Appliquer la migration côté repo principal MegaTv :

```bash
supabase db push
```

Migration ajoutée :

`supabase/migrations/20260630_megacompanion_dashboard.sql`

Elle crée :

- `megacompanion_admins`
- `megacompanion_sessions`
- `megacompanion_page_events`
- `megacompanion_watch_events`
- vues `v_megacompanion_*`
- RPC utilisateur et admin agrégées

## Vercel

Root Directory recommandé :

`MegaTv - app/MegaTv - web/promo`

Framework preset : **Next.js**.

Le build Vercel doit avoir les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurées. Les tokens Sentry restent serveur uniquement.
