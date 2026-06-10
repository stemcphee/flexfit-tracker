"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultData, normalizeLocalData, readLocalData, writeLocalData } from "@/lib/storage";
import { DailyActivity, EquipmentItem, ExerciseLog, FootballSession, LocalData, WorkoutSession } from "@/lib/types";
import { makeId } from "@/lib/utils";

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
          exerciseHistory: [
            ...fullSession.exercises.map((exercise) => ({
              id: makeId("history"),
              date: fullSession.date,
              workoutSessionId: fullSession.id,
              workoutType: fullSession.workoutType,
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
            ...current.exerciseHistory,
          ],
        }));
      },
      updateWorkoutExercises: (sessionId: string, exercises: ExerciseLog[]) => {
        setData((current) => ({
          ...current,
          workoutSessions: current.workoutSessions.map((session) =>
            session.id === sessionId ? { ...session, exercises } : session,
          ),
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
