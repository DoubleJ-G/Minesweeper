import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useGameBoard } from "./useGameBoard";
import { placeMines, calculateValues } from "../minesweeper";
import type { CellData, MinesweeperConfig } from "../types";

vi.mock("../minesweeper", async (importOriginal) => {
  const module = await importOriginal<typeof import("../minesweeper")>();
  return { ...module, placeMines: vi.fn(), calculateValues: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
});

const cell = (overrides: Partial<CellData> = {}): CellData => ({
  value: 0,
  isMine: false,
  revealed: false,
  flagged: false,
  ...overrides,
});

// 3x3 board used by most tests. Mines at (0,0) and (0,2).
//   M   2   M
//   1   2   1
//   0   0   0
const config: MinesweeperConfig = { rows: 3, columns: 3, mines: 2 };

const boardAfterMines: CellData[][] = [
  [cell({ isMine: true }), cell(), cell({ isMine: true })],
  [cell(), cell(), cell()],
  [cell(), cell(), cell()],
];

const boardAfterValues: CellData[][] = [
  [cell({ isMine: true }), cell({ value: 2 }), cell({ isMine: true })],
  [cell({ value: 1 }), cell({ value: 2 }), cell({ value: 1 })],
  [cell(), cell(), cell()],
];

beforeEach(() => {
  vi.mocked(placeMines).mockReturnValue(boardAfterMines);
  vi.mocked(calculateValues).mockReturnValue(boardAfterValues);
});

describe("useGameBoard", () => {
  describe("initial state", () => {
    it("creates a board with the configured dimensions", () => {
      const { result } = renderHook(() => useGameBoard(config));
      expect(result.current.board).toHaveLength(3);
      result.current.board.forEach((row) => expect(row).toHaveLength(3));
    });

    it("starts with playing status", () => {
      const { result } = renderHook(() => useGameBoard(config));
      expect(result.current.status).toBe("playing");
    });

    it("starts with all cells unrevealed and mine-free", () => {
      const { result } = renderHook(() => useGameBoard(config));
      result.current.board.flat().forEach((boardCell) => {
        expect(boardCell.revealed).toBe(false);
        expect(boardCell.isMine).toBe(false);
      });
    });
  });

  describe("reveal", () => {
    it("no-ops when the game is not playing", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reveal(0, 0);
      }); // mine → lost

      const snapshot = result.current.board.map((row) =>
        row.map((boardCell) => ({ ...boardCell })),
      );

      act(() => {
        result.current.reveal(2, 2);
      }); // should be no-op

      expect(result.current.board).toEqual(snapshot);
    });

    it("calls placeMines with the clicked cell as the safe coordinates", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });

      expect(vi.mocked(placeMines)).toHaveBeenCalledWith(
        expect.anything(),
        config.mines,
        1,
        1,
      );
      expect(vi.mocked(calculateValues)).toHaveBeenCalledOnce();
    });

    it("reveals the clicked cell after the first click", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });

      expect(result.current.board[1][1].revealed).toBe(true);
    });

    it("does not reveal a flagged cell", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      }); // initializes board
      act(() => {
        result.current.flag(2, 2);
      });
      act(() => {
        result.current.reveal(2, 2);
      });

      expect(result.current.board[2][2].revealed).toBe(false);
    });

    it("sets status to lost when a mine is revealed", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      }); // places mines
      act(() => {
        result.current.reveal(0, 0);
      }); // mine

      expect(result.current.status).toBe("lost");
    });

    it("reveals all mines when a mine is clicked", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reveal(0, 0);
      });

      expect(result.current.board[0][0].revealed).toBe(true);
      expect(result.current.board[0][2].revealed).toBe(true);
    });

    it("sets status to won when all non-mine cells are revealed", () => {
      const { result } = renderHook(() => useGameBoard(config));

      // (1,1) value=2, reveals only itself
      act(() => {
        result.current.reveal(1, 1);
      });
      // (2,0) value=0, floods (2,0),(2,1),(2,2),(1,0),(1,2)
      act(() => {
        result.current.reveal(2, 0);
      });
      // (0,1) value=2, final non-mine cell
      act(() => {
        result.current.reveal(0, 1);
      });

      expect(result.current.status).toBe("won");
    });
  });

  describe("flag", () => {
    it("no-ops when the game is not playing", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reveal(0, 0);
      }); // lost

      act(() => {
        result.current.flag(2, 2);
      });

      expect(result.current.board[2][2].flagged).toBe(false);
    });

    it("no-ops on an already-revealed cell", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      }); // reveals (1,1)
      act(() => {
        result.current.flag(1, 1);
      });

      expect(result.current.board[1][1].flagged).toBe(false);
    });

    it("flags an unrevealed cell", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.flag(0, 0);
      });

      expect(result.current.board[0][0].flagged).toBe(true);
    });

    it("removes a flag when toggled a second time", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.flag(0, 0);
      });
      act(() => {
        result.current.flag(0, 0);
      });

      expect(result.current.board[0][0].flagged).toBe(false);
    });
  });

  describe("chord", () => {
    it("no-ops when the game is not playing", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reveal(0, 0);
      }); // lost

      const snapshot = result.current.board.map((row) =>
        row.map((boardCell) => ({ ...boardCell })),
      );
      act(() => {
        result.current.chord(1, 1);
      });

      expect(result.current.board).toEqual(snapshot);
    });

    it("no-ops when chordReveal returns null (flag count mismatch)", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      }); // (1,1) revealed, value=2, no flags

      const snapshot = result.current.board.map((row) =>
        row.map((boardCell) => ({ ...boardCell })),
      );
      act(() => {
        result.current.chord(1, 1);
      }); // 0 flags ≠ value 2 → null

      expect(result.current.board).toEqual(snapshot);
    });

    it("sets status to lost when chord reveals a mine", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      // Flag wrong cells — actual mines (0,0) and (0,2) left unflagged
      act(() => {
        result.current.flag(0, 1);
      });
      act(() => {
        result.current.flag(1, 0);
      });
      act(() => {
        result.current.chord(1, 1);
      });

      expect(result.current.status).toBe("lost");
    });

    it("reveals cells without winning when safe cells still remain", () => {
      // 4x4 board: mine at (0,0), all other non-mine cells value=1 (no cascade).
      // Chord at (1,1) reveals its 7 non-flagged neighbors; 6 cells in the
      // far corner/edges remain unrevealed so checkWin stays false.
      const config4x4: MinesweeperConfig = { rows: 4, columns: 4, mines: 2 };
      const board4x4: CellData[][] = [
        [
          cell({ isMine: true }),
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ value: 1 }),
        ],
        [
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ value: 1 }),
        ],
        [
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ value: 1 }),
        ],
        [
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ value: 1 }),
          cell({ isMine: true }),
        ],
      ];
      vi.mocked(calculateValues).mockReturnValueOnce(board4x4);

      const { result } = renderHook(() => useGameBoard(config4x4));

      act(() => {
        result.current.reveal(1, 1);
      }); // value=1, reveals (1,1) only
      act(() => {
        result.current.flag(0, 0);
      });
      act(() => {
        result.current.chord(1, 1);
      }); // 1 flag = value 1, reveals 7 neighbors

      expect(result.current.status).toBe("playing");
    });

    it("sets status to won when chord reveals the last safe cells", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      }); // reveals (1,1)
      act(() => {
        result.current.reveal(2, 0);
      }); // floods (2,0),(2,1),(2,2),(1,0),(1,2)
      act(() => {
        result.current.flag(0, 0);
      });
      act(() => {
        result.current.flag(0, 2);
      });
      act(() => {
        result.current.chord(1, 1);
      }); // reveals (0,1) → win

      expect(result.current.status).toBe("won");
    });
  });

  describe("reset", () => {
    it("clears all mines and revealed state", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reset();
      });

      result.current.board.flat().forEach((boardCell) => {
        expect(boardCell.isMine).toBe(false);
        expect(boardCell.revealed).toBe(false);
      });
    });

    it("resets status to playing", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reveal(0, 0);
      }); // lost

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe("playing");
    });

    it("allows mines to be placed again after reset", () => {
      const { result } = renderHook(() => useGameBoard(config));

      act(() => {
        result.current.reveal(1, 1);
      });
      act(() => {
        result.current.reset();
      });
      act(() => {
        result.current.reveal(1, 1);
      });

      expect(vi.mocked(placeMines)).toHaveBeenCalledTimes(2);
    });
  });
});
