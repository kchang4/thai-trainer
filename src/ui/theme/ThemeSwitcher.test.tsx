import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { THEME_STORAGE_KEY } from "./useTheme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeSwitcher", () => {
  it("renders a theme selector with the available themes", () => {
    render(<ThemeSwitcher />);
    const select = screen.getByLabelText(/theme/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /thai temple/i })).toBeInTheDocument();
  });

  it("persists the selected theme", async () => {
    render(<ThemeSwitcher />);
    await userEvent.selectOptions(screen.getByLabelText(/theme/i), "temple");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("temple");
  });
});
