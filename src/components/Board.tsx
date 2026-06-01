import { useEffect, useState } from "react";
import { Cell } from "./Cell";
import { useGameBoard } from "../hooks/useGameBoard";
import {
  GameStatus,
  type GameStatusType,
  type MinesweeperConfig,
} from "../types";

interface BoardProps {
  config: MinesweeperConfig;
}

const STATUS_EMOJI: Record<GameStatusType, string> = {
  [GameStatus.Playing]: "🙂",
  [GameStatus.Won]: "😎",
  [GameStatus.Lost]: "😵",
};

function LCDDisplay({ value }: { value: string }) {
  return (
    <div className="min-w-[3.5rem] rounded bg-black/80 px-2 py-1 text-center font-mono text-xl font-bold tracking-widest text-red-500 tabular-nums shadow-inner select-none">
      {value}
    </div>
  );
}

export function Board({ config }: BoardProps) {
  const { board, status, reveal, flag, chord, reset } = useGameBoard(config);
  const [seconds, setSeconds] = useState(0);

  const flatBoard = board.flat();
  const flagCount = flatBoard.filter((cell) => cell.flagged).length;
  const minesRemaining = config.mines - flagCount;
  const isGameStarted = flatBoard.some((cell) => cell.revealed);

  const displayMines = Math.max(0, Math.min(999, minesRemaining))
    .toString()
    .padStart(3, "0");
  const displayTime = Math.min(999, seconds).toString().padStart(3, "0");

  useEffect(() => {
    if (!isGameStarted) {
      return;
    }
    if (status !== GameStatus.Playing) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => Math.min(s + 1, 999));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameStarted, status]);

  const handleReset = () => {
    reset();
    setSeconds(0);
  };

  return (
    <div className="rounded-2xl border border-slate-600/50 bg-slate-700 p-4 shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-slate-900/50 bg-slate-800/80 px-4 py-3 shadow-inner">
        <LCDDisplay value={displayMines} />

        <button
          onClick={handleReset}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-600 bg-slate-700 text-2xl shadow-sm transition-all duration-100 select-none hover:border-slate-500 hover:bg-slate-600 active:scale-95 active:bg-slate-800"
          aria-label="Reset game"
        >
          {STATUS_EMOJI[status]}
        </button>

        <LCDDisplay value={displayTime} />
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border border-slate-900/60 shadow-inner">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <Cell
                key={colIndex}
                row={rowIndex}
                col={colIndex}
                value={cell.value}
                isMine={cell.isMine}
                revealed={cell.revealed}
                flagged={cell.flagged}
                gameStatus={status}
                onReveal={reveal}
                onFlag={flag}
                onChord={chord}
                longPressDuration={config.longPressDuration}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div
        className={`mt-4 rounded-lg py-2 text-center text-sm font-semibold tracking-wide transition-opacity duration-200 ${
          status === GameStatus.Playing
            ? "pointer-events-none opacity-0"
            : status === GameStatus.Won
              ? "border border-emerald-800 bg-emerald-900/50 text-emerald-400"
              : "border border-red-800 bg-red-900/50 text-red-400"
        }`}
        aria-hidden={status === GameStatus.Playing}
      >
        {status === GameStatus.Won ? "You won! 🎉" : "Game over! 💥"}
      </div>
    </div>
  );
}
