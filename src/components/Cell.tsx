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
  revealed: boolean;
  flagged: boolean;
  isMine: boolean;
  value: number;
};

export function Cell({
  flagged,
  revealed,
  isMine,
  value,
  onReveal,
  onFlag,
}: Props) {
  const getColor = (value: number): string => {
    return CELL_COLORS[value] ?? "text-black";
  };

  const handleFlag = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag();
  };

  return (
    <button
      className={`h-16 w-16 cursor-pointer border border-gray-300 bg-gray-100 font-mono text-2xl font-bold hover:bg-gray-300 ${getColor(value)}`}
      onClick={onReveal}
      onContextMenu={handleFlag}
      disabled={revealed}
      aria-label={revealed ? `${value} adjacent mines` : "Unrevealed cell"}
    >
      {getCellContent(revealed, flagged, isMine, value)}
    </button>
  );
}
