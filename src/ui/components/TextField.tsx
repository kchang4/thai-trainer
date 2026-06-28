import { useId, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  thai?: boolean;
}

export function TextField({ label, thai = false, className = "", id, ...rest }: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-semibold text-on-surface-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "rounded-md border border-border bg-surface px-3 py-2 text-on-surface",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
          thai ? "font-thai text-lg" : "",
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}
