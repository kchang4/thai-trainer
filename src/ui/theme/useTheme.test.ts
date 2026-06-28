import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme, getStoredTheme, THEME_STORAGE_KEY } from "./useTheme";
import { DEFAULT_THEME_ID } from "./themes";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("useTheme", () => {
  it("defaults to the default theme when nothing is stored", () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME_ID);
  });

  it("applies the active theme to the document element", () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute("data-theme")).toBe(DEFAULT_THEME_ID);
  });

  it("persists and applies a newly selected theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("temple"));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("temple");
    expect(document.documentElement.getAttribute("data-theme")).toBe("temple");
    expect(result.current.theme).toBe("temple");
  });
});
