"use client";

import { useState, useTransition } from "react";
import {
  FlowConnectionIcon,
  GithubIcon,
  GoogleIcon,
  SecurityCheckIcon,
  WorkflowIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

type SocialProvider = "github" | "google";

export function SignInForm() {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSignIn(provider: SocialProvider) {
    setPendingProvider(provider);
    startTransition(async () => {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={WorkflowIcon}
              strokeWidth={2}
              className="size-6"
            />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <CardTitle className="text-xl">Welcome to Node to Node</CardTitle>
            <CardDescription className="max-w-xs text-pretty">
              Sign in with GitHub or Google to start building workflows.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Continue with
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isPending}
            onClick={() => handleSignIn("github")}
          >
            {isPending && pendingProvider === "github" ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={GithubIcon}
                strokeWidth={2}
                data-icon="inline-start"
                className="size-4"
              />
            )}
            Continue with GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={isPending}
            onClick={() => handleSignIn("google")}
          >
            {isPending && pendingProvider === "google" ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={GoogleIcon}
                strokeWidth={2}
                data-icon="inline-start"
                className="size-4"
              />
            )}
            Continue with Google
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 border-t">
        <div className="flex items-start gap-2.5">
          <HugeiconsIcon
            icon={FlowConnectionIcon}
            strokeWidth={2}
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          <p className="text-sm text-muted-foreground">
            Connect nodes and ship workflows faster.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <HugeiconsIcon
            icon={SecurityCheckIcon}
            strokeWidth={2}
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          <p className="text-sm text-muted-foreground">
            Secure OAuth sign-in. We never see your password.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
