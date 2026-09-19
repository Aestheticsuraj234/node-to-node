"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGoogleCalendarStatus } from "@/modules/auth/lib/google-calendar";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireUnauth() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }
}

export async function signIn(callbackURL = "/" , provider: "github" | "google") {
  const result = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL,
      disableRedirect: true,
    },
    headers: await headers(),
  });

  return result.url;
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/sign-in");
}

export async function getGoogleCalendarConnection() {
  const user = await requireAuth();
  return getGoogleCalendarStatus(user.id);
}
