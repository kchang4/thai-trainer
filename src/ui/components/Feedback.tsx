import { Button } from "./Button";

export type FeedbackKind = "correct" | "wrong";

export interface FeedbackProps {
  kind: FeedbackKind;
  message: string;
  onContinue: () => void;
}

export function Feedback({ kind, message, onContinue }: FeedbackProps) {
  const correct = kind === "correct";
  return (
    <div
      role="status"
      data-kind={kind}
      className={[
        "mt-4 flex flex-col gap-3 rounded-lg p-4",
        correct ? "bg-success text-on-success" : "bg-error text-on-error",
      ].join(" ")}
    >
      <p className="font-display text-lg font-bold">
        {correct ? "✅ " : "❌ "}
        {message}
      </p>
      <Button variant={correct ? "success" : "error"} onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
