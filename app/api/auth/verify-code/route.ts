import { and, desc, eq, gt, inArray, isNull, lt, sql } from "drizzle-orm";

import {
  badRequest,
  fail,
  invalid,
  ok,
  tooMany,
  unexpected,
} from "@/lib/api/errors";
import { clientIp, readJsonBody } from "@/lib/api/request";
import {
  generateResetTicket,
  hashResetCode,
  hashResetTicket,
  matchesHash,
} from "@/lib/auth/code";
import { authConfig } from "@/lib/auth/config";
import { consumeRateLimit } from "@/lib/auth/throttle";
import { attachTicket } from "@/lib/auth/ticket-cookie";
import { getDb, schema } from "@/lib/db";
import { verifyCodeSchema } from "@/lib/validation/auth";

/** Réponse unique pour tous les échecs, l'API ne dit pas si le compte existe. */
function rejected() {
  return fail(400, "Code invalide ou expiré.", {
    code: "Code invalide ou expiré. Demandez-en un nouveau.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    const parsed = verifyCodeSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error);

    const byIp = await consumeRateLimit(
      `verify:ip:${clientIp(request)}`,
      authConfig.limits.verifyIp,
    );
    if (!byIp.allowed) return tooMany(byIp.retryAfter);

    const { email, code } = parsed.data;
    const db = getDb();
    const codes = schema.passwordResetCodes;

    const [user] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) return rejected();

    const latest = db
      .select({ id: codes.id })
      .from(codes)
      .where(and(eq(codes.userId, user.id), isNull(codes.usedAt)))
      .orderBy(desc(codes.createdAt))
      .limit(1);

    // Incrément et contrôle du quota dans la même requête, pas de course possible.
    const [attempt] = await db
      .update(codes)
      .set({ attempts: sql`${codes.attempts} + 1` })
      .where(
        and(
          inArray(codes.id, latest),
          lt(codes.attempts, authConfig.maxCodeAttempts),
          gt(codes.expiresAt, new Date()),
        ),
      )
      .returning({
        id: codes.id,
        codeHash: codes.codeHash,
        expiresAt: codes.expiresAt,
      });

    if (!attempt) return rejected();
    if (!matchesHash(hashResetCode(code, user.id), attempt.codeHash))
      return rejected();

    const ticket = generateResetTicket();
    // Le ticket n'allonge jamais la durée de vie du code.
    const ticketExpiresAt = new Date(
      Math.min(
        Date.now() + authConfig.ticketTtlMinutes * 60_000,
        attempt.expiresAt.getTime(),
      ),
    );
    const [issued] = await db
      .update(codes)
      .set({
        ticketHash: hashResetTicket(ticket),
        ticketExpiresAt,
      })
      .where(and(eq(codes.id, attempt.id), isNull(codes.usedAt)))
      .returning({ id: codes.id });

    if (!issued) return rejected();

    return attachTicket(ok("Code validé."), ticket);
  } catch (error) {
    return unexpected(error);
  }
}
