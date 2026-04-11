'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useTheme } from '@/components/ThemeProvider'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { theme, toggle } = useTheme()

  // TODO: Replace with actual user data from auth context
  const userName = 'Admin PsCielo'

  return (
    <header className="flex items-center justify-between px-8 py-4">
      {/* Left - Page title */}
      <div>
        {title && (
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-slate-700 dark:text-slate-200"
          >
            {title}
          </motion.h2>
        )}
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>
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
              'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm text-slate-400 dark:text-slate-500',
              'transition-colors hover:text-slate-600 dark:hover:text-slate-300',
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
                className="absolute inset-0 rounded-2xl bg-white/70 dark:bg-slate-800/70 pl-11 pr-4 text-sm text-slate-600 dark:text-slate-300 shadow-neomorphic-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:shadow-neomorphic"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dark mode toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={cn(
            'relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl',
            'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm',
            'text-slate-400 dark:text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-yellow-400',
          )}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-[18px] w-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-[18px] w-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn(
              'relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl',
              'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm text-slate-400 dark:text-slate-500',
              'transition-colors hover:text-slate-600 dark:hover:text-slate-300',
            )}
          >
            <Bell className="h-[18px] w-[18px]" />
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
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white/95 dark:bg-slate-800/95 p-4 shadow-neomorphic-lg backdrop-blur-xl z-50"
              >
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Notificaciones</p>
                <div className="space-y-2">
                  <div className="rounded-xl bg-pastel-blue/30 dark:bg-blue-900/20 p-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Nueva sesión programada</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Hace 5 minutos</p>
                  </div>
                  <div className="rounded-xl bg-pastel-green/30 dark:bg-green-900/20 p-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Comisión semanal calculada</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Hace 1 hora</p>
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
              'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm',
              'transition-all hover:shadow-neomorphic',
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary to-neomorphic-secondary text-xs font-bold text-white">
              {getInitials(userName)}
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">{userName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/95 dark:bg-slate-800/95 p-2 shadow-neomorphic-lg backdrop-blur-xl z-50"
              >
                <DropLink href="/dashboard/profile" label="Mi perfil" />
                <DropLink href="/dashboard/settings" label="Configuración" />
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/'
                  }}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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

function DropLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
    >
      {label}
    </a>
  )
}
