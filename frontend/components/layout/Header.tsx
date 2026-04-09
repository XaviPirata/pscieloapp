'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGreeting, getInitials } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // TODO: Replace with actual user data from auth context
  const userName = 'Admin PsCielo'

  return (
    <header className="flex items-center justify-between px-8 py-4">
      {/* Left - Page title */}
      <div>
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-slate-700"
        >
          {title || getGreeting()}
        </motion.h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.div
          animate={{ width: searchOpen ? 280 : 42 }}
          className="relative overflow-hidden"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className={cn(
              'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl',
              'bg-white/70 shadow-neomorphic-sm text-slate-400',
              'transition-colors hover:text-slate-600',
            )}
          >
            <Search className="h-[18px] w-[18px]" />
          </motion.button>
          <AnimatePresence>
            {searchOpen && (
              <motion.input
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="Buscar pacientes, sesiones..."
                className="absolute inset-0 rounded-2xl bg-white/70 pl-11 pr-4 text-sm text-slate-600 shadow-neomorphic-sm outline-none placeholder:text-slate-300 focus:bg-white focus:shadow-neomorphic"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn(
              'relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl',
              'bg-white/70 shadow-neomorphic-sm text-slate-400',
              'transition-colors hover:text-slate-600',
            )}
          >
            <Bell className="h-[18px] w-[18px]" />
            {/* Notification dot */}
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neomorphic-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neomorphic-primary-dark" />
            </span>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white/95 p-4 shadow-neomorphic-lg backdrop-blur-xl"
              >
                <p className="mb-3 text-sm font-semibold text-slate-700">Notificaciones</p>
                <div className="space-y-2">
                  <div className="rounded-xl bg-pastel-blue/30 p-3">
                    <p className="text-xs font-medium text-slate-600">Nueva sesión programada</p>
                    <p className="text-[10px] text-slate-400">Hace 5 minutos</p>
                  </div>
                  <div className="rounded-xl bg-pastel-green/30 p-3">
                    <p className="text-xs font-medium text-slate-600">Comisión semanal calculada</p>
                    <p className="text-[10px] text-slate-400">Hace 1 hora</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              'flex items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3',
              'bg-white/70 shadow-neomorphic-sm',
              'transition-all hover:shadow-neomorphic',
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary to-neomorphic-secondary text-xs font-bold text-white">
              {getInitials(userName)}
            </div>
            <span className="text-sm font-medium text-slate-600 hidden sm:block">{userName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/95 p-2 shadow-neomorphic-lg backdrop-blur-xl"
              >
                <Link href="/dashboard/profile" label="Mi perfil" />
                <Link href="/dashboard/settings" label="Configuración" />
                <div className="my-1 h-px bg-slate-100" />
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/'
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function Link({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
    >
      {label}
    </a>
  )
}
