import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("defaults to the primary variant and exposes it via data-variant", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-variant", "primary");
  });

  it("applies the requested variant", () => {
    render(<Button variant="error">Stop</Button>);
    expect(screen.getByRole("button", { name: "Stop" })).toHaveAttribute("data-variant", "error");
  });

  it("forwards disabled", () => {
    render(<Button disabled>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
  });
});
