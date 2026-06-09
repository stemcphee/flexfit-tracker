"use client";

import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card } from "@/components/ui";
import { STORAGE_KEY } from "@/lib/storage";

export function SettingsPageView() {
  const { resetAllData } = useData();

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="This app is single-user only and stores everything in your browser." />
      <Card>
        <p className="section-title">Storage</p>
        <p className="mt-2 text-sm text-slate">
          Local storage key: <span className="font-mono">{STORAGE_KEY}</span>
        </p>
        <p className="mt-2 text-sm text-slate">No auth, no cloud sync, no remote database.</p>
      </Card>
      <Card>
        <p className="section-title">Reset app data</p>
        <p className="mt-2 text-sm text-slate">This clears workouts, steps, football logs, and custom equipment from local storage.</p>
        <Button className="mt-4" variant="secondary" onClick={resetAllData}>
          Reset local data
        </Button>
      </Card>
    </div>
  );
}
