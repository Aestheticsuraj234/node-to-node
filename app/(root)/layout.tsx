import React from 'react'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { requireAuth } from '@/modules/auth/actions'
import { AppShell } from '@/modules/workflows/components/app-shell';

const AppLayout = async({ children }: { children: React.ReactNode }) => {
    const user = await requireAuth();
  return (
    <AppShell user={user}>{children}</AppShell>
  )
}

export default AppLayout