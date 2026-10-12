"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

type ConfirmationProps = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  children?: ReactNode;
};

export function Confirmation({ icon: Icon, title, description, children }: ConfirmationProps) {
  const container = useRef<HTMLDivElement>(null);

  // Le formulaire disparaît, le focus et le lecteur d'écran suivent la confirmation.
  useEffect(() => {
    container.current?.focus();
  }, []);

  return (
    <div ref={container} tabIndex={-1} className="outline-none">
      <span className="mb-6 flex size-10 items-center justify-center rounded-full border border-line bg-surface text-accent">
        <Icon aria-hidden className="size-4.5" />
      </span>
      <h1 className="font-serif text-[1.625rem] leading-[1.15] tracking-[-0.015em] text-ink sm:text-[1.75rem]">
        {title}
      </h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{description}</p>
      {children ? <div className="mt-8 space-y-3">{children}</div> : null}
    </div>
  );
}
