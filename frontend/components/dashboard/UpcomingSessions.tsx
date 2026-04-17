'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import NeuBadge from '@/components/neumorphism/Badge'
import api from '@/lib/api'

interface UpcomingSession {
  id: string
  patient_name: string | null
  professional_name: string | null
  time: string
  room_name: string | null
  status: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export default function UpcomingSessions() {
  const [sessions, setSessions] = useState<UpcomingSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await api.get('/sessions', {
          params: { date_from: today, date_to: today, page_size: '10' },
        })
        const items = (res.data.items || [])
          .filter((s: any) => s.status !== 'CANCELLED')
          .map((s: any) => {
            const d = new Date(s.scheduled_at)
            return {
              id: s.id,
              patient_name: s.patient_name,
              professional_name: s.professional_name,
              time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
              room_name: s.room_name,
              status: s.status,
            }
          })
          .sort((a: UpcomingSession, b: UpcomingSession) => a.time.localeCompare(b.time))
        setSessions(items)
      } catch {
        // use empty
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Próximas Sesiones</h3>
        <NeuBadge variant="blue" size="md">Hoy</NeuBadge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
          No hay sesiones programadas para hoy
        </p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
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
              <div className={cn(
                'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl',
                i === 0
                  ? 'bg-gradient-to-br from-neomorphic-primary to-neomorphic-primary-dark shadow-elevate-2'
                  : 'bg-neomorphic-light-shade dark:bg-slate-700/50',
              )}>
                <Clock className={cn('h-3.5 w-3.5 mb-0.5', i === 0 ? 'text-white/80' : 'text-slate-400')} />
                <span className={cn('text-sm font-bold', i === 0 ? 'text-white' : 'text-slate-600')}>
                  {session.time}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {session.patient_name || 'Paciente'}
                  </p>
                  {session.status === 'SCHEDULED' && (
                    <NeuBadge variant="yellow" size="sm">Pendiente</NeuBadge>
                  )}
                  {session.status === 'CONFIRMED' && (
                    <NeuBadge variant="green" size="sm">Confirmada</NeuBadge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {session.professional_name || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.room_name || '—'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
