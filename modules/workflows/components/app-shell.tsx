"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/modules/workflows/components/app-header";
import { AppSidebar } from "@/modules/workflows/components/app-sidebar";

type AppShellProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function AppShell({
  user,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader user={user} title={title} description={description} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
