"use client";

import { useRef, useState } from "react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card } from "@/components/ui";
import { LocalData } from "@/lib/types";
import { STORAGE_KEY, normalizeLocalData } from "@/lib/storage";

export function SettingsPageView() {
  const { data, importAllData, resetAllData } = useData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `flexfit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  };

  const importBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<LocalData>;
      importAllData(normalizeLocalData(parsed));
      setMessage("Backup imported. Current local data has been replaced.");
    } catch {
      setMessage("Import failed. Use a FlexFit Tracker backup JSON file.");
    }
  };

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
        <p className="section-title">Backup and restore</p>
        <p className="mt-2 text-sm text-slate">
          Export a JSON backup from one browser, then import it into another to move your workout history.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={exportBackup}>Export backup</Button>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            Import backup
          </Button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importBackup(file);
              }
              event.currentTarget.value = "";
            }}
          />
        </div>
        <p className="mt-3 text-sm text-slate">
          Import replaces the current local data on this device with the contents of the backup file.
        </p>
        {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}
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
