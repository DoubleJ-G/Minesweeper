import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createEmptyBoard,
  getNeighbors,
  placeMines,
  calculateValues,
  floodReveal,
  chordReveal,
  checkWin,
} from "./minesweeper";
import type { CellData } from "./types";

afterEach(() => {
  vi.restoreAllMocks();
});

const makeCell = (overrides: Partial<CellData> = {}): CellData => ({
  value: 0,
  isMine: false,
  revealed: false,
  flagged: false,
  ...overrides,
});

describe("createEmptyBoard", () => {
  it("creates a board with correct row count", () => {
    expect(createEmptyBoard(3, 4)).toHaveLength(3);
  });

  it("creates rows with correct column count", () => {
    createEmptyBoard(3, 4).forEach((row) => expect(row).toHaveLength(4));
  });

  it("initializes all cells with default values", () => {
    createEmptyBoard(2, 2)
      .flat()
      .forEach((cell) =>
        expect(cell).toEqual({ value: 0, isMine: false, revealed: false, flagged: false }),
      );
  });

  it("creates independent cell objects", () => {
    const board = createEmptyBoard(2, 2);
    board[0][0].isMine = true;
    expect(board[0][1].isMine).toBe(false);
  });
});

describe("getNeighbors", () => {
  it("returns 3 neighbors for a corner cell", () => {
    expect(getNeighbors(0, 0, 3, 3)).toHaveLength(3);
  });

  it("returns 5 neighbors for an edge cell", () => {
    expect(getNeighbors(0, 1, 3, 3)).toHaveLength(5);
  });

  it("returns 8 neighbors for an interior cell", () => {
    expect(getNeighbors(1, 1, 3, 3)).toHaveLength(8);
  });

  it("does not include the cell itself", () => {
    expect(getNeighbors(1, 1, 3, 3)).not.toContainEqual([1, 1]);
  });

  it("returns no neighbors for a 1x1 board", () => {
    expect(getNeighbors(0, 0, 1, 1)).toHaveLength(0);
  });

  it("only returns in-bounds coordinates", () => {
    getNeighbors(0, 0, 3, 3).forEach(([row, col]) => {
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(3);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(3);
    });
  });
});

describe("placeMines", () => {
  it("places the correct number of mines", () => {
    const board = createEmptyBoard(5, 5);
    const result = placeMines(board, 5, 0, 0);
    expect(result.flat().filter((cell) => cell.isMine)).toHaveLength(5);
  });

  it("never places a mine on the safe cell", () => {
    const board = createEmptyBoard(5, 5);
    for (let i = 0; i < 30; i++) {
      expect(placeMines(board, 20, 2, 2)[2][2].isMine).toBe(false);
    }
  });

  it("skips cells that are already mines and keeps trying", () => {
    const board = createEmptyBoard(3, 3);
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)    // mine 1 row: 0
      .mockReturnValueOnce(0)    // mine 1 col: 0 → placed at (0,0)
      .mockReturnValueOnce(0)    // mine 2 row: 0 (retry same position)
      .mockReturnValueOnce(0)    // mine 2 col: 0 → already mine, skip
      .mockReturnValueOnce(0.34) // mine 2 row: 1
      .mockReturnValueOnce(0.34); // mine 2 col: 1 → placed at (1,1)
    const result = placeMines(board, 2, 2, 2);
    expect(result[0][0].isMine).toBe(true);
    expect(result[1][1].isMine).toBe(true);
    expect(result.flat().filter((cell) => cell.isMine)).toHaveLength(2);
  });

  it("does not mutate the original board", () => {
    const board = createEmptyBoard(3, 3);
    placeMines(board, 3, 0, 0);
    expect(board.flat().every((cell) => !cell.isMine)).toBe(true);
  });
});

describe("calculateValues", () => {
  it("assigns 0 when there are no adjacent mines", () => {
    const board = createEmptyBoard(3, 3);
    expect(calculateValues(board, 3, 3)[1][1].value).toBe(0);
  });

  it("counts one adjacent mine correctly", () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = makeCell({ isMine: true });
    expect(calculateValues(board, 3, 3)[1][1].value).toBe(1);
  });

  it("counts all 8 surrounding mines", () => {
    const board = createEmptyBoard(3, 3);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row !== 1 || col !== 1) {
          board[row][col] = makeCell({ isMine: true });
        }
      }
    }
    expect(calculateValues(board, 3, 3)[1][1].value).toBe(8);
  });

  it("returns mine cells unchanged", () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = makeCell({ isMine: true });
    const result = calculateValues(board, 3, 3);
    expect(result[0][0]).toEqual(board[0][0]);
  });
});

describe("floodReveal", () => {
  it("reveals the clicked cell", () => {
    const board = createEmptyBoard(3, 3);
    expect(floodReveal(board, 1, 1, 3, 3)[1][1].revealed).toBe(true);
  });

  it("does not expand from cells with value > 0", () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = makeCell({ isMine: true });
    const valued = calculateValues(board, 3, 3);
    // (0,1) has value=1; flooding from it should not auto-reveal its neighbors
    const result = floodReveal(valued, 0, 1, 3, 3);
    expect(result[0][1].revealed).toBe(true);
    expect(result[1][0].revealed).toBe(false);
  });

  it("flood fills all connected zero-value cells", () => {
    // No mines → every cell has value 0 → flood reveals the entire board
    const board = createEmptyBoard(3, 3);
    const result = floodReveal(board, 0, 0, 3, 3);
    result.flat().forEach((cell) => expect(cell.revealed).toBe(true));
  });

  it("stops flood at cells bordering a mine region", () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = makeCell({ isMine: true });
    const valued = calculateValues(board, 3, 3);
    // Flood from (2,2) — value=0, expands; (0,1) and (1,0) have value=1, revealed but not expanded
    const result = floodReveal(valued, 2, 2, 3, 3);
    expect(result[0][1].revealed).toBe(true);
    expect(result[1][0].revealed).toBe(true);
    expect(result[0][0].revealed).toBe(false); // mine never revealed
  });

  it("does not reveal flagged cells", () => {
    const board = createEmptyBoard(3, 3);
    board[0][1].flagged = true;
    const result = floodReveal(board, 0, 0, 3, 3);
    expect(result[0][1].revealed).toBe(false);
    expect(result[0][1].flagged).toBe(true);
  });

  it("skips already-revealed cells without re-processing", () => {
    const board = createEmptyBoard(3, 3);
    board[0][0].revealed = true;
    const result = floodReveal(board, 0, 0, 3, 3);
    expect(result[0][0].revealed).toBe(true);
  });

  it("does not mutate the original board", () => {
    const board = createEmptyBoard(3, 3);
    floodReveal(board, 0, 0, 3, 3);
    expect(board[0][0].revealed).toBe(false);
  });
});

describe("chordReveal", () => {
  // 3x3: mines at (0,0) and (0,2); (1,1) revealed with value=2
  const makeBoard = (): CellData[][] => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = makeCell({ isMine: true });
    board[0][2] = makeCell({ isMine: true });
    const valued = calculateValues(board, 3, 3);
    valued[1][1] = { ...valued[1][1], revealed: true };
    return valued;
  };

  it("returns null for an unrevealed cell", () => {
    const board = makeBoard();
    board[1][1].revealed = false;
    expect(chordReveal(board, 1, 1, 3, 3)).toBeNull();
  });

  it("returns null for a mine cell", () => {
    const board = makeBoard();
    board[0][0].revealed = true;
    expect(chordReveal(board, 0, 0, 3, 3)).toBeNull();
  });

  it("returns null for a cell with value 0", () => {
    const board = createEmptyBoard(3, 3);
    board[1][1].revealed = true;
    expect(chordReveal(board, 1, 1, 3, 3)).toBeNull();
  });

  it("returns null when flag count does not match cell value", () => {
    const board = makeBoard();
    board[0][0].flagged = true; // 1 flag, value=2
    expect(chordReveal(board, 1, 1, 3, 3)).toBeNull();
  });

  it("reveals safe neighbors when flag count matches value", () => {
    const board = makeBoard();
    board[0][0].flagged = true;
    board[0][2].flagged = true;
    const result = chordReveal(board, 1, 1, 3, 3);
    expect(result).not.toBeNull();
    expect(result!.hitMine).toBe(false);
    expect(result!.board[0][1].revealed).toBe(true);
  });

  it("sets hitMine and reveals all mines when a neighbor mine is not flagged", () => {
    const board = makeBoard();
    // Flag wrong cells: mines at (0,0) and (0,2) are left unflagged
    board[0][1].flagged = true;
    board[1][0].flagged = true;
    const result = chordReveal(board, 1, 1, 3, 3);
    expect(result).not.toBeNull();
    expect(result!.hitMine).toBe(true);
    expect(result!.board[0][0].revealed).toBe(true);
    expect(result!.board[0][2].revealed).toBe(true);
  });

  it("skips already-revealed neighbors", () => {
    const board = makeBoard();
    board[0][0].flagged = true;
    board[0][2].flagged = true;
    board[0][1].revealed = true;
    const result = chordReveal(board, 1, 1, 3, 3);
    expect(result).not.toBeNull();
    expect(result!.board[0][1].revealed).toBe(true);
  });

  it("does not mutate the original board", () => {
    const board = makeBoard();
    board[0][0].flagged = true;
    board[0][2].flagged = true;
    chordReveal(board, 1, 1, 3, 3);
    expect(board[0][1].revealed).toBe(false);
  });
});

describe("checkWin", () => {
  it("returns false when non-mine cells are unrevealed", () => {
    expect(checkWin(createEmptyBoard(2, 2))).toBe(false);
  });

  it("returns true when all non-mine cells are revealed", () => {
    const board = createEmptyBoard(2, 2);
    board[0][0] = makeCell({ isMine: true });
    board[0][1].revealed = true;
    board[1][0].revealed = true;
    board[1][1].revealed = true;
    expect(checkWin(board)).toBe(true);
  });

  it("returns false when some non-mine cells remain unrevealed", () => {
    const board = createEmptyBoard(2, 2);
    board[0][0] = makeCell({ isMine: true });
    board[0][1].revealed = true;
    board[1][0].revealed = true;
    // board[1][1] unrevealed
    expect(checkWin(board)).toBe(false);
  });

  it("returns true for a board consisting entirely of mines", () => {
    expect(checkWin([[makeCell({ isMine: true })]])).toBe(true);
  });
});
