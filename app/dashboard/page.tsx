import { cookies } from "next/headers";
import { LayoutDashboard, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { authConfig } from "@/lib/auth/config";
import { getDb, schema } from "@/lib/db";
import { verifySession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

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
  const userId = verifySession(session);
  if (!userId) redirect("/login");

  const [user] = await getDb()
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-14">
      <section className="mx-auto w-full max-w-6xl rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8 lg:p-10">
        <header className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div>
            <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">
              <LayoutDashboard aria-hidden className="size-4" />
              Espace entreprise
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink">Votre dashboard</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">Vous êtes connecté à votre espace sécurisé.</p>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink">
              <Mail aria-hidden className="size-4 text-muted" />
              {user.email}
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-44">
          <LogoutButton />
          </div>
        </header>
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
