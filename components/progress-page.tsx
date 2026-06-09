"use client";

import { useState } from "react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Card, Pill } from "@/components/ui";
import { getExerciseHistory, getStepGoalStreak } from "@/lib/progress";
import { getMuscleBalance, getWeeklySummary } from "@/lib/recommendations";
import { formatShortDate } from "@/lib/utils";

export function ProgressPageView() {
  const { data, hydrated } = useData();
  const [exerciseName, setExerciseName] = useState("Barbell bench press");

  if (!hydrated) return <Card>Loading local data…</Card>;

  const history = getExerciseHistory(data, exerciseName);
  const uniqueExercises = Array.from(new Set(data.exerciseHistory.map((entry) => entry.exerciseName)));
  const weekly = getWeeklySummary(data);
  const muscleBalance = getMuscleBalance(data);

  return (
    <div className="space-y-4">
      <PageHeader title="Progress" description="See workload, trends, step streaks, and football alongside your lifts." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate">Weekly workouts</p>
          <h3 className="mt-2 text-3xl font-semibold">{weekly.workouts}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate">Step goal streak</p>
          <h3 className="mt-2 text-3xl font-semibold">{getStepGoalStreak(data)} days</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate">Football sessions</p>
          <h3 className="mt-2 text-3xl font-semibold">{weekly.football}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate">Step goals hit</p>
          <h3 className="mt-2 text-3xl font-semibold">{weekly.stepsHit}</h3>
        </Card>
      </div>

      <Card>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-title">Lift history</p>
            <p className="helper">Track actual sets, reps, and weight for any exercise.</p>
          </div>
          <div className="w-full max-w-xs">
            <select value={exerciseName} onChange={(event) => setExerciseName(event.target.value)}>
              {(uniqueExercises.length > 0 ? uniqueExercises : ["Barbell bench press"]).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-slate">No saved history for this exercise yet.</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-sand px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{formatShortDate(entry.date)}</p>
                    <p className="text-sm text-slate">
                      {entry.weight === null ? "Bodyweight" : `${entry.weight}kg`} x {entry.actualReps.join(", ")}
                    </p>
                  </div>
                  <Pill>{entry.rpe}</Pill>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <p className="section-title">Muscle groups trained</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {muscleBalance.map((item) => (
            <div key={item.group} className="rounded-2xl bg-sand px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{item.group}</span>
                <Pill tone={item.status === "Balanced" ? "good" : item.status === "High volume" ? "warn" : "default"}>
                  {item.status}
                </Pill>
              </div>
              <p className="mt-2 text-sm text-slate">{item.hits} weekly exercise slots</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
