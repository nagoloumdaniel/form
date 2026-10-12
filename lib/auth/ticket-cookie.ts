import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { authConfig } from "./config";

export const TICKET_COOKIE = authConfig.ticketCookie;

export function attachTicket(response: NextResponse, ticket: string) {
  response.cookies.set({
    name: TICKET_COOKIE,
    value: ticket,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: authConfig.ticketTtlMinutes * 60,
  });
  return response;
}

/** Un cookie `__Host-` ne s'efface que si la suppression porte les mêmes attributs. */
export function clearTicket(response: NextResponse) {
  response.cookies.set({
    name: TICKET_COOKIE,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function readTicket() {
  const jar = await cookies();
  return jar.get(TICKET_COOKIE)?.value ?? null;
}

/** Adresse mémorisée pour pré-remplir la page du code, sans la mettre dans l'URL. */
export function attachEmail(response: NextResponse, email: string) {
  response.cookies.set({
    name: authConfig.emailCookie,
    value: email,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: authConfig.codeTtlMinutes * 60,
  });
  return response;
}

export async function readEmail() {
  const jar = await cookies();
  return jar.get(authConfig.emailCookie)?.value ?? "";
}

/** Un échec ne laisse aucun reste côté navigateur, le parcours repart propre. */
export function clearResetCookies(response: NextResponse) {
  for (const name of [TICKET_COOKIE, authConfig.emailCookie]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: name === TICKET_COOKIE ? "strict" : "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}
