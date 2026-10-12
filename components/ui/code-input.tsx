"use client";

import {
  Fragment,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { authConfig } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

type CodeState = "idle" | "error" | "success";

type CodeInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  state?: CodeState;
  describedBy?: string;
  readOnly?: boolean;
  disabled?: boolean;
};

const stateClass: Record<CodeState, string> = {
  idle: "border-line focus:border-accent focus:ring-accent/15",
  error: "border-danger text-danger focus:border-danger focus:ring-danger/20",
  success:
    "border-success text-success focus:border-success focus:ring-success/20",
};

const { codeLength, codeGroupSize, codeAlphabet } = authConfig;
const forbidden = new RegExp(`[^${codeAlphabet}]`, "g");
const groups = Array.from(
  { length: Math.ceil(codeLength / codeGroupSize) },
  (_, group) =>
    Array.from(
      { length: codeGroupSize },
      (_, slot) => group * codeGroupSize + slot,
    ),
);

function clean(raw: string) {
  return raw.toUpperCase().replace(forbidden, "").slice(0, codeLength);
}

/** Les cases vides sont des espaces, la longueur reste fixe et rien ne se décale. */
function toSlots(value: string) {
  return value.padEnd(codeLength, " ").slice(0, codeLength).split("");
}

export function CodeInput({
  id,
  value,
  onChange,
  state = "idle",
  describedBy,
  readOnly,
  disabled,
}: CodeInputProps) {
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const slots = toSlots(value);

  // Sélection replacée après le commit de React, le caret reste au bon endroit.
  const moveTo = (index: number) => {
    const cell = cells.current[Math.min(Math.max(index, 0), codeLength - 1)];
    cell?.focus();
    requestAnimationFrame(() => cell?.select());
  };

  const write = (index: number, raw: string) => {
    const typed = clean(raw);
    if (!typed) return;

    // Un collage complet remplace le code entier, où que soit le curseur.
    const start = typed.length >= codeLength ? 0 : index;
    const next = toSlots(value);
    typed.split("").forEach((char, offset) => {
      if (start + offset < codeLength) next[start + offset] = char;
    });

    onChange(next.join(""));
    moveTo(start + typed.length);
  };

  const handleKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        const target =
          slots[index] !== " " || event.key === "Delete" ? index : index - 1;
        if (target < 0) return;
        const next = toSlots(value);
        next[target] = " ";
        onChange(next.join(""));
        moveTo(target);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTo(index - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTo(index + 1);
      }
    };

  const handlePaste =
    (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      write(index, event.clipboardData.getData("text"));
    };

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={describedBy}
      className="flex w-full min-w-0 items-center gap-2 sm:gap-2.5"
    >
      {groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {groupIndex > 0 ? (
            <span
              aria-hidden
              className="h-px w-2.5 shrink-0 bg-muted/45 sm:w-3.5"
            />
          ) : null}
          <div className="flex min-w-0 flex-1 gap-1.5 sm:gap-2">
            {group.map((index) => (
              <input
                key={index}
                ref={(node) => {
                  cells.current[index] = node;
                }}
                id={index === 0 ? id : `${id}-${index}`}
                value={slots[index] === " " ? "" : slots[index]}
                onChange={(event) => write(index, event.target.value)}
                onKeyDown={handleKeyDown(index)}
                onPaste={handlePaste(index)}
                onFocus={(event) => event.target.select()}
                onMouseUp={(event) => event.currentTarget.select()}
                readOnly={readOnly}
                disabled={disabled}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                spellCheck={false}
                maxLength={1}
                size={1}
                aria-label={`Caractère ${index + 1} sur ${codeLength}`}
                aria-invalid={state === "error" || undefined}
                className={cn(
                  "h-12 w-full min-w-0 flex-1 rounded-lg border bg-field p-0 text-center text-base font-medium text-ink uppercase",
                  "outline-none transition-colors focus:ring-[3px] sm:h-14 sm:text-lg",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  stateClass[state],
                )}
              />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
