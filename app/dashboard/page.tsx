import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { authConfig } from "@/lib/auth/config";
import { verifySession } from "@/lib/auth/session";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthenticatedDashboard />
    </Suspense>
  );
}

async function AuthenticatedDashboard() {
  await connection();
  const session = (await cookies()).get(authConfig.sessionCookie)?.value;
  if (!verifySession(session)) redirect("/login");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-line bg-surface p-8 shadow-sm sm:p-10">
        <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">Espace entreprise</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink">Votre dashboard</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">Vous êtes connecté à votre espace sécurisé.</p>
        <div className="mt-8 max-w-xs">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

function DashboardLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6 py-10">
      <section className="w-full max-w-2xl animate-pulse rounded-2xl border border-line bg-surface p-8 sm:p-10">
        <div className="h-4 w-32 rounded bg-line" />
        <div className="mt-5 h-10 w-64 rounded bg-line" />
        <div className="mt-4 h-5 w-80 max-w-full rounded bg-line" />
        <div className="mt-8 h-11 w-40 rounded-lg bg-line" />
      </section>
    </main>
  );
}
