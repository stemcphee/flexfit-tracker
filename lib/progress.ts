import { ExerciseHistoryEntry, LocalData } from "@/lib/types";
import { compareDescByDate, isWithinDays, sum } from "@/lib/utils";

export function getExerciseHistory(data: LocalData, exerciseName: string) {
  return compareDescByDate(
    data.exerciseHistory.filter((entry) => entry.exerciseName === exerciseName),
  );
}

export function getLiftProgressHeadline(entries: ExerciseHistoryEntry[]) {
  const latest = entries[0];
  if (!latest) return "No lift data yet";
  return `${latest.exerciseName}: ${latest.weight === null ? "Bodyweight" : `${latest.weight}kg`} x ${latest.actualReps.join(", ")}`;
}

export function getStepGoalStreak(data: LocalData) {
  const sorted = compareDescByDate(data.dailyActivity);
  let streak = 0;
  for (const day of sorted) {
    if (day.stepGoalMet) streak += 1;
    else break;
  }
  return streak;
}

export function getRecentPrs(data: LocalData) {
  const recent = data.exerciseHistory.filter((entry) => isWithinDays(entry.date, 21));
  const byExercise = new Map<string, ExerciseHistoryEntry[]>();

  recent.forEach((entry) => {
    const list = byExercise.get(entry.exerciseName) ?? [];
    list.push(entry);
    byExercise.set(entry.exerciseName, list);
  });

  return Array.from(byExercise.entries())
    .map(([exerciseName, entries]) => {
      const best = [...entries].sort((a, b) => {
        const weightDiff = (b.weight ?? 0) - (a.weight ?? 0);
        if (weightDiff !== 0) return weightDiff;
        return sum(b.actualReps) - sum(a.actualReps);
      })[0];
      return { exerciseName, best };
    })
    .slice(0, 4);
}
