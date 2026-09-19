import { getGoogleCalendarAccessToken } from "@/modules/auth/lib/google-calendar";
import { interpolate } from "@/modules/engine/lib/template";

type NodeRunContext = {
  userId?: string;
};

/** Create a Google Calendar event using the workflow owner's Better Auth Google account */
export async function runGoogleCalendarEvent(
  config: any,
  item: any,
  ctx?: NodeRunContext,
) {
  if (!ctx?.userId) {
    throw new Error(
      "Google Calendar needs the workflow owner. Re-run the workflow after signing in.",
    );
  }

  const accessToken = await getGoogleCalendarAccessToken(ctx.userId);
  const title = interpolate(config.title ?? "", item);
  const start = interpolate(config.start ?? "", item);
  const end = interpolate(config.end ?? "", item);

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: title,
        start: { dateTime: start },
        end: { dateTime: end },
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    const message = data.error?.message ?? "Calendar API error";
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `${message} Enable Google Calendar from your profile, and turn on the Calendar API in the same Google Cloud project as GOOGLE_CLIENT_ID.`,
      );
    }
    throw new Error(message);
  }

  return { ...item, id: data.id, htmlLink: data.htmlLink };
}
