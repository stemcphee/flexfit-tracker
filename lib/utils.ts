import { ExerciseHistoryEntry, WorkoutSession } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function getSessionVolume(session: WorkoutSession) {
  return session.exercises.reduce((total, exercise) => {
    return total + sum(exercise.actualReps);
  }, 0);
}

export function getBestHistoryEntry(entries: ExerciseHistoryEntry[]) {
  return [...entries].sort((a, b) => {
    const weightDiff = (b.weight ?? 0) - (a.weight ?? 0);
    if (weightDiff !== 0) return weightDiff;
    return sum(b.actualReps) - sum(a.actualReps);
  })[0];
}

export function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isWithinDays(dateString: string, days: number) {
  const date = new Date(dateString);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  return date >= cutoff;
}

export function compareDescByDate<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}
