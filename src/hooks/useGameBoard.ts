import { useCallback, useState } from "react";
import {
  calculateValues,
  checkWin,
  chordReveal,
  createEmptyBoard,
  floodReveal,
  placeMines,
} from "../minesweeper";
import {
  GameStatus,
  type GameStatusType,
  type MinesweeperConfig,
} from "../types";

export const useGameBoard = (config: MinesweeperConfig) => {
  const [board, setBoard] = useState(() =>
    createEmptyBoard(config.rows, config.columns),
  );
  const [status, setStatus] = useState<GameStatusType>(GameStatus.Playing);
  const [firstClick, setFirstClick] = useState(true);

  const reveal = useCallback(
    (row: number, col: number) => {
      if (status !== GameStatus.Playing) {
        return;
      }

      setBoard((prev) => {
        let next = prev;

        if (firstClick) {
          next = placeMines(prev, config.mines, row, col);
          next = calculateValues(next, config.rows, config.columns);
          setFirstClick(false);
        }

        if (next[row][col].flagged) {
          return next;
        }

        if (next[row][col].isMine) {
          setStatus(GameStatus.Lost);
          return next.map((r) =>
            r.map((cell) =>
              cell.isMine ? { ...cell, revealed: true } : cell,
            ),
          );
        }

        next = floodReveal(next, row, col, config.rows, config.columns);

        if (checkWin(next)) {
          setStatus(GameStatus.Won);
        }

        return next;
      });
    },
    [status, firstClick, config],
  );

  const flag = useCallback(
    (row: number, col: number) => {
      if (status !== GameStatus.Playing) {
        return;
      }

      const cell = board[row][col];
      if (cell.revealed) {
        return;
      }

      setBoard((prev) => {
        const next = prev.map((r) => r.map((cell) => ({ ...cell })));
        next[row][col].flagged = !next[row][col].flagged;
        return next;
      });
    },
    [status, board],
  );

  const reset = useCallback(() => {
    setBoard(createEmptyBoard(config.rows, config.columns));
    setStatus(GameStatus.Playing);
    setFirstClick(true);
  }, [config]);

  const chord = useCallback(
    (row: number, col: number) => {
      if (status !== GameStatus.Playing) {
        return;
      }

      setBoard((prev) => {
        const result = chordReveal(prev, row, col, config.rows, config.columns);
        if (!result) {
          return prev;
        }

        if (result.hitMine) {
          setStatus(GameStatus.Lost);
          return result.board;
        }

        if (checkWin(result.board)) {
          setStatus(GameStatus.Won);
        }

        return result.board;
      });
    },
    [status, config],
  );

  return { board, status, reveal, flag, chord, reset };
};
