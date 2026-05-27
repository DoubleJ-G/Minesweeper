import { type CellData } from "./types";

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

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x === 0 && y === 0) continue;
      const neighourRow = row + x;
      const neighbourCol = col + y;
      if (
        neighourRow >= 0 &&
        neighourRow < rows &&
        neighbourCol >= 0 &&
        neighbourCol < cols
      ) {
        neighbors.push([neighourRow, neighbourCol]);
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
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const rows = board.length;
  const cols = board[0].length;
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
  return board.map((r, row) =>
    r.map((cell, col) => {
      if (cell.isMine) {
        return cell;
      }
      const neighbors = getNeighbors(row, col, rows, cols);
      const value = neighbors.filter(
        ([neighbourRow, neighbourCol]) =>
          board[neighbourRow][neighbourCol].isMine,
      ).length;
      return { ...cell, value: value };
    }),
  );
};

export const floodReveal = (
  board: CellData[][],
  row: number,
  col: number,
  rows: number,
  cols: number,
): CellData[][] => {
  const next = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [row, col] = stack.pop()!;
    if (next[row][col].revealed || next[row][col].flagged) {
      continue;
    }

    next[row][col].revealed = true;

    if (next[row][col].value === 0 && !next[row][col].isMine) {
      stack.push(...getNeighbors(row, col, rows, cols));
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
    ([neighbourRow, neighbourColumn]) =>
      board[neighbourRow][neighbourColumn].flagged,
  ).length;

  if (flagCount !== cell.value) {
    return null;
  }

  let next = board.map((row) => row.map((cell) => ({ ...cell })));
  let hitMine = false;

  for (const [neighbourRow, neighbourColumn] of neighbors) {
    if (
      next[neighbourRow][neighbourColumn].revealed ||
      next[neighbourRow][neighbourColumn].flagged
    )
      continue;

    if (next[neighbourRow][neighbourColumn].isMine) {
      hitMine = true;
      continue;
    }

    next = floodReveal(next, neighbourRow, neighbourColumn, rows, cols);
  }

  if (hitMine) {
    next = next.map((row) =>
      row.map((column) =>
        column.isMine ? { ...column, revealed: true } : column,
      ),
    );
  }

  return { board: next, hitMine };
};

export const checkWin = (board: CellData[][]): boolean => {
  return board.every((row) =>
    row.every((cell) => cell.isMine || cell.revealed),
  );
};
