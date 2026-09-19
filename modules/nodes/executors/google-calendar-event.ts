import { interpolate } from "@/modules/engine/lib/template";

async function getGoogleAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    const hint =
      data.error === "unauthorized_client"
        ? " — client ID/secret don't match the refresh token. Re-generate all 3 from the same OAuth client (see OAuth Playground steps)."
        : "";
    throw new Error(
      [data.error, data.error_description].filter(Boolean).join(": ") + hint,
    );
  }
  return data.access_token as string;
}

/** Create a Google Calendar event — refresh token in .env */
export async function runGoogleCalendarEvent(config: any, item: any) {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN missing in .env");
  }

  const accessToken = await getGoogleAccessToken();
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
  if (!res.ok) throw new Error(data.error?.message ?? "Calendar API error");

  return { ...item, id: data.id, htmlLink: data.htmlLink };
}
