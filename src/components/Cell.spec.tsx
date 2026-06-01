import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Cell } from "./Cell";

describe("Cell", () => {
  const defaultProps = {
    row: 0,
    col: 0,
    onReveal: vi.fn(),
    onFlag: vi.fn(),
    onChord: vi.fn(),
    isMine: false,
    revealed: false,
    flagged: false,
    value: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders as a button", () => {
    render(<Cell {...defaultProps} />);

    const cell = screen.getByRole("button");

    expect(cell).toBeInTheDocument();
  });

  it("shows the value when revealed", () => {
    render(<Cell {...defaultProps} revealed={true} value={3} />);

    const cell = screen.getByRole("button");

    expect(cell).toHaveTextContent("3");
  });

  it("shows nothing when revealed with value 0", () => {
    render(<Cell {...defaultProps} revealed={true} value={0} />);

    const cell = screen.getByRole("button");

    expect(cell).toHaveTextContent("");
  });

  it("shows nothing when unrevealed ", () => {
    render(<Cell {...defaultProps} revealed={false} value={3} />);

    const cell = screen.getByRole("button");

    expect(cell).not.toHaveTextContent("3");
  });

  it("shows a mine when revealed and is a mine", () => {
    render(<Cell {...defaultProps} revealed={true} isMine={true} />);

    expect(screen.getByTestId("mine-icon")).toBeInTheDocument();
  });

  it("shows a flag when flagged", () => {
    render(<Cell {...defaultProps} flagged={true} />);

    expect(screen.getByTestId("flag-icon")).toBeInTheDocument();
  });

  it("calls onReveal on left click", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();

    render(<Cell {...defaultProps} onReveal={handler} />);

    const cell = screen.getByRole("button");
    await user.click(cell);

    expect(handler).toHaveBeenCalled();
  });

  it("calls onChord on left click when already revealed", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();

    render(
      <Cell {...defaultProps} revealed={true} value={1} onChord={handler} />,
    );

    const cell = screen.getByRole("button");
    await user.click(cell);

    expect(handler).toHaveBeenCalled();
  });

  it("calls onFlag on right click", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();

    render(<Cell {...defaultProps} onFlag={handler} />);

    const cell = screen.getByRole("button");
    await user.pointer({ keys: "[MouseRight]", target: cell });

    expect(handler).toHaveBeenCalled();
  });

  it("prevents default context menu on right click", async () => {
    // Since userEvent doesn't expose the event object, we dispatch manually
    // to verify preventDefault is called on the context menu
    const event = new MouseEvent("contextmenu", { bubbles: true });
    const spy = vi.spyOn(event, "preventDefault");

    render(<Cell {...defaultProps} />);

    const cell = screen.getByRole("button");
    cell.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
  });
});
