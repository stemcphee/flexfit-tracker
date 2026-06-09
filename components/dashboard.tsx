"use client";

import Link from "next/link";
import { useData } from "@/components/data-provider";
import { InstallPrompt } from "@/components/install-prompt";
import { Card, Pill } from "@/components/ui";
import { getLiftProgressHeadline, getRecentPrs, getStepGoalStreak } from "@/lib/progress";
import { getMuscleBalance, getSuggestedWorkout, getWeeklySummary } from "@/lib/recommendations";
import { STEP_GOAL } from "@/lib/constants";
import { compareDescByDate, formatDate, formatShortDate } from "@/lib/utils";

export function DashboardView() {
  const { data, hydrated } = useData();

  if (!hydrated) {
    return <Card>Loading local data…</Card>;
  }

  const suggested = getSuggestedWorkout(data);
  const weekly = getWeeklySummary(data);
  const lastWorkout = compareDescByDate(data.workoutSessions)[0];
  const todaySteps = data.dailyActivity.find((entry) => entry.date === new Date().toISOString().slice(0, 10));
  const muscleBalance = getMuscleBalance(data).slice(0, 6);
  const prs = getRecentPrs(data);
  const footballThisWeek = data.footballSessions.filter((session) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(session.date) >= weekAgo;
  });
  const lastLift = getLiftProgressHeadline(data.exerciseHistory);

  return (
    <div className="space-y-4">
      <InstallPrompt />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-ink text-white">
        <p className="text-sm text-white/70">Start workout</p>
        <h3 className="mt-2 text-2xl font-semibold">Ready for {suggested.workout}</h3>
        <p className="mt-2 text-sm text-white/75">{suggested.reason}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[20, 25, 30].map((duration) => (
            <Link
              key={duration}
              href={`/workout?type=${encodeURIComponent(suggested.workout)}&duration=${duration}`}
              className="inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              {duration} min
            </Link>
          ))}
        </div>
      </Card>

        <Card>
        <p className="text-sm text-slate">Today&apos;s steps</p>
        <div className="mt-2 flex items-end justify-between">
          <h3 className="text-3xl font-semibold tracking-tight">{todaySteps?.steps ?? 0}</h3>
          <Pill tone={todaySteps?.stepGoalMet ? "good" : "warn"}>
            {todaySteps?.stepGoalMet ? "Goal met" : `${STEP_GOAL} goal`}
          </Pill>
        </div>
        <p className="mt-3 text-sm text-slate">{suggested.walkReminder ?? `Current streak: ${getStepGoalStreak(data)} days.`}</p>
        </Card>

        <Card>
        <p className="text-sm text-slate">Last workout</p>
        <h3 className="mt-2 text-2xl font-semibold">{lastWorkout?.workoutType ?? "None yet"}</h3>
        <p className="mt-2 text-sm text-slate">
          {lastWorkout ? `${formatDate(lastWorkout.date)} • ${lastWorkout.durationMinutes} min` : "Start with any template and the app will adapt from there."}
        </p>
        </Card>

        <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate">Weekly muscle balance</p>
          <Pill>{weekly.workouts} workouts</Pill>
        </div>
        <div className="mt-4 space-y-3">
          {muscleBalance.map((item) => (
            <div key={item.group} className="flex items-center justify-between rounded-2xl bg-sand px-3 py-2">
              <span className="text-sm font-medium">{item.group}</span>
              <span className="text-xs text-slate">{item.status}</span>
            </div>
          ))}
        </div>
        </Card>

        <Card>
        <p className="text-sm text-slate">Recent lift progress</p>
        <h3 className="mt-2 text-xl font-semibold">{lastLift}</h3>
        <div className="mt-4 space-y-3">
          {prs.length === 0 ? (
            <p className="text-sm text-slate">No logged lifts yet.</p>
          ) : (
            prs.map((item) => (
              <div key={item.exerciseName} className="rounded-2xl bg-sand px-3 py-2">
                <p className="text-sm font-medium">{item.exerciseName}</p>
                <p className="text-xs text-slate">
                  {item.best.weight === null ? "Bodyweight" : `${item.best.weight}kg`} x {item.best.actualReps.join(", ")}
                </p>
              </div>
            ))
          )}
        </div>
        </Card>

        <Card>
        <p className="text-sm text-slate">Football this week</p>
        <h3 className="mt-2 text-3xl font-semibold">{footballThisWeek.length}</h3>
        <div className="mt-4 space-y-3">
          {footballThisWeek.length === 0 ? (
            <p className="text-sm text-slate">No sessions logged in the last 7 days.</p>
          ) : (
            footballThisWeek.map((session) => (
              <div key={session.id} className="rounded-2xl bg-sand px-3 py-2">
                <p className="text-sm font-medium">{formatShortDate(session.date)}</p>
                <p className="text-xs text-slate">
                  {session.durationMinutes} min • {session.intensity}
                </p>
              </div>
            ))
          )}
        </div>
        </Card>
      </div>
    </div>
  );
}
