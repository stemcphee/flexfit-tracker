"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultData, normalizeLocalData, readLocalData, writeLocalData } from "@/lib/storage";
import {
  DailyActivity,
  EquipmentItem,
  ExerciseHistoryEntry,
  ExerciseLog,
  FootballSession,
  LocalData,
  WorkoutSession,
} from "@/lib/types";
import { makeId } from "@/lib/utils";

function buildExerciseHistory(workoutSessions: WorkoutSession[]): ExerciseHistoryEntry[] {
  return workoutSessions.flatMap((session) =>
    session.exercises.map((exercise) => ({
      id: makeId("history"),
      date: session.date,
      workoutSessionId: session.id,
      workoutType: session.workoutType,
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      actualReps: exercise.actualReps,
      weight: exercise.weight,
      rpe: exercise.rpe,
      completed: exercise.completed,
      notes: exercise.notes,
    })),
  );
}

export function useLocalData() {
  const [data, setData] = useState<LocalData>(defaultData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const nextData = readLocalData();
    setData(nextData);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocalData(data);
  }, [data, hydrated]);

  const api = useMemo(
    () => ({
      addWorkoutSession: (session: Omit<WorkoutSession, "id">) => {
        const fullSession: WorkoutSession = { ...session, id: makeId("session") };
        setData((current) => ({
          ...current,
          workoutSessions: [fullSession, ...current.workoutSessions],
          exerciseHistory: buildExerciseHistory([fullSession, ...current.workoutSessions]),
        }));
      },
      updateWorkoutExercises: (sessionId: string, exercises: ExerciseLog[]) => {
        setData((current) => {
          const workoutSessions = current.workoutSessions.map((session) =>
            session.id === sessionId ? { ...session, exercises } : session,
          );

          return {
            ...current,
            workoutSessions,
            exerciseHistory: buildExerciseHistory(workoutSessions),
          };
        });
      },
      removeWorkoutSession: (sessionId: string) => {
        setData((current) => {
          const workoutSessions = current.workoutSessions.filter((session) => session.id !== sessionId);
          return {
            ...current,
            workoutSessions,
            exerciseHistory: buildExerciseHistory(workoutSessions),
          };
        });
      },
      resetExerciseProgress: (exerciseName: string) => {
        setData((current) => ({
          ...current,
          exerciseHistory: current.exerciseHistory.filter((entry) => entry.exerciseName !== exerciseName),
        }));
      },
      saveDailyActivity: (entry: Omit<DailyActivity, "id">) => {
        setData((current) => {
          const existing = current.dailyActivity.find((item) => item.date === entry.date);
          if (existing) {
            return {
              ...current,
              dailyActivity: current.dailyActivity.map((item) =>
                item.date === entry.date ? { ...item, ...entry } : item,
              ),
            };
          }

          return {
            ...current,
            dailyActivity: [{ ...entry, id: makeId("steps") }, ...current.dailyActivity],
          };
        });
      },
      addFootballSession: (entry: Omit<FootballSession, "id">) => {
        setData((current) => ({
          ...current,
          footballSessions: [{ ...entry, id: makeId("football") }, ...current.footballSessions],
        }));
      },
      saveEquipment: (items: EquipmentItem[]) => {
        setData((current) => ({ ...current, equipment: items }));
      },
      importAllData: (incoming: Partial<LocalData>) => {
        setData(normalizeLocalData(incoming));
      },
      resetAllData: () => {
        setData(defaultData);
      },
    }),
    [],
  );

  return { data, hydrated, ...api };
}
