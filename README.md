# guess the login

Un Wordle sur les logins de la piscine 42 d'Angoulême, où trouver la réponse ne
suffit pas : il faut aller rencontrer la personne pour marquer le point.

Le but n'est pas de deviner vite, c'est de connaître les gens de sa piscine
avant la fin du mois.

## Règles

- Chaque jour, le login d'un autre piscineux est tiré au hasard.
- Essais illimités, mais chacun coûte un point. Le plus bas gagne.
- Une proposition doit être un login existant, de la même longueur que la cible.
  Vert : bonne place. Jaune : présent ailleurs. Gris : absent.
- Trouvé, tu obtiens un QR code. La cible le scanne depuis son propre compte 42 :
  c'est elle qui prouve la rencontre.
- La signature rembourse `SIGN_BONUS_ATTEMPTS` essais et clôt la cible
  définitivement. Sans signature, elle pourra retomber un autre jour.
- À minuit, heure de Paris, la manche du jour expire, trouvée ou non.
- Classement : cibles signées, puis trouvées, puis le moins d'essais.

## Structure

```
backend/    NestJS + Prisma + Postgres (Supabase)
frontend/   React + TypeScript + Vite
```

Deux branches suivent le travail en cours : `back` et `front`. `main` est
l'intégration des deux.

## Backend

NestJS 11, Prisma 7 sur une base Supabase, authentification OAuth 42 avec JWT et
refresh tokens tournants.

La whitelist des joueurs n'est pas un fichier : `PoolService` interroge l'API 42
au démarrage pour récupérer la piscine du mois en cours sur le campus configuré,
avec les noms et les portraits. Les logins de `EXTRA_LOGINS` (staff, anciens
élèves) sont ajoutés en plus. Un login absent de cette table ne peut pas se
connecter, et la contrainte est portée par la base : `User.login` est une clé
étrangère vers `Swimmer.login`.

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate deploy
npm run start:dev
```

Voir [backend/docs/BACKEND.md](backend/docs/BACKEND.md) pour le détail de l'API
et des contraintes.

## Frontend

React 19, Vite 8, React Router 7. CSS écrit à la main autour de tokens en
`:root`, sans framework ni librairie de composants.

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL pointe sur le backend
npm run dev
```

## Variables d'environnement

**backend/.env**

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Postgres, pooler transaction (port 6543) |
| `DIRECT_URL` | Postgres, connexion directe (port 5432), utilisée par les migrations |
| `FT_OAUTH_CLIENT_ID` / `FT_OAUTH_CLIENT_SECRET` | application sur profile.intra.42.fr |
| `FT_OAUTH_REDIRECT_URI` | doit correspondre au caractère près à celle déclarée sur l'intra |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `FRONTEND_URL` | où rediriger après l'authentification 42 |
| `FT_CAMPUS_ID` | 31 pour Angoulême |
| `EXTRA_LOGINS` | logins hors piscine ayant accès au jeu |
| `HIDDEN_LOGINS` | logins masqués du trombinoscope et du classement |
| `SIGN_BONUS_ATTEMPTS` | essais remboursés par une signature |
| `SIGN_TOKEN_TTL` | durée de vie d'un token QR, en secondes |
| `POOL_SYNC_ON_BOOT` | `false` pour désactiver le sync au démarrage |

**frontend/.env**

| Variable | Rôle |
| --- | --- |
| `VITE_API_URL` | URL du backend |

## Déploiement

Le backend tourne sur Railway avec `backend` comme Root Directory. Le client
Prisma est généré au `postinstall` et les migrations sont appliquées au
démarrage, avant que le serveur écoute.

Le frontend est déployé sur Vercel depuis `frontend`. Le `vercel.json` réécrit
toutes les routes vers `index.html`, sans quoi un rafraîchissement ou un QR
scanné tombe sur une 404.

Les trois URLs doivent rester cohérentes : `VITE_API_URL` côté Vercel,
`FRONTEND_URL` et `FT_OAUTH_REDIRECT_URI` côté Railway, et la même redirect URI
déclarée sur l'intra.

## Sécurité

Le QR n'encode pas d'identité, seulement un token de manche valable une minute
et régénéré toutes les 30 secondes. C'est le JWT du scanneur qui identifie le
signataire, donc une capture d'écran partagée ne sert à rien : le serveur refuse
si le login du scanneur n'est pas celui de la cible.

La RLS est activée sur toutes les tables, sans policy, pour fermer l'accès via
l'API de données de Supabase. Le backend s'y connecte en direct avec le rôle
propriétaire, qui la contourne.
