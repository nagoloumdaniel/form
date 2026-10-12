"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Check } from "lucide-react";

type CheckboxProps = CheckboxPrimitive.CheckboxProps & { id: string; label: string };

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckboxPrimitive.Root
        {...props}
        id={id}
        className="flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border border-line bg-field outline-none transition focus-visible:ring-[3px] focus-visible:ring-accent/30 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <CheckboxPrimitive.Indicator className="text-accent-ink">
          <Check aria-hidden className="size-3.5" strokeWidth={2.75} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <LabelPrimitive.Root htmlFor={id} className="text-[13px] text-muted select-none">
        {label}
      </LabelPrimitive.Root>
    </div>
  );
}
