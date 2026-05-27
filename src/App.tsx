import { Board } from "./components/Board";

function App() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div>
          <h1 className="text-5xl font-bold">Minesweeper</h1>
        </div>
        <div>
          <Board />
        </div>
      </div>
    </main>
  );
}

export default App;
