'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, Heart, Calendar, Building2,
  DollarSign, BarChart3, Settings, LogOut,
  ChevronLeft, Sparkles, Moon, Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Inicio', href: '/dashboard', icon: Home },
  { label: 'Profesionales', href: '/dashboard/professionals', icon: Users },
  { label: 'Pacientes', href: '/dashboard/patients', icon: Heart },
  { label: 'Sesiones', href: '/dashboard/sessions', icon: Calendar },
  { label: 'Consultorios', href: '/dashboard/rooms', icon: Building2 },
  { label: 'Comisiones', href: '/dashboard/commissions', icon: DollarSign },
  { label: 'Reportes', href: '/dashboard/reports', icon: BarChart3 },
]

const bottomItems = [
  { label: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex h-screen flex-col border-r border-white/30 bg-white/40 backdrop-blur-2xl"
    >
      {/* Ambient gradient behind sidebar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-3xl">
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-neomorphic-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-neomorphic-secondary/20 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-6">
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neomorphic-primary to-neomorphic-primary-dark shadow-neomorphic-sm"
          whileHover={{ rotate: 15 }}
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
              <h1 className="text-xl font-bold text-slate-700">
                Ps<span className="text-neomorphic-primary-dark">Cielo</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Sistema de gestión
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center',
          'rounded-full bg-white shadow-neomorphic-sm text-slate-400',
          'transition-colors hover:text-slate-600',
        )}
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </motion.div>
      </motion.button>

      {/* Navigation */}
      <nav className="relative z-10 mt-2 flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200',
                  isActive
                    ? 'bg-white/80 shadow-neomorphic-sm text-slate-700'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-700',
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-neomorphic-primary to-neomorphic-primary-dark"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}

                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-br from-neomorphic-primary/50 to-neomorphic-primary/30'
                      : 'bg-transparent group-hover:bg-neomorphic-light-shade',
                  )}
                >
                  <item.icon className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600',
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
                        isActive ? 'text-slate-700' : 'text-slate-500',
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

      {/* Bottom section */}
      <div className="relative z-10 border-t border-white/30 px-3 pb-4 pt-3 space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-400 transition-all hover:bg-white/40 hover:text-slate-600">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                <item.icon className="h-[18px] w-[18px]" />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/'
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-400 transition-all hover:bg-red-50/60 hover:text-red-500"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <LogOut className="h-[18px] w-[18px]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Salir
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
