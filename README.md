# MegaTv Web — Promo + MegaCompagnon

Application web officielle MegaTv déployée sur Vercel.

Elle combine :

- le site promo public MegaTv (`/`) ;
- la sélection MegaCompagnon depuis le site public ;
- la connexion **ID MegaTv** via Supabase Auth (`/login`) ;
- l'application web Companion protégée (`/companion`, `/companion/settings`, `/companion/admin`).

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
| `/` | Site promo public MegaTv + sélection MegaCompagnon |
| `/login` | Connexion ID MegaTv / MegaTv Cloud |
| `/auth/callback` | Callback Supabase SSR |
| `/companion` | Dashboard utilisateur |
| `/companion/settings` | Profils, compte, appareils |
| `/companion/manage/iptv` | Gestion playlists IPTV (par profil) |
| `/companion/manage/addons` | Gestion addons Stremio |
| `/companion/manage/catalogs` | Gestion catalogues |
| `/companion/admin` | Dashboard admin (périodes, CSV, graphiques) |
| `/companion/admin/releases` | Console OTA `version.json` |
| `/companion/admin/platform` | Config plateforme (révisions) |

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

Variables serveur (OTA publish, jamais `NEXT_PUBLIC_`) :

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```env
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT_ANDROID=
SENTRY_PROJECT_WEB=
SENTRY_ENVIRONMENT=production
```

## Commandes

```bash
npm ci
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

Migrations MegaCompagnon (repo `MegaTV`, projet Supabase `lciimaytmryruyooktkd`) :

- `20260630_megacompanion_dashboard.sql`
- `20260702_megacompanion_p0.sql`
- `20260702_megacompanion_p1_p2.sql`

Elle crée :

- `megacompanion_admins`
- `megacompanion_sessions`
- `megacompanion_page_events`
- `megacompanion_watch_events`
- vues `v_megacompanion_*`
- RPC utilisateur et admin agrégées

## Vercel

Le fichier `vercel.json` force les paramètres critiques pour éviter qu'un déploiement serve uniquement `public/` et renvoie `404 NOT_FOUND` sur les routes Next.js :

```json
{
  "framework": "nextjs",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": null
}
```

Configuration projet recommandée :

- Repository : `MegaOrganisation/MegaTv_Web_Promo`
- Root Directory : vide / racine du repo
- Framework Preset : **Next.js**
- Build Command : `npm run build`
- Output Directory : automatique / vide
- Variables obligatoires : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- Variable serveur OTA : `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview)

Les tokens Sentry restent serveur uniquement.
