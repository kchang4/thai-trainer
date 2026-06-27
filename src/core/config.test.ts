import { describe, it, expect } from "vitest";
import { config } from "./config";

describe("config", () => {
  it("exposes tunable SRS and stage constants", () => {
    expect(config.INITIAL_EASE).toBe(2.5);
    expect(config.MIN_EASE).toBe(1.3);
    expect(config.MASTERY_MIN_REPS).toBe(2);
    expect(config.MASTERY_MIN_INTERVAL_DAYS).toBe(7);
    expect(config.STAGE_ADVANCE_THRESHOLD).toBe(8);
    expect(config.DAY_MS).toBe(86_400_000);
  });
});
