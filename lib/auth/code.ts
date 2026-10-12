import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { normalizeResetCode } from "./code-format";
import { authConfig } from "./config";

function secret() {
  const value = process.env.RESET_CODE_SECRET;
  if (!value) throw new Error("RESET_CODE_SECRET est absent de l'environnement.");
  return value;
}

export function generateResetCode() {
  const { codeAlphabet, codeLength } = authConfig;
  let code = "";
  for (let i = 0; i < codeLength; i += 1) {
    code += codeAlphabet[randomInt(codeAlphabet.length)];
  }
  return code;
}

/** HMAC lié à l'utilisateur, le secret vit hors de la base. */
export function hashResetCode(code: string, userId: string) {
  return createHmac("sha256", secret())
    .update(`${userId}:${normalizeResetCode(code)}`)
    .digest("hex");
}

/** Jeton remis après vérification du code, porte la saisie du nouveau mot de passe. */
export function generateResetTicket() {
  return randomBytes(32).toString("base64url");
}

export function hashResetTicket(ticket: string) {
  return createHmac("sha256", secret()).update(`ticket:${ticket}`).digest("hex");
}

export function matchesHash(candidateHash: string, storedHash: string) {
  const a = Buffer.from(candidateHash);
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
}
