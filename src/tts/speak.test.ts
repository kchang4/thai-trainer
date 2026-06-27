import { describe, it, expect, vi, afterEach } from "vitest";
import { isThaiVoiceAvailable, speakThai } from "./speak";

describe("tts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports no Thai voice when speechSynthesis is missing", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    expect(isThaiVoiceAvailable()).toBe(false);
  });

  it("detects a Thai voice", () => {
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ lang: "en-US" }, { lang: "th-TH" }],
    });
    expect(isThaiVoiceAvailable()).toBe(true);
  });

  it("speakThai is a no-op when synthesis is unavailable (does not throw)", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    expect(() => speakThai("สวัสดี")).not.toThrow();
  });

  it("speakThai calls speechSynthesis.speak when available", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { getVoices: () => [{ lang: "th-TH" }], speak });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        voice: unknown = null;
        constructor(public text: string) {}
      },
    );
    speakThai("สวัสดี");
    expect(speak).toHaveBeenCalledOnce();
  });
});
