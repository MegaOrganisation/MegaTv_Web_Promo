# MegaProject — Kanban IA

Application statique (HTML/CSS/JS) connectée à Supabase. Aucune étape de build.

## Déploiement Vercel

**Option A — Glisser-déposer**
1. Va sur https://vercel.com/new
2. Glisse ce dossier entier (ou le `.zip`) dans la zone d'import.
3. Framework Preset : **Other** / **No Framework**. Aucune commande de build, aucun dossier de sortie à configurer.
4. Deploy. Vercel sert `index.html` automatiquement.

**Option B — CLI**
```bash
npm i -g vercel
cd deploy
vercel        # puis "vercel --prod" pour la prod
```

## Structure
```
deploy/
├── index.html              ← l'application
└── assets/
    ├── logo-icon.png        ← logo (utilisé)
    └── logo-lockup.png      ← lockup (de réserve)
```

## ⚠️ Base de données (à faire une seule fois)
Les fonctions IA (sous-tâches, effort, résumé Stand-up) ont besoin de colonnes/table.
Dans **Supabase › SQL Editor**, exécute :

```sql
alter table public.tasks add column if not exists subtasks jsonb default '[]'::jsonb;
alter table public.tasks add column if not exists effort text;

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  task_id text,
  task_title text,
  action text,
  from_status text,
  to_status text,
  created_at timestamptz default now()
);
alter table public.activity_log enable row level security;
drop policy if exists "activity_log_all" on public.activity_log;
create policy "activity_log_all" on public.activity_log for all using (true) with check (true);
```

> Tant que le SQL n'est pas lancé, l'app reste 100 % fonctionnelle ; ces fonctions s'activent ensuite automatiquement.
> Le même script est disponible dans l'app : **Réglages › Configurer la base de données**.

## Note clés API
Les identifiants Supabase et la config IA sont dans `index.html` (côté client, comme dans ta version d'origine). La clé Supabase est la clé **anon** publique ; assure-toi que tes politiques RLS sont bien en place sur `tasks` / `projects`.
