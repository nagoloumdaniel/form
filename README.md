# Espace entreprise

Application Next.js de connexion B2B, de réinitialisation de mot de passe et de tableau de bord protégé.

## Fonctionnalités

- `/login` : authentification par e-mail et mot de passe, avec session HTTP-only.
- `/dashboard` : espace protégé par la session utilisateur et déconnexion sécurisée.
- `/forgot-password` : demande d'un code de réinitialisation neutre par e-mail.
- `/verify-code` : validation du code à usage unique.
- `/new-password` : changement de mot de passe à l'aide d'un ticket temporaire.

## Stack

Next.js 16, TypeScript, React, Tailwind CSS v4, Drizzle ORM, Neon Postgres, Resend, Zod et bcryptjs.

## Développement

```bash
npm install
npm run dev
```

Variables requises dans `.env.local` :

- `DATABASE_URL`
- `RESET_CODE_SECRET`

Variables e-mail et URL :

- `RESEND_API_KEY`
- `RESEND_FROM`
- `APP_URL`

Le schéma peut être appliqué à une base configurée avec :

```bash
npm run db:push
```

## Vérifications

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

## Sécurité

- Les mots de passe sont hachés avec bcrypt.
- Les codes et tickets sont hachés avec HMAC-SHA256 et expirent.
- Les sessions sont signées côté serveur et stockées dans un cookie HTTP-only.
- Les réponses API sont privées et désactivent la mise en cache.
- Les demandes de réinitialisation ne révèlent pas si un compte existe.
- Les limites de débit sont stockées en base et les corps JSON sont limités.
- Les fichiers d'environnement locaux et les fichiers Claude sont ignorés par Git.

Les identifiants de test ne sont pas documentés dans le dépôt. Utilisez un compte de développement géré hors du code source.
