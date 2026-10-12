import { CircleAlert, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type NoticeProps = {
  tone: "error" | "info";
  children: React.ReactNode;
  className?: string;
};

const tones = {
  error: { icon: CircleAlert, style: "border-danger/30 bg-danger/8 text-danger" },
  info: { icon: Info, style: "border-line bg-surface text-muted" },
};

export function Notice({ tone, children, className }: NoticeProps) {
  const { icon: Icon, style } = tones[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-relaxed",
        style,
        className,
      )}
    >
      <Icon aria-hidden className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
