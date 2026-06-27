import { describe, it, expect } from "vitest";
import { starterDeck } from "./starterDeck";

describe("starterDeck", () => {
  it("has at least 25 cards", () => {
    expect(starterDeck.length).toBeGreaterThanOrEqual(25);
  });
  it("has unique ids", () => {
    const ids = new Set(starterDeck.map((c) => c.id));
    expect(ids.size).toBe(starterDeck.length);
  });
  it("every card is builtin and fully populated", () => {
    for (const c of starterDeck) {
      expect(c.source).toBe("builtin");
      expect(c.thai).not.toBe("");
      expect(c.romanization).not.toBe("");
      expect(c.english).not.toBe("");
      expect([1, 2, 3, 4]).toContain(c.tier);
    }
  });
  it("includes tier 1 cards and tier 4 phrase cards", () => {
    expect(starterDeck.some((c) => c.tier === 1)).toBe(true);
    expect(starterDeck.some((c) => c.tier === 4)).toBe(true);
  });
});
