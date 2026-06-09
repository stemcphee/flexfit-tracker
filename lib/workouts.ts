import { WORKOUT_TEMPLATES } from "@/lib/constants";
import {
  EquipmentItem,
  ExerciseHistoryEntry,
  ExerciseLog,
  Rpe,
  WorkoutTemplate,
  WorkoutType,
} from "@/lib/types";
import { getBestHistoryEntry, makeId, sum } from "@/lib/utils";

type ExerciseInsight = {
  lastWeight: number | null;
  lastReps: number[];
  suggestedWeight: number | null;
  bestPerformance: string;
  isPersonalRecord: boolean;
};

export type GeneratedExerciseLog = ExerciseLog & {
  insight: ExerciseInsight;
  plannedRestSeconds: number;
};

export type GeneratedWorkoutPlan = {
  workoutType: WorkoutType;
  plannedDurationMinutes: number;
  estimatedDurationMinutes: number;
  focus: string;
  notes: string;
  exercises: GeneratedExerciseLog[];
};

const DUMBBELL_INCREMENTS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 25, 26, 28, 30, 32.5];

function roundToNearestIncrement(value: number, increments: number[]) {
  return increments.reduce((closest, current) => {
    return Math.abs(current - value) < Math.abs(closest - value) ? current : closest;
  }, increments[0]);
}

function usesDumbbells(equipment: string[]) {
  return equipment.some((item) => item.toLowerCase().includes("dumbbell"));
}

function usesBarbell(equipment: string[]) {
  return equipment.some((item) => item.toLowerCase().includes("barbell"));
}

function isBodyweight(weight: number | null, equipment: string[]) {
  return weight === null || equipment.includes("Bodyweight") || equipment.includes("Dip station");
}

function nextWeightFromRpe(
  weight: number | null,
  completedAllReps: boolean,
  rpe: Rpe,
  equipment: string[],
) {
  if (isBodyweight(weight, equipment)) return null;
  if (weight === null) return null;

  if (usesBarbell(equipment)) {
    if (completedAllReps && (rpe === "Easy" || rpe === "Moderate")) return weight + 2.5;
    if (completedAllReps && rpe === "Hard") return weight;
    return Math.max(0, weight - 2.5);
  }

  if (usesDumbbells(equipment)) {
    if (completedAllReps && (rpe === "Easy" || rpe === "Moderate")) {
      return roundToNearestIncrement(weight + 2, DUMBBELL_INCREMENTS);
    }
    if (completedAllReps && rpe === "Hard") return weight;
    return roundToNearestIncrement(Math.max(2, weight - 2), DUMBBELL_INCREMENTS);
  }

  if (completedAllReps && (rpe === "Easy" || rpe === "Moderate")) return weight + 1.25;
  if (completedAllReps && rpe === "Hard") return weight;
  return Math.max(0, weight - 1.25);
}

function getRestSeconds(exerciseName: string, muscleGroups: string[]) {
  const name = exerciseName.toLowerCase();

  if (name.includes("squat") || name.includes("bench") || name.includes("row") || name.includes("deadlift")) {
    return 90;
  }

  if (name.includes("dip") || name.includes("split squat") || name.includes("lunge")) {
    return 75;
  }

  if (muscleGroups.includes("Core") || name.includes("plank")) {
    return 45;
  }

  return 60;
}

function getDurationProfile(template: WorkoutTemplate, plannedDurationMinutes: number) {
  if (plannedDurationMinutes <= 20) {
    return {
      exerciseCount: 4,
      mainLiftSetBonus: 0,
      focus: "Quick",
      notes: "Compressed session: compounds first, accessories trimmed.",
    };
  }

  if (plannedDurationMinutes <= 30) {
    return {
      exerciseCount: template.exercises.length,
      mainLiftSetBonus: 0,
      focus: "Standard",
      notes: "Balanced template with full exercise coverage.",
    };
  }

  return {
    exerciseCount: template.exercises.length,
    mainLiftSetBonus: plannedDurationMinutes >= 40 ? 2 : 1,
    focus: "Extended",
    notes: "Extra time is pushed into more main-lift volume, not filler.",
  };
}

function isPrimaryLift(exerciseName: string) {
  const name = exerciseName.toLowerCase();
  return name.includes("bench") || name.includes("squat") || name.includes("deadlift") || name.includes("row");
}

function buildExerciseLogs(
  exercises: WorkoutTemplate["exercises"],
  history: ExerciseHistoryEntry[],
  mainLiftSetBonus: number,
): GeneratedExerciseLog[] {
  return exercises.map((exercise, index) => {
    const exerciseHistory = history.filter((entry) => entry.exerciseName === exercise.exerciseName);
    const latest = exerciseHistory[0];
    const best = getBestHistoryEntry(exerciseHistory);
    const adjustedSets =
      index === 0 ? exercise.sets + mainLiftSetBonus : isPrimaryLift(exercise.exerciseName) ? exercise.sets + Math.max(0, mainLiftSetBonus - 1) : exercise.sets;
    const completedAllReps =
      latest?.actualReps.length === adjustedSets &&
      latest.actualReps.every((rep) => rep >= exercise.targetReps) &&
      latest.completed;
    const suggestedWeight =
      latest && latest.weight !== undefined
        ? nextWeightFromRpe(latest.weight, Boolean(completedAllReps), latest.rpe, exercise.equipment)
        : exercise.startingWeight;

    return {
      id: makeId("exercise"),
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      sets: adjustedSets,
      targetReps: exercise.targetReps,
      actualReps: Array.from({ length: adjustedSets }, () => exercise.targetReps),
      weight: suggestedWeight,
      rpe: "Moderate",
      completed: true,
      notes: exercise.notes,
      plannedRestSeconds: getRestSeconds(exercise.exerciseName, exercise.muscleGroup),
      insight: {
        lastWeight: latest?.weight ?? null,
        lastReps: latest?.actualReps ?? [],
        suggestedWeight,
        bestPerformance: best
          ? `${best.weight === null ? "Bodyweight" : `${best.weight}kg`} x ${best.actualReps.join(", ")}`
          : "No previous data",
        isPersonalRecord:
          Boolean(latest && best) &&
          latest.date === best.date &&
          latest.weight === best.weight &&
          sum(latest.actualReps) >= sum(best.actualReps),
      },
    };
  });
}

export function getAvailableTemplates(equipment: EquipmentItem[]) {
  const availableNames = new Set(equipment.filter((item) => item.available).map((item) => item.name));

  return WORKOUT_TEMPLATES.map((template) => ({
    ...template,
    exercises: template.exercises.filter((exercise) =>
      exercise.equipment.every((piece) => piece === "Bodyweight" || availableNames.has(piece)),
    ),
  })).filter((template) => template.exercises.length >= 4);
}

export function getWorkoutTemplate(workoutType: WorkoutType, equipment: EquipmentItem[]) {
  return getAvailableTemplates(equipment).find((template) => template.workoutType === workoutType);
}

export function createWorkoutPlan(
  template: WorkoutTemplate,
  history: ExerciseHistoryEntry[],
  plannedDurationMinutes: number,
): GeneratedWorkoutPlan {
  const profile = getDurationProfile(template, plannedDurationMinutes);
  const selectedExercises = template.exercises.slice(0, profile.exerciseCount);
  const exercises = buildExerciseLogs(selectedExercises, history, profile.mainLiftSetBonus);

  const estimatedDurationMinutes = exercises.reduce((total, exercise) => {
    const workBlock = exercise.sets * 1.2;
    const restBlock = ((exercise.sets - 1) * exercise.plannedRestSeconds) / 60;
    return total + workBlock + restBlock;
  }, 0);

  return {
    workoutType: template.workoutType,
    plannedDurationMinutes,
    estimatedDurationMinutes: Math.max(18, Math.round(estimatedDurationMinutes)),
    focus: profile.focus,
    notes: profile.notes,
    exercises,
  };
}
