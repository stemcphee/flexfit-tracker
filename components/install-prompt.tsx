"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";

type DeferredInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<DeferredInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isAppleMobile, setIsAppleMobile] = useState(false);

  useEffect(() => {
    setIsAppleMobile(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as DeferredInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  return (
    <Card className="border-mint/70 bg-mint/40">
      <p className="text-sm font-semibold text-ink">Install FlexFit Tracker</p>
      <p className="mt-2 text-sm text-slate">
        {installEvent
          ? "Add the tracker to your home screen so it opens like a proper app."
          : isAppleMobile
            ? "On iPhone: tap Share, then Add to Home Screen."
            : "Once your browser offers install, you can add this tracker to your home screen."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {installEvent ? (
          <Button
            onClick={async () => {
              await installEvent.prompt();
              await installEvent.userChoice;
              setInstallEvent(null);
            }}
          >
            Install app
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
