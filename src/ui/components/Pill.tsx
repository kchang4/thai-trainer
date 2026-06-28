import type { HTMLAttributes } from "react";

export function Pill({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1",
        "text-sm font-semibold bg-bg text-on-surface-muted border border-border",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
