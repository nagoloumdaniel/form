import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { fieldStateClass, inputClass } from "./field";

type TextInputProps = ComponentProps<"input"> & { invalid?: boolean };

export function TextInput({ className, invalid, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, fieldStateClass(invalid), className)}
    />
  );
}
