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
  longPressDuration?: number;
}

export const GameStatus = {
  Playing: "playing",
  Won: "won",
  Lost: "lost",
} as const;

export type GameStatusType = (typeof GameStatus)[keyof typeof GameStatus];

export const Difficulty = {
  Beginner: "beginner",
  Intermediate: "intermediate",
  Expert: "expert",
} as const;

export type DifficultyType = (typeof Difficulty)[keyof typeof Difficulty];

export const DIFFICULTY_CONFIG: Record<DifficultyType, MinesweeperConfig> = {
  [Difficulty.Beginner]: { rows: 9, columns: 9, mines: 10 },
  [Difficulty.Intermediate]: { rows: 16, columns: 16, mines: 40 },
  [Difficulty.Expert]: { rows: 16, columns: 30, mines: 99 },
};
