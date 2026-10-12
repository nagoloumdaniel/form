import { NextResponse, type NextRequest } from "next/server";

import { authConfig } from "@/lib/auth/config";

/** Pages qui marquent un retour au point de départ : on y repart sans aucun reste. */
const RESET_ENTRY_POINTS = new Set(["/login", "/forgot-password"]);

function wipeResetCookies(response: NextResponse) {
  for (const name of [authConfig.ticketCookie, authConfig.emailCookie]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: name === authConfig.ticketCookie ? "strict" : "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RESET_ENTRY_POINTS.has(pathname)) {
    return wipeResetCookies(NextResponse.next());
  }

  // Un cookie vidé reste parfois présent côté navigateur, on exige donc une valeur.
  if (pathname === "/new-password" && !request.cookies.get(authConfig.ticketCookie)?.value) {
    return NextResponse.redirect(new URL("/verify-code", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/forgot-password", "/new-password"],
};
