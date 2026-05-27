export interface CellData {
  value: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
}

export interface MinesweeperConfig {
  mines: number;
  columns: number;
  rows: number;
}

export const GameStatus = {
  Playing: "playing",
  Won: "won",
  Lost: "lost",
} as const;

export type GameStatusType = (typeof GameStatus)[keyof typeof GameStatus];
