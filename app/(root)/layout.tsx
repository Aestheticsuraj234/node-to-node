import React from 'react'
import { getGoogleCalendarConnection, requireAuth } from '@/modules/auth/actions'
import { AppShell } from '@/modules/workflows/components/app-shell';

const AppLayout = async({ children }: { children: React.ReactNode }) => {
    const user = await requireAuth();
    const googleCalendar = await getGoogleCalendarConnection();
  return (
    <AppShell user={user} googleCalendar={googleCalendar}>{children}</AppShell>
  )
}

export default AppLayout