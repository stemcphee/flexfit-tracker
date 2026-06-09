"use client";

import { useState } from "react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Pill } from "@/components/ui";
import { compareDescByDate, formatDate, getTodayDate } from "@/lib/utils";

export function FootballPageView() {
  const { data, hydrated, addFootballSession } = useData();
  const [date, setDate] = useState(getTodayDate());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [intensity, setIntensity] = useState<"Light" | "Moderate" | "Intense">("Moderate");
  const [notes, setNotes] = useState("");

  if (!hydrated) return <Card>Loading local data…</Card>;

  return (
    <div className="space-y-4">
      <PageHeader title="Football" description="Log conditioning work and lower-body fatigue from football sessions." />
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Date</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Duration</label>
            <input type="number" min={10} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Intensity</label>
            <select value={intensity} onChange={(event) => setIntensity(event.target.value as typeof intensity)}>
              <option>Light</option>
              <option>Moderate</option>
              <option>Intense</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Notes</label>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Surface, fatigue, match..." />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              addFootballSession({ date, durationMinutes, intensity, notes });
              setNotes("");
            }}
          >
            Save football session
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {compareDescByDate(data.footballSessions).map((session) => (
          <Card key={session.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{formatDate(session.date)}</p>
                <p className="text-sm text-slate">{session.durationMinutes} min</p>
              </div>
              <Pill tone={session.intensity === "Intense" ? "warn" : "good"}>{session.intensity}</Pill>
            </div>
            {session.notes ? <p className="mt-3 text-sm text-slate">{session.notes}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
