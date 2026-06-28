import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Feedback } from "./Feedback";

describe("Feedback", () => {
  it("shows the message and continues on click", async () => {
    const onContinue = vi.fn();
    render(<Feedback kind="wrong" message="Answer: sawatdee" onContinue={onContinue} />);
    expect(screen.getByText(/answer: sawatdee/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("exposes the kind via data-kind", () => {
    render(<Feedback kind="correct" message="Nice!" onContinue={() => {}} />);
    expect(screen.getByRole("status")).toHaveAttribute("data-kind", "correct");
  });
});
