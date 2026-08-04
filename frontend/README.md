# Guess the Swimmer — frontend

React + TypeScript + Vite. Wordle-like sur les logins de la piscine August 2026.

## Lancer

```bash
npm install
cp .env.example .env   # VITE_API_URL = URL du back NestJS
npm run dev            # http://localhost:5173
```

## Connexion 42

Le flux est identique à celui de `ft_predict` (OAuth côté back, tokens côté front) :

1. `Login` redirige le navigateur vers `GET {API}/auth/42`
2. le back pose un cookie `oauth_state` et redirige vers `api.intra.42.fr/oauth/authorize`
3. 42 rappelle `GET {API}/auth/42/callback?code=…&state=…`
4. le back vérifie le state, échange le code, puis redirige vers
   `{FRONTEND_URL}/auth/callback#access_token=…&refresh_token=…`
5. `AuthCallback` lit le fragment, stocke les tokens et appelle `GET {API}/me`

L'access token vit en mémoire, le refresh token dans `localStorage` (`gts_refresh`).
Sur un `401`, `src/api/client.ts` rejoue la requête après un `POST /refresh`.

### Ce que le back doit exposer

| Méthode | Route               | Rôle                                                   |
| ------- | ------------------- | ------------------------------------------------------ |
| `GET`   | `/auth/42`          | redirige vers l'autorisation 42                        |
| `GET`   | `/auth/42/callback` | redirige vers `{FRONTEND_URL}/auth/callback#…tokens`   |
| `POST`  | `/refresh`          | `{ refresh_token }` → `{ access_token, refresh_token }` |
| `POST`  | `/logout`           | `{ refresh_token }`                                    |
| `GET`   | `/me`               | `{ id, login, email, ftPfpUrl, campus }`               |

Variables d'env côté back : `FT_OAUTH_CLIENT_ID`, `FT_OAUTH_CLIENT_SECRET`,
`FT_OAUTH_REDIRECT_URI`, `FRONTEND_URL`.

## Jeu

Pour l'instant le moteur tourne **en local** (`src/game/engine.ts`) sur la liste
de `src/data/swimmers.ts`, générée depuis `../logins.csv`. Les routes serveur
prévues sont déjà déclarées dans `src/api/routes.ts` (`ROUTES.game`) : quand le
back sera prêt, il suffira de remplacer `useGame` par des appels à `api`.

- 6 essais, le mot secret est un login de la piscine
- les propositions doivent être des logins existants de la même longueur
- vert = bien placé, jaune = présent ailleurs, gris = absent
