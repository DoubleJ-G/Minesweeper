import { Cell } from "./Cell";

export function Board() {
  const width = 9;
  const height = 9;

  return (
    <div id="board">
      {Array.from({ length: height }).map((_, row) => (
        <div key={row} className="flex">
          {Array.from({ length: width }).map((_, col) => (
            <Cell
              key={col}
              value={0}
              revealed={false}
              flagged={false}
              isMine={false}
              onFlag={() => {}}
              onReveal={() => {}}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
