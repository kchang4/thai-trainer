export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-4 w-full overflow-hidden rounded-full bg-bg border border-border"
    >
      <div
        className="h-full rounded-full bg-accent-teal transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
