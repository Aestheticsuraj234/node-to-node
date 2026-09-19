"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSquare01Icon, WorkflowIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NewWorkflowButton } from "./new-workflow-button";
// import { NewWorkflowButton } from "@/modules/workflows/components/new-workflow-button";

export function AppSidebar() {
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={WorkflowIcon}
              strokeWidth={2}
              className="size-6"
            />
          </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Node to Node </span>
                <span className="truncate text-xs text-muted-foreground">
                  Workflow automation
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isDashboard}
                  tooltip="Workflows"
                  render={<Link href="/" />}
                >
                  <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
                  <span>Workflows</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NewWorkflowButton className="w-full" />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
