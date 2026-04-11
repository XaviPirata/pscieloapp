'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import NeuBadge from '@/components/neumorphism/Badge'

interface UpcomingSession {
  id: string
  patient: string
  professional: string
  time: string
  room: string
  status: 'confirmed' | 'pending'
}

const sessions: UpcomingSession[] = [
  { id: '1', patient: 'Federico M.', professional: 'Andrea', time: '14:30', room: 'C2', status: 'confirmed' },
  { id: '2', patient: 'Ismael R.', professional: 'Andrea', time: '15:30', room: 'C2', status: 'confirmed' },
  { id: '3', patient: 'Vicky L.', professional: 'Yamila', time: '16:00', room: 'C1', status: 'pending' },
  { id: '4', patient: 'Sofía P.', professional: 'Andrea', time: '17:30', room: 'C3', status: 'confirmed' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export default function UpcomingSessions() {
  return (
    <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Próximas Sesiones</h3>
        <NeuBadge variant="blue" size="md">Hoy</NeuBadge>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            variants={item}
            whileHover={{ scale: 1.01, x: 3 }}
            className={cn(
              'group relative flex items-center gap-4 rounded-2xl p-3.5',
              'bg-gradient-to-r transition-all duration-200 cursor-pointer',
              i === 0
                ? 'from-neomorphic-primary/15 to-transparent border border-neomorphic-primary/20'
                : 'from-transparent to-transparent hover:from-slate-50/60 dark:hover:from-slate-700/30',
            )}
          >
            {/* Time badge */}
            <div className={cn(
              'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl',
              i === 0
                ? 'bg-gradient-to-br from-neomorphic-primary to-neomorphic-primary-dark shadow-elevate-2'
                : 'bg-neomorphic-light-shade dark:bg-slate-700/50',
            )}>
              <Clock className={cn('h-3.5 w-3.5 mb-0.5', i === 0 ? 'text-white/80' : 'text-slate-400')} />
              <span className={cn(
                'text-sm font-bold',
                i === 0 ? 'text-white' : 'text-slate-600',
              )}>
                {session.time}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{session.patient}</p>
                {session.status === 'pending' && (
                  <NeuBadge variant="yellow" size="sm">Pendiente</NeuBadge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {session.professional}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.room}
                </span>
              </div>
            </div>

            {/* Arrow on hover */}
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
