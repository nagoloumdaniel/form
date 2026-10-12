import { Loader2, type LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: LucideIcon;
  label: string;
  pending?: boolean;
  tone?: "quiet" | "accent";
};

const tones = {
  quiet: "text-muted hover:text-ink",
  accent: "text-accent hover:text-accent-hover",
};

export function IconButton({
  icon: Icon,
  label,
  pending = false,
  tone = "quiet",
  className,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type="button"
      disabled={disabled ?? pending}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-md outline-none transition",
        "focus-visible:ring-[3px] focus-visible:ring-accent/30 disabled:opacity-50",
        tones[tone],
        className,
      )}
    >
      {pending ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : (
        <Icon aria-hidden className="size-4" />
      )}
    </button>
  );
}
