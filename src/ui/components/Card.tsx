import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-lg bg-surface p-6 shadow-md border border-border",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
