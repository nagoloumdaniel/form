import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded text-[13px] text-muted outline-none transition hover:text-ink focus-visible:ring-[3px] focus-visible:ring-accent/30"
    >
      <ArrowLeft aria-hidden className="size-3.5" />
      {children}
    </Link>
  );
}
