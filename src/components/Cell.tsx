import { memo, useCallback } from "react";
import { GameStatus, type GameStatusType } from "../types";
import { useLongPress } from "../hooks/useLongPress";
import { FlagIcon } from "./FlagIcon";
import { MineIcon } from "./MineIcon";

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-400",
  2: "text-emerald-400",
  3: "text-red-400",
  4: "text-indigo-300",
  5: "text-amber-400",
  6: "text-cyan-400",
  7: "text-purple-300",
  8: "text-slate-300",
};


type Props = {
  row: number;
  col: number;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  revealed: boolean;
  flagged: boolean;
  isMine: boolean;
  value: number;
  gameStatus?: GameStatusType;
  longPressDuration?: number;
};

export const Cell = memo(function Cell({
  row,
  col,
  flagged,
  revealed,
  isMine,
  value,
  onReveal,
  onFlag,
  onChord,
  gameStatus = GameStatus.Playing,
  longPressDuration = 200,
}: Props) {
  const flagCallback = useCallback(() => onFlag(row, col), [onFlag, row, col]);
  const longPress = useLongPress(flagCallback, longPressDuration);

  const handleClick = useCallback(() => {
    if (revealed) {
      onChord(row, col);
    } else {
      onReveal(row, col);
    }
  }, [revealed, onChord, onReveal, row, col]);

  const handleFlag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onFlag(row, col);
    },
    [onFlag, row, col],
  );

  const isGameOver = gameStatus !== GameStatus.Playing;

  let content: React.ReactNode;
  let className: string;

  if (flagged) {
    content = <FlagIcon />;
    className =
      "border-2 border-t-slate-400 border-l-slate-400 border-b-slate-900 border-r-slate-900 bg-slate-600 hover:bg-slate-500";
  } else if (!revealed) {
    content = null;
    className = isGameOver
      ? "border-2 border-t-slate-500 border-l-slate-500 border-b-slate-800 border-r-slate-800 bg-slate-600 opacity-60 cursor-not-allowed"
      : "border-2 border-t-slate-400 border-l-slate-400 border-b-slate-900 border-r-slate-900 bg-slate-600 hover:bg-slate-500 active:border-t-slate-600 active:border-l-slate-600 active:border-b-slate-600 active:border-r-slate-600 active:bg-slate-700 cursor-pointer";
  } else if (isMine) {
    content = <MineIcon />;
    className = "border border-red-900 bg-red-700 cursor-not-allowed";
  } else {
    content = value ? String(value) : "";
    const textColor = NUMBER_COLORS[value] ?? "text-slate-300";
    className = `border border-slate-600/50 bg-slate-800 cursor-default ${textColor}`;
  }

  const isDisabled = (revealed && value === 0 && !isMine) || isGameOver;

  return (
    <button
      className={`flex h-9 w-9 items-center justify-center font-mono text-sm font-bold select-none ${className}`}
      onClick={handleClick}
      onContextMenu={handleFlag}
      onTouchStart={longPress.onTouchStart}
      onTouchEnd={longPress.onTouchEnd}
      onTouchMove={longPress.onTouchMove}
      onTouchCancel={longPress.onTouchCancel}
      disabled={isDisabled}
      aria-label={
        revealed
          ? isMine
            ? "Mine"
            : `${value} adjacent mines`
          : flagged
            ? "Flagged cell"
            : "Unrevealed cell"
      }
    >
      {content}
    </button>
  );
});
