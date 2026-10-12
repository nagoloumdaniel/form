import { createHash } from "node:crypto";

import { lt, or, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

type Limit = { max: number; windowMinutes: number };

/** Clé de longueur fixe, une valeur hostile ne peut pas gonfler la table. */
function bucketKey(bucket: string) {
  return createHash("sha256").update(bucket).digest("hex");
}

/**
 * Un seul UPSERT par appel : le verrou de ligne de Postgres sérialise les
 * incréments, donc le plafond tient même sous rafale concurrente.
 */
export async function consumeRateLimit(bucket: string, limit: Limit) {
  const db = getDb();
  const windowMs = limit.windowMinutes * 60_000;
  const start = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const result = await db.execute<{ hits: number }>(sql`
    insert into rate_counters (bucket, window_start, hits)
    values (${bucketKey(bucket)}, ${start.toISOString()}, 1)
    on conflict (bucket, window_start)
      do update set hits = rate_counters.hits + 1
    returning hits
  `);

  const hits = Number(result.rows[0]?.hits ?? 0);
  const retryAfter = Math.max(Math.ceil((start.getTime() + windowMs - Date.now()) / 1000), 1);

  if (hits > limit.max) return { allowed: false as const, retryAfter };
  return { allowed: true as const, retryAfter: 0 };
}

/** Ménage des compteurs et des codes périmés, hors du chemin de réponse. */
export async function purgeExpired() {
  const db = getDb();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60_000);

  await db.delete(schema.rateCounters).where(lt(schema.rateCounters.windowStart, dayAgo));
  await db
    .delete(schema.passwordResetCodes)
    .where(
      or(
        lt(schema.passwordResetCodes.expiresAt, dayAgo),
        lt(schema.passwordResetCodes.createdAt, dayAgo),
      ),
    );
}

/** Une purge de temps en temps suffit, inutile de la payer à chaque appel. */
export function maybePurge() {
  return Math.random() < 0.05 ? purgeExpired() : Promise.resolve();
}
