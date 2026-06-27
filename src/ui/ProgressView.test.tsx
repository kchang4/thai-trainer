import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import { ProgressView } from "./ProgressView";
import { seedIfEmpty, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("ProgressView", () => {
  it("shows the current stage and export/import controls", async () => {
    render(<ProgressView />);
    await waitFor(() => expect(screen.getByText(/current stage/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/import backup/i)).toBeInTheDocument();
  });
});
