import { describe, expect, it } from "vitest";
import App from "./App";
import { screen, render } from "@testing-library/react";

describe("App", () => {
  it("renders the App component", () => {
    render(<App />);

    const el = screen.getByText("Minesweeper");

    expect(el).toBeDefined();
  });
});
