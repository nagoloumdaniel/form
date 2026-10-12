import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "quiet";
  pending?: boolean;
};

const variants = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover active:translate-y-px disabled:hover:bg-accent",
  quiet: "border border-line bg-surface text-ink hover:border-ink/25 active:translate-y-px",
};

/** Mêmes styles pour les liens qui agissent comme bouton. */
export function buttonClass(variant: keyof typeof variants = "primary", className?: string) {
  return cn(
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-medium transition",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-accent/30",
    variants[variant],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  pending = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled ?? pending}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-medium transition",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-accent/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
    >
      {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
