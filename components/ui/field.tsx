import * as LabelPrimitive from "@radix-ui/react-label";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Field({ id, label, error, hint, action, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <LabelPrimitive.Root
          id={`${id}-label`}
          htmlFor={id}
          className="text-[13px] font-medium text-ink"
        >
          {label}
        </LabelPrimitive.Root>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-lg border border-line bg-field px-3.5 text-[15px] text-ink transition placeholder:text-muted outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15 disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted";

export function fieldStateClass(hasError?: boolean) {
  return hasError ? "border-danger focus:border-danger focus:ring-danger/15" : "";
}
