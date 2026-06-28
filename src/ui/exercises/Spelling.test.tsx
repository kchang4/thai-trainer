import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Spelling } from "./Spelling";
import type { Card } from "../../core/types";

const card: Card = { id: "b-hello", thai: "สวัสดี", romanization: "sawatdee", english: "hello", category: "greetings", tier: 1, source: "builtin" };

describe("Spelling", () => {
  it("auto-grades a correct romanization as good after continue", async () => {
    const onGrade = vi.fn();
    render(<Spelling card={card} requireScript={false} onGrade={onGrade} />);
    await userEvent.type(screen.getByRole("textbox"), "Sa-wat dee");
    await userEvent.click(screen.getByRole("button", { name: /check/i }));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onGrade).toHaveBeenCalledWith("good");
  });

  it("auto-grades a wrong answer as again and reveals the answer", async () => {
    const onGrade = vi.fn();
    render(<Spelling card={card} requireScript={false} onGrade={onGrade} />);
    await userEvent.type(screen.getByRole("textbox"), "nope");
    await userEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(screen.getByText(/sawatdee/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onGrade).toHaveBeenCalledWith("again");
  });
});
