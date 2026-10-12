export const authConfig = {
  codeAlphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  codeLength: 6,
  codeGroupSize: 3,
  codeTtlMinutes: 30,
  ticketTtlMinutes: 10,
  ticketCookie: "__Host-reset_ticket",
  emailCookie: "__Host-reset_email",
  sessionCookie: process.env.NODE_ENV === "production" ? "__Host-session" : "session",
  sessionTtlSeconds: 60 * 60 * 8,
  rememberedSessionTtlSeconds: 60 * 60 * 24 * 30,
  maxCodeAttempts: 5,
  limits: {
    forgotEmail: { max: 5, windowMinutes: 15 },
    forgotIp: { max: 12, windowMinutes: 15 },
    verifyIp: { max: 20, windowMinutes: 15 },
    resetIp: { max: 10, windowMinutes: 15 },
    loginIp: { max: 15, windowMinutes: 5 },
  },
  maxBodyBytes: 4096,
  bcryptCost: 12,
  minPasswordLength: 10,
} as const;

export function appUrl() {
  const raw =
    process.env.APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}
