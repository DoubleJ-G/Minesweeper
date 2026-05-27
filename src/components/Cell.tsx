import { useCallback } from "react";

const CELL_COLORS: Record<number, string> = {
  1: "text-blue-500",
  2: "text-green-500",
  3: "text-red-500",
  4: "text-purple-500",
  5: "text-yellow-500",
  6: "text-cyan-500",
  7: "text-gray-500",
  8: "text-black",
};

const getCellContent = (
  revealed: boolean,
  flagged: boolean,
  isMine: boolean,
  value: number,
): string => {
  if (flagged) {
    return "🚩";
  }
  if (!revealed) {
    return "";
  }
  if (isMine) {
    return "💣";
  }
  return value ? String(value) : "";
};

type Props = {
  onReveal: () => void;
  onFlag: () => void;
  onChord: () => void;
  revealed: boolean;
  flagged: boolean;
  isMine: boolean;
  value: number;
  row: number;
  column: number;
};

export function Cell({
  flagged,
  revealed,
  isMine,
  value,
  onReveal,
  onFlag,
  onChord,
}: Props) {
  const getColor = (value: number, revealed: boolean): string => {
    const text = CELL_COLORS[value] ?? "text-black";
    const bg = revealed ? "bg-gray-200" : "bg-gray-100";
    return `${text} ${bg}`;
  };

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

  return (
    <button
      className={`h-16 w-16 cursor-pointer border border-gray-300 bg-gray-100 font-mono text-2xl font-bold transition-colors duration-300 hover:bg-gray-300 ${getColor(value, revealed)}`}
      onClick={handleClick}
      onContextMenu={handleFlag}
      disabled={revealed && value === 0}
      aria-label={revealed ? `${value} adjacent mines` : "Unrevealed cell"}
    >
      {getCellContent(revealed, flagged, isMine, value)}
    </button>
  );
}
