"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Pill } from "@/components/ui";
import { RestTimer } from "@/components/rest-timer";
import { WORKOUT_TYPES } from "@/lib/constants";
import { WorkoutType } from "@/lib/types";
import { getTodayDate } from "@/lib/utils";
import { createWorkoutPlan, getWorkoutTemplate } from "@/lib/workouts";

export function WorkoutPageView() {
  const searchParams = useSearchParams();
  const { data, hydrated, addWorkoutSession } = useData();
  const initialType = (searchParams?.get("type") as WorkoutType | null) ?? "Push";
  const initialDuration = Number(searchParams?.get("duration") ?? 25);
  const [selectedType, setSelectedType] = useState<WorkoutType>(initialType);
  const [date, setDate] = useState(getTodayDate());
  const [durationMinutes, setDurationMinutes] = useState(Number.isFinite(initialDuration) ? initialDuration : 25);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [activeRestSeconds, setActiveRestSeconds] = useState(90);
  const [restTrigger, setRestTrigger] = useState(0);

  const template = useMemo(() => {
    return getWorkoutTemplate(selectedType, data.equipment);
  }, [data.equipment, selectedType]);

  const workoutPlan = useMemo(() => {
    return template ? createWorkoutPlan(template, data.exerciseHistory, durationMinutes) : null;
  }, [data.exerciseHistory, durationMinutes, template]);

  const [exerciseState, setExerciseState] = useState(workoutPlan?.exercises ?? []);

  useEffect(() => {
    setExerciseState(workoutPlan?.exercises ?? []);
  }, [workoutPlan]);

  useEffect(() => {
    const nextType = (searchParams?.get("type") as WorkoutType | null) ?? "Push";
    const nextDuration = Number(searchParams?.get("duration") ?? 25);
    setSelectedType(nextType);
    setDurationMinutes(Number.isFinite(nextDuration) ? nextDuration : 25);
  }, [searchParams]);

  if (!hydrated) {
    return <Card>Loading local data…</Card>;
  }

  const saveWorkout = () => {
    if (!template || !workoutPlan) return;
    addWorkoutSession({
      date,
      workoutType: selectedType,
      durationMinutes,
      notes,
      exercises: exerciseState.map(({ insight, plannedRestSeconds, ...exercise }) => exercise),
    });
    setNotes("");
    setMessage(`${selectedType} workout saved locally.`);
    setExerciseState(workoutPlan.exercises);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
      <PageHeader
        title="Start Workout"
        description="Pick the session and time you actually have. The app builds the workout around that."
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Workout type</label>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as WorkoutType)}>
              {WORKOUT_TYPES.filter((type) => !["Football", "Active Recovery"].includes(type)).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Date</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Planned duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[20, 25, 30, 40].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={durationMinutes === minutes ? "primary" : "ghost"}
                  onClick={() => setDurationMinutes(minutes)}
                >
                  {minutes}m
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Session notes</label>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="How did training feel?" />
          </div>
        </div>
      </Card>

      {!template || !workoutPlan ? (
        <Card>
          <p className="text-sm text-slate">This template is hidden because fewer than 4 exercises are currently possible with your available equipment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-sand">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate">Generated workout</p>
                <h3 className="mt-1 text-xl font-semibold">
                  {workoutPlan.workoutType} • {workoutPlan.focus}
                </h3>
                <p className="mt-1 text-sm text-slate">
                  Planned {workoutPlan.plannedDurationMinutes} min • estimated {workoutPlan.estimatedDurationMinutes} min
                </p>
              </div>
              <Pill>{workoutPlan.exercises.length} exercises</Pill>
            </div>
            <p className="mt-3 text-sm text-slate">{workoutPlan.notes}</p>
          </Card>

          {exerciseState.map((exercise, index) => (
            <Card key={exercise.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{exercise.exerciseName}</p>
                  <p className="mt-1 text-sm text-slate">{exercise.notes}</p>
                </div>
                {exercise.insight.isPersonalRecord ? <Pill tone="good">PR</Pill> : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-sand p-3 text-sm">
                  <p className="font-medium">Last time</p>
                  <p className="mt-1 text-slate">
                    {exercise.insight.lastWeight === null
                      ? "Bodyweight"
                      : exercise.insight.lastWeight !== null
                        ? `${exercise.insight.lastWeight}kg`
                        : "No load"}{" "}
                    {exercise.insight.lastReps.length > 0 ? `x ${exercise.insight.lastReps.join(", ")}` : ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-mint/50 p-3 text-sm">
                  <p className="font-medium">Suggested today</p>
                  <p className="mt-1 text-slate">
                    {exercise.insight.suggestedWeight === null ? "Bodyweight / reps focus" : `${exercise.insight.suggestedWeight}kg`} for{" "}
                    {exercise.sets}x{exercise.targetReps}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-oat px-3 py-2 text-sm">
                <span className="text-slate">Suggested rest</span>
                <button
                  type="button"
                  className="font-semibold text-moss"
                  onClick={() => {
                    setActiveRestSeconds(exercise.plannedRestSeconds);
                    setRestTrigger((current) => current + 1);
                  }}
                >
                  Start {exercise.plannedRestSeconds}s rest
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Weight</label>
                  <input
                    type="number"
                    step="0.5"
                    value={exercise.weight ?? ""}
                    placeholder="Bodyweight"
                    onChange={(event) =>
                      setExerciseState((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, weight: event.target.value ? Number(event.target.value) : null }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">RPE</label>
                  <select
                    value={exercise.rpe}
                    onChange={(event) =>
                      setExerciseState((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, rpe: event.target.value as typeof item.rpe } : item,
                        ),
                      )
                    }
                  >
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Hard</option>
                    <option>Max effort</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-ink">Actual reps</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {exercise.actualReps.map((rep, repIndex) => (
                    <input
                      key={repIndex}
                      type="number"
                      min={0}
                      value={rep}
                      onChange={(event) =>
                        setExerciseState((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  actualReps: item.actualReps.map((setRep, setIndex) =>
                                    setIndex === repIndex ? Number(event.target.value) : setRep,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Notes</label>
                  <input
                    value={exercise.notes}
                    onChange={(event) =>
                      setExerciseState((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, notes: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">Completed</label>
                  <select
                    value={exercise.completed ? "yes" : "no"}
                    onChange={(event) =>
                      setExerciseState((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, completed: event.target.value === "yes" } : item,
                        ),
                      )
                    }
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate">Best performance: {exercise.insight.bestPerformance}</p>
            </Card>
          ))}

          <div className="flex items-center gap-3">
            <Button onClick={saveWorkout}>Save workout</Button>
            {message ? <p className="text-sm text-moss">{message}</p> : null}
          </div>
        </div>
      )}
      </div>

      <div className="space-y-4">
        <RestTimer defaultSeconds={activeRestSeconds} autoStartToken={restTrigger} />
      </div>
    </div>
  );
}
