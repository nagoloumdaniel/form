import { and, eq, isNull } from "drizzle-orm";
import { after } from "next/server";

import { badRequest, fail, invalid, ok, tooMany, unexpected } from "@/lib/api/errors";
import { clientIp, readJsonBody } from "@/lib/api/request";
import { generateResetCode, hashResetCode } from "@/lib/auth/code";
import { authConfig } from "@/lib/auth/config";
import { consumeRateLimit, maybePurge } from "@/lib/auth/throttle";
import { attachEmail, clearTicket } from "@/lib/auth/ticket-cookie";
import { getDb, schema } from "@/lib/db";
import { sendResetCode } from "@/lib/mail/send";
import { forgotPasswordSchema } from "@/lib/validation/auth";

const UNKNOWN_ACCOUNT = "Cet utilisateur n'est pas inscrit sur la plateforme.";
const HONEYPOT_RESPONSE = "Si un compte existe pour cette adresse, le code arrive dans quelques instants.";

async function issueCode(email: string, userId: string) {
  const db = getDb();
  await db
    .update(schema.passwordResetCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(schema.passwordResetCodes.userId, userId),
        isNull(schema.passwordResetCodes.usedAt),
      ),
    );

  const code = generateResetCode();
  await db.insert(schema.passwordResetCodes).values({
    userId,
    codeHash: hashResetCode(code, userId),
    expiresAt: new Date(Date.now() + authConfig.codeTtlMinutes * 60_000),
  });

  await sendResetCode(email, code);
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    // Champ piège, invisible pour une personne, rempli par les robots.
    if (typeof body === "object" && (body as { company?: unknown }).company) return ok(HONEYPOT_RESPONSE);

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error);

    const { email } = parsed.data;

    const byIp = await consumeRateLimit(
      `forgot:ip:${clientIp(request)}`,
      authConfig.limits.forgotIp,
    );
    if (!byIp.allowed) return tooMany(byIp.retryAfter);

    const byEmail = await consumeRateLimit(`forgot:email:${email}`, authConfig.limits.forgotEmail);
    if (!byEmail.allowed) return tooMany(byEmail.retryAfter);

    const db = getDb();
    const [user] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (!user) return fail(404, UNKNOWN_ACCOUNT);

    after(() => issueCode(email, user.id));
    after(maybePurge);

    // Un ticket déjà en circulation ne survit pas à une nouvelle demande.
    return attachEmail(clearTicket(ok("Un nouveau code arrive dans quelques instants.")), email);
  } catch (error) {
    return unexpected(error);
  }
}
