'use client'

import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f5f7fc] via-[#eef0f8] to-[#f0f2f9] dark:from-[#07090f] dark:via-[#0d1020] dark:to-[#09101e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
