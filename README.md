# Connexion entreprise

Connexion et réinitialisation de mot de passe pour un dashboard B2B.

- `/login` : saisie validée côté serveur par `POST /api/auth/login`, aucune session créée, retourne un message de confirmation.
- `/forgot-password` : envoie un code de 6 caractères par e-mail, puis décompte de 3 secondes et redirection.
- `/verify-code` : saisie du code (3 + 3), contour rouge si refusé, vert si accepté, puis décompte de 3 secondes et redirection. L'adresse y est verrouillée, le crayon la rend modifiable et la coche renvoie un code à la nouvelle adresse sans quitter la page.
- `/new-password` : nouveau mot de passe, autorisé par un ticket en cookie httpOnly.

## Stack

Next.js 16, TypeScript, Tailwind v4, Radix (Label, Checkbox), lucide-react, Inter + Newsreader, Drizzle ORM, Neon Postgres, Resend, Zod, bcryptjs.

## Démarrage

```bash
npm install
npm run dev
```

`.env.local` contient déjà une base Neon de test et le schéma y est poussé.
Compte de test : `test@entreprise.fr` / `MotDePasse123`.
## Où lire le code envoyé

- Avec `RESEND_API_KEY` renseignée : dans la boîte de réception du destinataire, et dans le journal des envois sur resend.com/emails.
- Sans clé : dans la console du serveur (`npm run dev`), ligne `[reset] adresse -> ABC-DEF`.
- L'expéditeur par défaut `onboarding@resend.dev` n'autorise que l'envoi vers l'adresse du compte Resend. Pour écrire à n'importe qui, vérifier un domaine sur resend.com/domains puis le mettre dans `RESEND_FROM`.
`RESET_CODE_SECRET` est requis, il est déjà généré dans `.env.local`.

Sur une autre base : copier `.env.example` en `.env.local`, renseigner `DATABASE_URL`, puis `npm run db:push`.
Créer un utilisateur :

```bash
node -e "console.log(require('bcryptjs').hashSync('MotDePasse123', 12))"
```

```sql
insert into users (email, password_hash) values ('test@entreprise.fr', '<hash>');
```

## Déploiement Vercel

Importer le repo, ajouter `DATABASE_URL`, `RESET_CODE_SECRET`, `RESEND_API_KEY`, `RESEND_FROM` et `APP_URL` (domaine de prod).

## Choix de sécurité

- Code de 6 caractères, alphabet sans O/0/I/1, stocké en HMAC-SHA256 lié à l'utilisateur, jamais en clair.
- Code valable 30 minutes, 5 tentatives maximum, incrément atomique en base.
- Code vérifié puis échangé contre un ticket de 32 octets, valable 10 minutes, en cookie httpOnly SameSite lax. Le code ne passe donc pas dans l'URL de la page mot de passe.
- Ticket et mot de passe écrits dans une seule instruction SQL, donc tout ou rien, et un rejeu est refusé.
- `/new-password` est protégée par `proxy.ts` : sans ticket, redirection vers la saisie du code.
- Une nouvelle demande de code annule le ticket en circulation, et le ticket n'expire jamais après le code.
- Réponses et codes HTTP identiques que l'adresse existe ou non, e-mail envoyé après la réponse pour ne pas créer d'écart de latence.
- 5 demandes maximum par adresse toutes les 15 minutes.
- Mots de passe en bcrypt coût 12.
- Limites de débit en base (table `rate_counters`, un UPSERT verrouillé par ligne, exact sous rafale concurrente) : 5 demandes de code par adresse et 12 par IP toutes les 15 minutes, 20 vérifications de code par IP, 10 changements de mot de passe par IP, 15 connexions par IP toutes les 5 minutes. Les 429 portent un en-tête `Retry-After`.
- Corps JSON limité à 4 Ko et type MIME vérifié, champ piège sur la demande de code, double envoi bloqué côté client.
- CSP avec nonce par requête générée dans `proxy.ts` (`default-src 'self'`, `script-src` en `strict-dynamic`), plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`. Réponses d'API en `Cache-Control: no-store`.
- Cookies `__Host-` en `Secure` et `SameSite` strict pour le ticket, l'adresse ne transite jamais dans une URL.
- Clé de seau hachée en SHA-256 avant écriture, adresse plafonnée à 254 caractères, IP lue sur `x-vercel-forwarded-for` et non sur l'en-tête falsifiable.
- Le chemin de réponse de la demande de code ne touche jamais la table des comptes, aucun écart de latence selon que l'adresse existe ou non.
- Codes périmés et compteurs de plus de 24 heures purgés après la réponse.
- Aucun état mort possible : un échec efface les deux cookies du parcours, vide la saisie et ramène à la demande de code, et l'arrivée sur `/login` ou `/forgot-password` repart toujours d'un navigateur propre.
- CSP sans nonce, volontairement : les pages statiques sont rendues au build et ne peuvent pas porter un nonce par requête, le `strict-dynamic` bloquerait alors tous les scripts.

## Dépendances

`npm audit --omit=dev` : 0 vulnérabilité. Les alertes restantes viennent uniquement d'outils de développement (`eslint-config-next` via `fast-glob`, `drizzle-kit` via `esbuild-kit`) et ne partent pas en production.

Pas de session ni de cookie de connexion : la connexion réelle reste à brancher, c'est le choix assumé de cette maquette.
