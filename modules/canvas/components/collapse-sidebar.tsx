"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export function CollapseSidebarOnMount() {
  const { setOpen, isMobile } = useSidebar();

  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  return null;
}
