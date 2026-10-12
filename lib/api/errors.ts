import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { DatabaseNotConfiguredError } from "@/lib/db";

export type ApiResult = { message: string; fieldErrors?: Record<string, string> };

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export function ok(message: string) {
  return NextResponse.json<ApiResult>({ message }, { headers: NO_STORE });
}

export function fail(
  status: number,
  message: string,
  fieldErrors?: Record<string, string>,
  headers?: Record<string, string>,
) {
  return NextResponse.json<ApiResult>(
    { message, fieldErrors },
    { status, headers: { ...NO_STORE, ...headers } },
  );
}

export function tooMany(retryAfter: number) {
  const minutes = Math.ceil(retryAfter / 60);
  return fail(429, `Trop de tentatives. Réessayez dans ${minutes} minutes.`, undefined, {
    "Retry-After": String(retryAfter),
  });
}

export function invalid(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fail(422, "Vérifiez les champs du formulaire.", fieldErrors);
}

export function badRequest() {
  return fail(400, "Requête invalide.");
}

export function unexpected(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return fail(503, "La base de données n'est pas configurée sur ce serveur.");
  }
  console.error("[api]", error);
  return fail(500, "Une erreur est survenue. Réessayez dans un instant.");
}
