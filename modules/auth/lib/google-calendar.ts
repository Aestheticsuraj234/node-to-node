import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { hasGoogleCalendarScope } from "@/modules/auth/lib/google-scopes";

export type GoogleCalendarStatus = {
  linked: boolean;
  enabled: boolean;
};

export async function getGoogleAccount(userId: string) {
  return prisma.account.findFirst({
    where: { userId, providerId: "google" },
    select: { id: true, scope: true },
  });
}

export async function getGoogleCalendarStatus(
  userId: string,
): Promise<GoogleCalendarStatus> {
  const account = await getGoogleAccount(userId);
  return {
    linked: Boolean(account),
    enabled: hasGoogleCalendarScope(account?.scope),
  };
}

/** Uses the workflow owner's Better Auth Google account. Do not pass session headers. */
export async function getGoogleCalendarAccessToken(userId: string) {
  const account = await getGoogleAccount(userId);
  if (!account) {
    throw new Error(
      "Google is not connected. Sign in with Google, or enable Google Calendar from your profile.",
    );
  }

  if (!hasGoogleCalendarScope(account.scope)) {
    throw new Error(
      "Google Calendar is not enabled. Use Enable Google Calendar in your profile, then run again.",
    );
  }

  const tokens = await auth.api.getAccessToken({
    body: {
      accountId: account.id,
      userId,
    },
  });

  if (!tokens?.accessToken) {
    throw new Error(
      "Could not get a Google access token. Enable Google Calendar again so Google can issue a refresh token.",
    );
  }

  return tokens.accessToken;
}
