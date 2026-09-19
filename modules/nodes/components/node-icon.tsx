"use client";

import type { IconType } from "react-icons";
import {
  LuGitBranch,
  LuGlobe,
  LuMousePointerClick,
  LuSettings2,
  LuSparkles,
  LuWebhook,
} from "react-icons/lu";
import {
  SiClaude,
  SiGithub,
  SiGooglegemini,
  SiGooglecalendar,
  SiNotion,
  SiTelegram,
} from "react-icons/si";
import { TbBrandOpenai } from "react-icons/tb";
import { cn } from "@/lib/utils";

const ICONS: Record<string, IconType> = {
  "manual-trigger": LuMousePointerClick,
  "webhook-trigger": LuWebhook,
  "telegram-trigger": SiTelegram,
  "telegram-send": SiTelegram,
  "github-trigger": SiGithub,
  "github-create-issue": SiGithub,
  "set-fields": LuSettings2,
  if: LuGitBranch,
  switch: LuGitBranch,
  "http-request": LuGlobe,
  "notion-create-page": SiNotion,
  "google-calendar-event": SiGooglecalendar,
  openai: TbBrandOpenai,
  claude: SiClaude,
  gemini: SiGooglegemini,
};

const COLORS: Record<string, { icon: string; bg: string }> = {
  "manual-trigger": { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/12" },
  "webhook-trigger": { icon: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/12" },
  "telegram-trigger": { icon: "text-[#26A5E4]", bg: "bg-[#26A5E4]/12" },
  "telegram-send": { icon: "text-[#26A5E4]", bg: "bg-[#26A5E4]/12" },
  "github-trigger": { icon: "text-[#181717] dark:text-[#f0f6fc]", bg: "bg-[#181717]/8 dark:bg-[#f0f6fc]/10" },
  "github-create-issue": { icon: "text-[#181717] dark:text-[#f0f6fc]", bg: "bg-[#181717]/8 dark:bg-[#f0f6fc]/10" },
  "set-fields": { icon: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/12" },
  if: { icon: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/12" },
  switch: { icon: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/12" },
  "http-request": { icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/12" },
  "notion-create-page": { icon: "text-[#000000] dark:text-white", bg: "bg-black/6 dark:bg-white/10" },
  "google-calendar-event": { icon: "text-[#4285F4]", bg: "bg-[#4285F4]/12" },
  openai: { icon: "text-[#10A37F]", bg: "bg-[#10A37F]/12" },
  claude: { icon: "text-[#D97757]", bg: "bg-[#D97757]/12" },
  gemini: { icon: "text-[#8E75B2]", bg: "bg-[#8E75B2]/12" },
};

type NodeIconProps = {
  nodeType: string;
  config?: Record<string, string>;
  className?: string;
  iconClassName?: string;
  withBackground?: boolean;
  backgroundClassName?: string;
};

export function NodeIcon({
  nodeType,
  config,
  className,
  iconClassName,
  withBackground = false,
  backgroundClassName,
}: NodeIconProps) {
  const provider = config?.provider ?? "openai";
  const iconKey = nodeType === "ai" ? provider : nodeType;
  const Icon = ICONS[iconKey] ?? LuSparkles;
  const colors = COLORS[iconKey] ?? { icon: "text-muted-foreground", bg: "bg-muted" };

  const icon = (
    <Icon
      className={cn("shrink-0", colors.icon, iconClassName ?? "size-4", !withBackground && className)}
    />
  );

  if (!withBackground) return icon;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        colors.bg,
        backgroundClassName,
        className,
      )}
    >
      {icon}
    </span>
  );
}
