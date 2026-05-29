import { useCallback } from "react";
import { GameStatus, type GameStatusType } from "../types";
import { useLongPress } from "../hooks/useLongPress";

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

function FlagIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden
      data-testid="flag-icon"
    >
      <line
        x1="6"
        y1="2.5"
        x2="6"
        y2="17.5"
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="4.5"
        y1="17.5"
        x2="7.5"
        y2="17.5"
        stroke="#94a3b8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <polygon points="6,2.5 15.5,6.5 6,10.5" fill="#ef4444" />
    </svg>
  );
}

function MineIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden
      data-testid="mine-icon"
    >
      <g stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round">
        <line x1="10" y1="1.5" x2="10" y2="4.5" />
        <line x1="10" y1="15.5" x2="10" y2="18.5" />
        <line x1="1.5" y1="10" x2="4.5" y2="10" />
        <line x1="15.5" y1="10" x2="18.5" y2="10" />
        <line x1="3.5" y1="3.5" x2="5.6" y2="5.6" />
        <line x1="16.5" y1="3.5" x2="14.4" y2="5.6" />
        <line x1="3.5" y1="16.5" x2="5.6" y2="14.4" />
        <line x1="16.5" y1="16.5" x2="14.4" y2="14.4" />
      </g>
      <circle cx="10" cy="10" r="5.5" fill="#1e293b" />
      <circle cx="8" cy="8" r="1.8" fill="white" opacity="0.35" />
    </svg>
  );
}

type Props = {
  onReveal: () => void;
  onFlag: () => void;
  onChord: () => void;
  revealed: boolean;
  flagged: boolean;
  isMine: boolean;
  value: number;
  gameStatus?: GameStatusType;
  longPressDuration?: number;
};

export function Cell({
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
  const longPress = useLongPress(onFlag, longPressDuration);

  const handleClick = useCallback(() => {
    if (revealed) {
      onChord();
    } else {
      onReveal();
    }
  }, [revealed, onChord, onReveal]);

  const handleFlag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onFlag();
    },
    [onFlag],
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
      className={`flex h-9 w-9 items-center justify-center font-mono text-sm font-bold transition-colors duration-75 select-none ${className}`}
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
}
