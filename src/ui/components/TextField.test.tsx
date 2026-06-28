import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { TextField } from "./TextField";

function Harness() {
  const [v, setV] = useState("");
  return <TextField label="Romanization" value={v} onChange={(e) => setV(e.target.value)} />;
}

describe("TextField", () => {
  it("associates the label with the input", async () => {
    render(<Harness />);
    const input = screen.getByLabelText(/romanization/i);
    await userEvent.type(input, "maew");
    expect(input).toHaveValue("maew");
  });
});
