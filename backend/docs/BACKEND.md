# Guess the Swimmer — backend

NestJS + Prisma + Supabase (Postgres).

## Règles du jeu

- **Whitelist** : un login 42 absent de la table `Swimmer` ne peut pas se connecter.
- Chaque joueur reçoit **une cible par jour**, tirée au hasard. Pas de report :
  non trouvée à minuit (Europe/Paris) la manche passe en `expired`.
- Une cible **validée** ne retombe jamais. Une cible ratée ou non signée peut
  retomber un autre jour.
- **Essais illimités**, chaque tentative coûte **+1 point**. Le plus bas gagne.
- Une tentative doit être un login de la whitelist, de la **même longueur** que la
  cible. Retour vert / jaune / gris.
- Trouvé → la manche passe en `solved`. Le trouveur affiche un **QR**, la **cible le
  scanne depuis son compte connecté** → `validated`, et **`SIGN_BONUS_ATTEMPTS`
  essais sont remboursés**.
- **Classement** : `validated DESC`, puis `score ASC`
  avec `score = totalEssais − SIGN_BONUS_ATTEMPTS × validated`.

## Whitelist

Elle est reconstruite au démarrage par `PoolService` (`OnModuleInit`), depuis
l'API 42 — il n'y a plus de CSV.

- **Piscineux** : `/v2/campus/{FT_CAMPUS_ID}/users` filtré sur la piscine du mois
  en cours, calculée en heure de Paris. Insérés avec `staff = false`.
- **Staff** : les logins de `EXTRA_LOGINS`, insérés avec `staff = true`. Ils ont
  accès au jeu mais ne sont pas tirés comme cible.

Le sync ne supprime jamais de ligne : un login présent en base mais absent de
l'API est seulement loggé en warning. Si l'API est injoignable, le back démarre
avec la whitelist déjà en base.

`POOL_SYNC_ON_BOOT=false` désactive le sync au démarrage.

### Ajouter un membre du staff

Deux façons :

1. Ajouter le login à `EXTRA_LOGINS` dans le `.env`, puis redémarrer le back.
2. Insérer directement la ligne dans Supabase → *Table Editor* → `Swimmer`
   (`login`, `staff = true`). Effet immédiat, sans redémarrage.

Pour en retirer un, il faut supprimer la ligne : enlever le login de
`EXTRA_LOGINS` ne le déclasse pas, le sync ne fait que des `upsert`.

## Flux du QR

Le QR n'encode pas d'identité, seulement un token de manche à durée de vie courte
(`SIGN_TOKEN_TTL`, régénéré côté trouveur). C'est le **JWT du scanneur** qui prouve
qui signe : impossible de valider avec une capture d'écran ou le compte de
quelqu'un d'autre.

```
Trouveur (manche solved)                  Cible (connectée)
   |                                          |
   |  GET /game/rounds/:id/qr                 |
   |  -> { token, expiresAt }                 |
   |  affiche QR(token)                       |
   |----------------- scan ------------------>|
   |                                          |  POST /game/sign { token }
   |                                          |  Authorization: Bearer <JWT cible>
   |                                          v
   |                              vérifie : token valide + non expiré
   |                                        round.status == 'solved'
   |                                        scanner.login == round.targetLogin
   |                                        scanner.ftId  != round.playerId
   |                                          |
   |                              round -> validated, bonus appliqué
```

## Contraintes portées par la base

- `@@unique([playerId, assignedOn])` sur `Round` → une seule cible par jour.
- Index unique partiel `("playerId", "targetLogin") WHERE status = 'validated'`
  (migration `20260804130900`) → une cible n'est validée qu'une fois. Prisma ne
  sait pas exprimer un index partiel, il est écrit en SQL dans la migration.
- `User.login` est une FK vers `Swimmer.login` → un joueur hors whitelist ne peut
  pas exister en base, même si le code d'auth a un bug.

## API

| Méthode | Route                 | Auth | Rôle                                                |
| ------- | --------------------- | ---- | --------------------------------------------------- |
| `GET`   | `/auth/42`            | —    | redirige vers l'autorisation 42                      |
| `GET`   | `/auth/42/callback`   | —    | whitelist, upsert joueur, redirige avec les tokens   |
| `POST`  | `/refresh`            | —    | `{ refresh_token }` → nouveaux tokens                |
| `POST`  | `/logout`             | JWT  | révoque le refresh token                             |
| `GET`   | `/me`                 | JWT  | profil du joueur                                     |
| `GET`   | `/game/round`         | JWT  | manche du jour (longueur de la cible, pas le login)  |
| `POST`  | `/game/guess`         | JWT  | `{ guess }` → résultat coloré, `solved`, `attempts`  |
| `GET`   | `/game/rounds/:id/qr` | JWT  | token QR rotatif, manche `solved` du joueur          |
| `POST`  | `/game/sign`          | JWT  | `{ token }` — appelé par **la cible**                |
| `GET`   | `/game/pending`       | JWT  | manches trouvées en attente de signature             |
| `GET`   | `/game/leaderboard`   | JWT  | classement du mois                                   |

## Démarrer

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run start:dev
```

La whitelist se remplit toute seule au premier démarrage.
