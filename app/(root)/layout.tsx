import React from 'react'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { requireAuth } from '@/modules/auth/actions'

const AppLayout = async({ children }: { children: React.ReactNode }) => {
    const user = await requireAuth();
  return (
    <div>
        <div className="absolute top-4 right-4">
            <ModeToggle />
        </div>
        {children}
    </div>
  )
}

export default AppLayout