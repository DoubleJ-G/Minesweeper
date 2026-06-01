import { type CellData } from "./types";

const cloneBoard = (board: CellData[][]): CellData[][] =>
  board.map((row) => row.map((cell) => ({ ...cell })));

export const createEmptyBoard = (rows: number, cols: number): CellData[][] =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      value: 0,
      isMine: false,
      revealed: false,
      flagged: false,
    })),
  );

export const getNeighbors = (
  row: number,
  col: number,
  rows: number,
  cols: number,
): [number, number][] => {
  const neighbors: [number, number][] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }
      const neighbourRow = row + rowOffset;
      const neighbourCol = col + colOffset;
      if (
        neighbourRow >= 0 &&
        neighbourRow < rows &&
        neighbourCol >= 0 &&
        neighbourCol < cols
      ) {
        neighbors.push([neighbourRow, neighbourCol]);
      }
    }
  }

  return neighbors;
};

export const placeMines = (
  board: CellData[][],
  mines: number,
  safeRow: number,
  safeCol: number,
): CellData[][] => {
  const rows = board.length;
  const cols = board[0].length;
  const next = cloneBoard(board);
  let placed = 0;

  while (placed < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if ((row === safeRow && col === safeCol) || next[row][col].isMine) {
      continue;
    }
    next[row][col].isMine = true;
    placed++;
  }

  return next;
};

export const calculateValues = (
  board: CellData[][],
  rows: number,
  cols: number,
): CellData[][] => {
  const next = cloneBoard(board);
  next.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      if (cell.isMine) {
        return;
      }
      const neighbors = getNeighbors(row, col, rows, cols);
      cell.value = neighbors.filter(
        ([neighbourRow, neighbourCol]) =>
          board[neighbourRow][neighbourCol].isMine,
      ).length;
    });
  });
  return next;
};

export const floodReveal = (
  board: CellData[][],
  row: number,
  col: number,
  rows: number,
  cols: number,
): CellData[][] => {
  const next = cloneBoard(board);
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [stackRow, stackCol] = stack.pop()!;
    if (next[stackRow][stackCol].revealed || next[stackRow][stackCol].flagged) {
      continue;
    }

    next[stackRow][stackCol].revealed = true;

    if (next[stackRow][stackCol].value === 0 && !next[stackRow][stackCol].isMine) {
      stack.push(...getNeighbors(stackRow, stackCol, rows, cols));
    }
  }

  return next;
};

export interface ChordResult {
  board: CellData[][];
  hitMine: boolean;
}

export const chordReveal = (
  board: CellData[][],
  row: number,
  col: number,
  rows: number,
  cols: number,
): ChordResult | null => {
  const cell = board[row][col];
  if (!cell.revealed || cell.isMine || cell.value === 0) {
    return null;
  }

  const neighbors = getNeighbors(row, col, rows, cols);
  const flagCount = neighbors.filter(
    ([neighbourRow, neighbourCol]) => board[neighbourRow][neighbourCol].flagged,
  ).length;

  if (flagCount !== cell.value) {
    return null;
  }

  let hitMine = false;
  const next = cloneBoard(board);

  for (const [neighbourRow, neighbourCol] of neighbors) {
    if (next[neighbourRow][neighbourCol].revealed || next[neighbourRow][neighbourCol].flagged) {
      continue;
    }

    if (next[neighbourRow][neighbourCol].isMine) {
      hitMine = true;
      continue;
    }

    const stack: [number, number][] = [[neighbourRow, neighbourCol]];
    while (stack.length > 0) {
      const [stackRow, stackCol] = stack.pop()!;
      if (next[stackRow][stackCol].revealed || next[stackRow][stackCol].flagged) {
        continue;
      }
      next[stackRow][stackCol].revealed = true;
      if (next[stackRow][stackCol].value === 0 && !next[stackRow][stackCol].isMine) {
        stack.push(...getNeighbors(stackRow, stackCol, rows, cols));
      }
    }
  }

  if (hitMine) {
    next.forEach((rowCells) => {
      rowCells.forEach((mineCell) => {
        if (mineCell.isMine) {
          mineCell.revealed = true;
        }
      });
    });
  }

  return { board: next, hitMine };
};

export const checkWin = (board: CellData[][]): boolean => {
  return board.every((rowCells) =>
    rowCells.every((cell) => cell.isMine || cell.revealed),
  );
};
