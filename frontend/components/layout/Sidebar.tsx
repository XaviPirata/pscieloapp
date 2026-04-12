'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, Heart, Calendar, Building2,
  DollarSign, BarChart3, Settings, LogOut,
  ChevronLeft, Sparkles, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const navItems = [
  { label: 'Inicio',         href: '/dashboard',                icon: Home,        color: 'from-rose-400 to-pink-500' },
  { label: 'Profesionales',  href: '/dashboard/professionals',  icon: Users,       color: 'from-violet-400 to-purple-500' },
  { label: 'Pacientes',      href: '/dashboard/patients',       icon: Heart,       color: 'from-pink-400 to-rose-500' },
  { label: 'Sesiones',       href: '/dashboard/sessions',       icon: Calendar,    color: 'from-blue-400 to-cyan-500' },
  { label: 'Consultorios',   href: '/dashboard/rooms',          icon: Building2,   color: 'from-teal-400 to-emerald-500' },
  { label: 'Comisiones',     href: '/dashboard/commissions',    icon: DollarSign,  color: 'from-amber-400 to-orange-500' },
  { label: 'Reportes',       href: '/dashboard/reports',        icon: BarChart3,   color: 'from-indigo-400 to-blue-500' },
]

// Bottom 5 for mobile nav
export const mobileNavItems = navItems.slice(0, 5)

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onCollapse?: (val: boolean) => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname()

  const NavContent = () => (
    <>
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-neomorphic-primary/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-neomorphic-secondary/20 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-6">
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg"
          whileHover={{ rotate: 15, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                Ps<span className="text-rose-500">Cielo</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Sistema de gestión
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button - only on mobile drawer */}
        {onMobileClose && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMobileClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 lg:hidden"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link key={item.href} href={item.href} onClick={onMobileClose}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3 transition-all duration-200',
                  collapsed ? 'justify-center py-3' : 'py-2.5',
                  isActive
                    ? 'bg-white/80 dark:bg-slate-800/80 shadow-neomorphic-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50',
                )}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-rose-400 to-pink-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}

                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                  isActive
                    ? `bg-gradient-to-br ${item.color} shadow-sm`
                    : 'bg-transparent group-hover:bg-white/60 dark:group-hover:bg-slate-700/50',
                )}>
                  <item.icon className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300',
                  )} />
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'text-sm font-medium whitespace-nowrap',
                        isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400',
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="relative z-10 border-t border-white/30 dark:border-slate-700/30 px-3 pb-4 pt-3 space-y-1">
        <Link href="/dashboard/settings" onClick={onMobileClose}>
          <div className={cn(
            'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-400',
            'transition-all hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-600',
            collapsed && 'justify-center',
          )}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center">
              <Settings className="h-[18px] w-[18px]" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm font-medium">
                  Configuración
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/'
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-400',
            'transition-all hover:bg-red-50/60 dark:hover:bg-red-900/20 hover:text-red-500',
            collapsed && 'justify-center',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <LogOut className="h-[18px] w-[18px]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-medium">
                Salir
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative hidden lg:flex h-screen flex-col border-r border-white/30 dark:border-slate-700/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shrink-0"
      >
        <NavContent />

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onCollapse?.(!collapsed)}
          className="absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-neomorphic-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </motion.div>
        </motion.button>
      </motion.aside>

      {/* ─── MOBILE DRAWER ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/30 dark:border-slate-700/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl lg:hidden shadow-2xl"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
