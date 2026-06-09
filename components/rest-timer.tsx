"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Pill } from "@/components/ui";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RestTimer({
  defaultSeconds = 90,
  autoStartToken = 0,
}: {
  defaultSeconds?: number;
  autoStartToken?: number;
}) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [initialSeconds, setInitialSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    setInitialSeconds(defaultSeconds);
    setSecondsLeft(defaultSeconds);
    setRunning(false);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setInitialSeconds(defaultSeconds);
    setSecondsLeft(defaultSeconds);
    setRunning(true);
  }, [autoStartToken, defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const startPreset = (seconds: number) => {
    setInitialSeconds(seconds);
    setSecondsLeft(seconds);
    setRunning(true);
  };

  return (
    <Card className="sticky top-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate">Rest timer</p>
          <h3 className="mt-1 text-3xl font-semibold tracking-tight">{formatTime(secondsLeft)}</h3>
        </div>
        <Pill tone={running ? "good" : "default"}>{running ? "Running" : "Ready"}</Pill>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[45, 60, 90].map((seconds) => (
          <Button key={seconds} variant="ghost" onClick={() => startPreset(seconds)}>
            {seconds}s
          </Button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button onClick={() => setRunning((current) => !current)}>{running ? "Pause" : "Start"}</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setSecondsLeft(initialSeconds);
            setRunning(false);
          }}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
}
