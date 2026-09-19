"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@/modules/auth/components/user-button";

type AppHeaderProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  googleCalendar?: {
    linked: boolean;
    enabled: boolean;
  };
  title?: string;
  description?: string;
};

export function AppHeader({
  user,
  googleCalendar,
  title,
  description,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {(title || description) && (
        <div className="min-w-0 flex-1">
          {title && (
            <h1 className="truncate text-sm font-medium">{title}</h1>
          )}
          {description && (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {!title && !description && <div className="flex-1" />}
      <div className="flex items-center gap-1">
        <ModeToggle />
        <UserButton user={user} googleCalendar={googleCalendar} />
      </div>
    </header>
  );
}
