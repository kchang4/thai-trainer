import { describe, it, expect } from "vitest";
import { normalizeAnswer, gradeTypedAnswer } from "./grading";

describe("normalizeAnswer", () => {
  it("lowercases and trims", () => {
    expect(normalizeAnswer("  Sawatdee ")).toBe("sawatdee");
  });
  it("strips spaces, hyphens, and apostrophes", () => {
    expect(normalizeAnswer("sa-wat dee")).toBe("sawatdee");
    expect(normalizeAnswer("a'roi")).toBe("aroi");
  });
});

describe("gradeTypedAnswer", () => {
  it("accepts answers that differ only by spacing/case/hyphens", () => {
    expect(gradeTypedAnswer("sawatdee", "Sa-Wat Dee")).toBe(true);
  });
  it("rejects genuinely different answers", () => {
    expect(gradeTypedAnswer("sawatdee", "khopkhun")).toBe(false);
  });
  it("compares Thai script exactly after trim", () => {
    expect(gradeTypedAnswer("สวัสดี", " สวัสดี ")).toBe(true);
    expect(gradeTypedAnswer("สวัสดี", "สวัด")).toBe(false);
  });
});
