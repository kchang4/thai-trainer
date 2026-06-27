import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import { StudySession } from "./StudySession";
import { seedIfEmpty, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("StudySession", () => {
  it("renders an exercise once a due card loads", async () => {
    render(<StudySession />);
    // Either a prompt or grading control becomes visible after load.
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /show answer/i }) ||
          screen.queryByRole("button", { name: /check/i }) ||
          screen.queryByRole("button", { name: /play again/i }),
      ).toBeTruthy(),
    );
  });
});
