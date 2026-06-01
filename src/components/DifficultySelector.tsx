import { Difficulty, type DifficultyType } from "../types";

const LABELS: Record<DifficultyType, string> = {
  [Difficulty.Beginner]: "Beginner",
  [Difficulty.Intermediate]: "Intermediate",
  [Difficulty.Expert]: "Expert",
};

interface Props {
  difficulty: DifficultyType;
  onChange: (difficulty: DifficultyType) => void;
}

export function DifficultySelector({ difficulty, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {(Object.values(Difficulty) as DifficultyType[]).map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-100 select-none ${
            difficulty === d
              ? "bg-slate-500 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
        >
          {LABELS[d]}
        </button>
      ))}
    </div>
  );
}
