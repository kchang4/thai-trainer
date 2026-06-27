import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeaningRecall } from "./MeaningRecall";
import type { Card } from "../../core/types";

const card: Card = { id: "b-hello", thai: "สวัสดี", romanization: "sawatdee", english: "hello", category: "greetings", tier: 1, source: "builtin" };

describe("MeaningRecall", () => {
  it("reveals the english meaning then reports the chosen grade", async () => {
    const onGrade = vi.fn();
    render(<MeaningRecall card={card} showScript={false} onGrade={onGrade} />);
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /show answer/i }));
    expect(screen.getByText("hello")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^good$/i }));
    expect(onGrade).toHaveBeenCalledWith("good");
  });
});
