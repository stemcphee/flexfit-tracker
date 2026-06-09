"use client";

import { useEffect, useState } from "react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Pill } from "@/components/ui";
import { STEP_GOAL } from "@/lib/constants";
import { compareDescByDate, formatDate, getTodayDate } from "@/lib/utils";

export function StepsPageView() {
  const { data, hydrated, saveDailyActivity } = useData();
  const [date, setDate] = useState(getTodayDate());
  const existing = data.dailyActivity.find((item) => item.date === date);
  const [steps, setSteps] = useState(existing?.steps ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  useEffect(() => {
    const nextExisting = data.dailyActivity.find((item) => item.date === date);
    setSteps(nextExisting?.steps ?? 0);
    setNotes(nextExisting?.notes ?? "");
  }, [data.dailyActivity, date]);

  if (!hydrated) return <Card>Loading local data…</Card>;

  const save = () => {
    saveDailyActivity({
      date,
      steps,
      stepGoalMet: steps >= STEP_GOAL,
      notes,
    });
  };

  const entries = compareDescByDate(data.dailyActivity);

  return (
    <div className="space-y-4">
      <PageHeader title="Steps" description="Track daily steps against your 10,000-step baseline." />
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Date</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Steps</label>
            <input type="number" min={0} value={steps} onChange={(event) => setSteps(Number(event.target.value))} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Notes</label>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Walk, run, recovery..." />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate">Goal status: {steps >= STEP_GOAL ? "Met" : `${STEP_GOAL - steps} steps left`}</p>
          <Button onClick={save}>Save steps</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{formatDate(entry.date)}</p>
                <p className="text-sm text-slate">{entry.steps.toLocaleString()} steps</p>
              </div>
              <Pill tone={entry.stepGoalMet ? "good" : "warn"}>
                {entry.stepGoalMet ? "Goal met" : "Below target"}
              </Pill>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
