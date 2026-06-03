# MegaTv — Site vitrine + page de jumelage

Site statique (HTML + CSS + JS). **Aucune étape de build** : tout fonctionne tel quel.

## Pages
| Fichier | Rôle | URL après déploiement |
|---|---|---|
| `index.html` | Site promo (hero 3D, features, pricing, compte…) | `/` |
| `pairing.html` | Jumelage TV (QR code) — login + Google + création de compte | `/pairing` |

## Fichiers
```
index.html          ← page promo principale
pairing.html        ← page de jumelage TV (cible du QR code)
styles.css          ← styles du site promo
app.js              ← logique promo (i18n, thème, Supabase, TV, scroll)
tweaks-panel.jsx    ← panneau de réglages (Babel navigateur)
tweaks-app.jsx      ← réglages du site promo
assets/             ← logo + captures d'app (11 images)
vercel.json         ← configuration Vercel (cache, en-têtes)
.vercelignore       ← exclut les fichiers de travail
```

---

## Déployer sur Vercel — 3 méthodes

### 1) Glisser-déposer
1. Aller sur **https://vercel.com/new**
2. Glisser le dossier du projet (ou utiliser la CLI ci-dessous).
3. Framework Preset : **Other** — laisser Build/Output vides.
4. **Deploy**. En ligne en ~20 s.

### 2) Vercel CLI
```bash
npm i -g vercel      # une seule fois
cd <dossier-du-projet>
vercel               # preview
vercel --prod        # production
```

### 3) GitHub (déploiement continu)
1. Pousser ces fichiers sur un repo GitHub.
2. **https://vercel.com/new** → Import Git Repository → choisir le repo.
3. Framework : **Other**, pas de build. **Deploy**. Chaque `git push` redéploie.

---

## Page de jumelage — réglages (`pairing.html`)
En haut du `<script>` :
- `TMDB_API_KEY` ✅ déjà renseignée — affiches « tendances » en direct.
- `DOWNLOAD_URL` → mettre le vrai lien de téléchargement de l'app (bouton de la banderole).

Dans **Supabase → Authentication** :
- Activer le provider **Google** (Client ID/Secret Google).
- Dans **URL Configuration → Redirect URLs**, ajouter l'URL de la page de jumelage
  (ex. `https://ton-domaine.vercel.app/pairing`) pour que « Continuer avec Google » revienne correctement.
- Si la **confirmation d'email** est activée, la création de compte demande de confirmer
  l'email avant de pouvoir jumeler (message déjà géré dans la page).

La TV ouvre `…/pairing?code=XXXX` → l'utilisateur se connecte → la ligne `tv_pairings`
correspondante passe à `status = 'paired'`.

---

## Domaine personnalisé
Project Settings → **Domains** → ajouter votre domaine et suivre les instructions DNS.

## Notes
- Thème clair/sombre, FR/EN et panneau Tweaks fonctionnent sans serveur.
- Supabase est appelé côté navigateur (clé `anon` publique).
- Si vous modifiez `styles.css`, incrémentez `?v=` dans `index.html` pour forcer le cache.
