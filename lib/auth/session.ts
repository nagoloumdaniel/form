import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { NextResponse } from "next/server";

import { authConfig } from "./config";

const VERSION = "v1";
const secureCookie = authConfig.sessionCookie.startsWith("__Host-");

function secret() {
  const value = process.env.RESET_CODE_SECRET;
  if (!value) throw new Error("RESET_CODE_SECRET est absent de l'environnement.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret())
    .update(value)
    .digest("base64url");
}

export function attachSession(response: NextResponse, userId: string, remember: boolean) {
  const expiresAt = Math.floor(Date.now() / 1000) +
    (remember ? authConfig.rememberedSessionTtlSeconds : authConfig.sessionTtlSeconds);
  const payload = `${VERSION}.${userId}.${expiresAt}.${randomBytes(16).toString("base64url")}`;

  response.cookies.set({
    name: authConfig.sessionCookie,
    value: `${payload}.${sign(payload)}`,
    httpOnly: true,
    secure: secureCookie,
    sameSite: "strict",
    path: "/",
    maxAge: expiresAt - Math.floor(Date.now() / 1000),
  });
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set({
    name: authConfig.sessionCookie,
    value: "",
    httpOnly: true,
    secure: secureCookie,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function verifySession(value: string | undefined) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 5 || parts[0] !== VERSION) return null;

  const [version, userId, expiresAt, nonce, signature] = parts;
  if (!version || !userId || !expiresAt || !nonce || !signature) return null;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return null;

  const payload = `${version}.${userId}.${expiresAt}.${nonce}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return userId;
}
