import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNav } from "./BottomNav";

const items = [
  { id: "study", label: "Study", icon: "📚" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "progress", label: "Progress", icon: "📈" },
];

describe("BottomNav", () => {
  it("marks the active item and reports selections", async () => {
    const onSelect = vi.fn();
    render(<BottomNav items={items} active="study" onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: /study/i })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(onSelect).toHaveBeenCalledWith("add");
  });
});
