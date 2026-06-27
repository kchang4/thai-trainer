import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCardForm } from "./AddCardForm";
import { seedIfEmpty, getAllCards, _resetDbForTests } from "../data/db";

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  _resetDbForTests();
  await seedIfEmpty();
});

describe("AddCardForm", () => {
  it("validates required fields", async () => {
    render(<AddCardForm />);
    await userEvent.click(screen.getByRole("button", { name: /add card/i }));
    expect(screen.getByText(/fill in thai, romanization, and english/i)).toBeInTheDocument();
  });

  it("saves a user card", async () => {
    render(<AddCardForm />);
    await userEvent.type(screen.getByLabelText(/thai/i), "แมว");
    await userEvent.type(screen.getByLabelText(/romanization/i), "maew");
    await userEvent.type(screen.getByLabelText(/english/i), "cat");
    await userEvent.click(screen.getByRole("button", { name: /add card/i }));
    await waitFor(async () => {
      const cards = await getAllCards();
      expect(cards.some((c) => c.romanization === "maew" && c.source === "user")).toBe(true);
    });
  });
});
