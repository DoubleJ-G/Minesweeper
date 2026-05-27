import { Cell } from "./Cell";
import { useGameBoard } from "../hooks/useGameBoard";
import { type MinesweeperConfig } from "../types";

interface BoardProps {
  config: MinesweeperConfig;
}

export function Board({ config }: BoardProps) {
  const { board, status, reveal, flag, chord, reset } = useGameBoard(config);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 lg:text-2xl">
        <button
          onClick={reset}
          className="mb-2 rounded-md bg-red-400 px-3 py-1 text-white"
        >
          Reset
        </button>
        <div className="first-letter:uppercase">{status}</div>
      </div>

      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {row.map((cell, colIndex) => (
              <Cell
                key={colIndex}
                row={rowIndex}
                column={colIndex}
                value={cell.value}
                isMine={cell.isMine}
                revealed={cell.revealed}
                flagged={cell.flagged}
                onReveal={() => reveal(rowIndex, colIndex)}
                onFlag={() => flag(rowIndex, colIndex)}
                onChord={() => chord(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
