"use client";

import Link from "next/link";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Pill } from "@/components/ui";
import { compareDescByDate, formatDate, getSessionVolume } from "@/lib/utils";

export function HistoryPageView() {
  const { data, hydrated, removeWorkoutSession } = useData();
  if (!hydrated) return <Card>Loading local data…</Card>;

  const sessions = compareDescByDate(data.workoutSessions);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workout History"
        description="Review previous sessions, loads, and rep performance."
        action={
          <Link href="/workout?mode=log">
            <Button>Log past workout</Button>
          </Link>
        }
      />
      <Card className="bg-sand">
        <p className="text-sm font-semibold text-ink">Add a previous workout</p>
        <p className="mt-2 text-sm text-slate">
          Use the workout screen, change the workout date to any earlier day, then save the session normally.
        </p>
      </Card>
      {sessions.length === 0 ? (
        <Card>No workout sessions saved yet.</Card>
      ) : (
        sessions.map((session) => (
          <Card key={session.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{session.workoutType}</h3>
                <p className="mt-1 text-sm text-slate">{formatDate(session.date)} • {session.durationMinutes} min</p>
              </div>
              <div className="flex items-center gap-2">
                <Pill>{getSessionVolume(session)} reps</Pill>
                <Button variant="ghost" onClick={() => removeWorkoutSession(session.id)}>
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {session.exercises.map((exercise) => (
                <div key={exercise.id} className="rounded-2xl bg-sand p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{exercise.exerciseName}</p>
                      <p className="text-xs text-slate">
                        {exercise.weight === null ? "Bodyweight" : `${exercise.weight}kg`} x {exercise.actualReps.join(", ")}
                      </p>
                    </div>
                    <span className="text-xs text-slate">{exercise.rpe}</span>
                  </div>
                </div>
              ))}
            </div>
            {session.notes ? <p className="mt-4 text-sm text-slate">{session.notes}</p> : null}
          </Card>
        ))
      )}
    </div>
  );
}
