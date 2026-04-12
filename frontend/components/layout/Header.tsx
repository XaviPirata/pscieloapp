'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Moon, Sun, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useTheme } from '@/components/ThemeProvider'
import { useMobileMenu } from '@/app/dashboard/layout'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const { onOpen: openMobileMenu } = useMobileMenu()

  // TODO: Replace with actual user data from auth context
  const userName = 'Admin PsCielo'

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-4 py-3 lg:px-8 lg:py-4">
      {/* Hamburger — mobile only */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={openMobileMenu}
        className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm text-slate-500 dark:text-slate-400"
        aria-label="Abrir menú"
      >
        <Menu className="h-[18px] w-[18px]" />
      </motion.button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        {title && (
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="truncate text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 lg:text-2xl"
          >
            {title}
          </motion.h2>
        )}
        {subtitle && (
          <p className="truncate mt-0.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 lg:text-sm">{subtitle}</p>
        )}
      </div>

      {/* Right - Actions (compacto en mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        {/* Search — hidden on mobile */}
        <motion.div
          animate={{ width: searchOpen ? 220 : 38 }}
          className="relative hidden md:block overflow-hidden"
          style={{ minWidth: 38 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className={cn(
              'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-2xl',
              'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm text-slate-400 dark:text-slate-500',
              'transition-colors hover:text-slate-600 dark:hover:text-slate-300',
            )}
          >
            <Search className="h-[17px] w-[17px]" />
          </motion.button>
          <AnimatePresence>
            {searchOpen && (
              <motion.input
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="Buscar..."
                className="absolute inset-0 rounded-2xl bg-white/90 dark:bg-slate-800/90 pl-11 pr-4 text-sm text-slate-600 dark:text-slate-300 shadow-neomorphic-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:shadow-neomorphic"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dark mode toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className={cn(
            'relative flex h-8 w-8 sm:h-[38px] sm:w-[38px] items-center justify-center rounded-xl sm:rounded-2xl',
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
                <Sun className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications - hidden on very small screens */}
        <div className="relative hidden sm:block">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className={cn(
              'relative flex h-[38px] w-[38px] items-center justify-center rounded-2xl',
              'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm text-slate-400 dark:text-slate-500',
              'transition-colors hover:text-slate-600 dark:hover:text-slate-300',
            )}
          >
            <Bell className="h-[17px] w-[17px]" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neomorphic-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neomorphic-primary-dark" />
            </span>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
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
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile - compact on mobile */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className={cn(
              'flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl py-1 pl-1 pr-1.5 sm:py-1.5 sm:pl-1.5 sm:pr-3',
              'bg-white/70 dark:bg-slate-800/70 shadow-neomorphic-sm',
              'transition-all hover:shadow-neomorphic',
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-neomorphic-primary to-neomorphic-secondary text-[10px] sm:text-xs font-bold text-white">
              {getInitials(userName)}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300">{userName}</span>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
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
              </>
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
