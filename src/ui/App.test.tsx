import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { seedIfEmpty, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("App", () => {
  it("switches to the Add card screen via the bottom nav", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /add card/i })).toBeInTheDocument(),
    );
  });
});
