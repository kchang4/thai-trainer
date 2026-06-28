import type { ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className = "", children, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={[
        "inline-flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-on-primary text-2xl shadow-button",
        "transition active:translate-y-1 active:shadow-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
