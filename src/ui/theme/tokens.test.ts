// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { REQUIRED_TOKENS } from "./tokens";

const themesDir = fileURLToPath(new URL("../../styles/themes/", import.meta.url));

function declaredTokens(css: string): Set<string> {
  const found = new Set<string>();
  for (const m of css.matchAll(/(--app-[\w-]+)\s*:/g)) found.add(m[1]);
  return found;
}

describe("theme token contract", () => {
  const files = readdirSync(themesDir).filter((f) => f.endsWith(".css"));

  it("ships at least one theme file", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s defines every required token", (file: string) => {
    const css = readFileSync(themesDir + file, "utf8");
    const declared = declaredTokens(css);
    const missing = REQUIRED_TOKENS.filter((t) => !declared.has(t));
    expect(missing).toEqual([]);
  });
});
