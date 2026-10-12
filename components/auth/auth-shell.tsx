import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="flex min-w-0 flex-col px-6 py-6 sm:px-10 sm:py-10 lg:px-16">
        <main className="flex flex-1 items-center py-8 sm:py-12">
          <div className="mx-auto w-full min-w-0 max-w-[25.5rem]">{children}</div>
        </main>
      </div>
      <AuthAside />
    </div>
  );
}

function AuthAside() {
  return (
    <aside className="relative hidden border-l border-line bg-surface lg:block">
      <div aria-hidden className="panel-grid absolute inset-0" />
      <div className="absolute inset-x-16 bottom-16">
        <div className="mb-6 h-px w-10 bg-ink/20" />
        <p className="max-w-sm font-serif text-[22px] leading-snug text-ink">
          Vos tableaux de bord, vos équipes et vos exports au même endroit.
        </p>
        <p className="mt-3 text-[13px] text-muted">Accès réservé aux comptes entreprise.</p>
      </div>
    </aside>
  );
}
