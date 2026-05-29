import { Board } from "./components/Board";

function App() {
  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg">
            Minesweeper
          </h1>
          <p className="mt-2 text-sm tracking-wide text-slate-500">
            Right-click or long-press to flag &middot; Click numbers to chord
          </p>
        </div>
        <Board
          config={{
            rows: 9,
            columns: 9,
            mines: 10,
          }}
        />
      </div>
    </main>
  );
}

export default App;
