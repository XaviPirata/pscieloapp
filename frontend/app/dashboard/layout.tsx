'use client'

import { useState, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar, { mobileNavItems } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

// ─── Mobile Menu Context ───────────────────────────────────────────────────────
// Lets any child (e.g. Header) open the mobile drawer without prop drilling

interface MobileMenuCtxType {
  onOpen: () => void
}

const MobileMenuCtx = createContext<MobileMenuCtxType>({ onOpen: () => {} })

export function useMobileMenu() {
  return useContext(MobileMenuCtx)
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <MobileMenuCtx.Provider value={{ onOpen: () => setMobileOpen(true) }}>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f5f7fc] via-[#eef0f8] to-[#f0f2f9] dark:from-[#07090f] dark:via-[#0d1020] dark:to-[#09101e]">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
          {children}
        </main>

        {/* ─── BOTTOM NAVIGATION (mobile only) ─── */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/40 dark:border-slate-700/40 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-stretch">
              {/* Nav items (first 5) */}
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-1 flex-col items-center justify-center py-2 pt-3 min-h-[60px]"
                  >
                    <motion.div
                      whileTap={{ scale: 0.82 }}
                      className="flex flex-col items-center gap-1"
                    >
                      {/* Active top bar */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="bottom-nav-pill"
                            className={cn(
                              'absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full',
                              `bg-gradient-to-r ${item.color}`,
                            )}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200',
                        isActive ? `bg-gradient-to-br ${item.color} shadow-sm` : 'bg-transparent',
                      )}>
                        <item.icon className={cn(
                          'h-[18px] w-[18px] transition-colors',
                          isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500',
                        )} />
                      </div>

                      {/* Label */}
                      <span className={cn(
                        'text-[10px] font-medium leading-none transition-colors',
                        isActive
                          ? 'text-slate-700 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600',
                      )}>
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                )
              })}

              {/* "Más" opens the full drawer */}
              <button
                onClick={() => setMobileOpen(true)}
                className="relative flex flex-1 flex-col items-center justify-center py-2 pt-3 min-h-[60px]"
              >
                <motion.div whileTap={{ scale: 0.82 }} className="flex flex-col items-center gap-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="3.5" cy="9" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
                      <circle cx="9" cy="9" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
                      <circle cx="14.5" cy="9" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium leading-none text-slate-400 dark:text-slate-600">
                    Más
                  </span>
                </motion.div>
              </button>
            </div>

            {/* iOS home-indicator safe area */}
            <div className="h-safe-bottom" />
          </div>
        </nav>
      </div>
    </MobileMenuCtx.Provider>
  )
}
