"use client";

import { DEFAULT_EQUIPMENT } from "@/lib/constants";
import { LocalData } from "@/lib/types";

export const STORAGE_KEY = "flexfit-tracker-data";

export const defaultData: LocalData = {
  workoutSessions: [],
  dailyActivity: [],
  footballSessions: [],
  equipment: DEFAULT_EQUIPMENT,
  exerciseHistory: [],
};

export function readLocalData(): LocalData {
  if (typeof window === "undefined") return defaultData;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }

    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      workoutSessions: parsed.workoutSessions ?? [],
      dailyActivity: parsed.dailyActivity ?? [],
      footballSessions: parsed.footballSessions ?? [],
      equipment:
        parsed.equipment && parsed.equipment.length > 0 ? parsed.equipment : DEFAULT_EQUIPMENT,
      exerciseHistory: parsed.exerciseHistory ?? [],
    };
  } catch {
    return defaultData;
  }
}

export function writeLocalData(data: LocalData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
