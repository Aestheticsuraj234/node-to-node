"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function ThemeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 3a9 9 0 0 1 0 18Z"
        fill="currentColor"
        transform="rotate(45 12 12)"
      />
    </svg>
  )
}

export function ModeToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      {...props}
    >
      <ThemeIcon className="size-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
