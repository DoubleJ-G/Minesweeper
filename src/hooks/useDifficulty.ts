import { useCallback, useState } from "react";
import { Difficulty, type DifficultyType } from "../types";

const VALID_DIFFICULTIES = Object.values(Difficulty) as DifficultyType[];

function readFromUrl(): DifficultyType {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("difficulty");
  if (value && (VALID_DIFFICULTIES as string[]).includes(value)) {
    return value as DifficultyType;
  }
  return Difficulty.Beginner;
}

export function useDifficulty() {
  const [difficulty, setDifficultyState] = useState<DifficultyType>(readFromUrl);

  const setDifficulty = useCallback((next: DifficultyType) => {
    const params = new URLSearchParams(window.location.search);
    params.set("difficulty", next);
    window.history.pushState(null, "", `?${params.toString()}`);
    setDifficultyState(next);
  }, []);

  return [difficulty, setDifficulty] as const;
}
