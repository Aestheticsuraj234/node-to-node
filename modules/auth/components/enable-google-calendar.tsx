"use client";

import { useState, useTransition } from "react";
import { SiGooglecalendar } from "react-icons/si";
import { authClient } from "@/lib/auth-client";
import { GOOGLE_CALENDAR_EVENTS_SCOPE } from "@/modules/auth/lib/google-scopes";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type GoogleCalendarStatus = {
  linked: boolean;
  enabled: boolean;
};

export async function enableGoogleCalendar(callbackURL?: string) {
  return authClient.linkSocial({
    provider: "google",
    scopes: [GOOGLE_CALENDAR_EVENTS_SCOPE],
    callbackURL:
      callbackURL ??
      (typeof window !== "undefined" ? window.location.href : "/"),
    additionalParams: {
      access_type: "offline",
      prompt: "consent",
    },
  });
}

type EnableGoogleCalendarButtonProps = {
  status?: GoogleCalendarStatus | null;
  className?: string;
  compact?: boolean;
};

export function EnableGoogleCalendarButton({
  status,
  className,
  compact = false,
}: EnableGoogleCalendarButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEnable() {
    setError(null);
    startTransition(async () => {
      const result = await enableGoogleCalendar();
      if (result.error) {
        setError(result.error.message ?? "Could not start Google Calendar auth");
      }
    });
  }

  if (status?.enabled) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Google Calendar is connected to your account.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!compact && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Events are created on the Google account you connect here — not from
          a refresh token in .env. Enable the Calendar API on that Google Cloud
          project, then grant access.
        </p>
      )}
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant={compact ? "outline" : "default"}
        disabled={isPending}
        onClick={handleEnable}
        className={compact ? "w-full" : undefined}
      >
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <SiGooglecalendar className="size-3.5" />
        )}
        Enable Google Calendar
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
