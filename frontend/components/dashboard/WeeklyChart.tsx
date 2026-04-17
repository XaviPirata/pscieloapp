'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface DayData {
  label: string
  sessions: number
  revenue: number
}

export default function WeeklyChart() {
  const [weekData, setWeekData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [metric, setMetric] = useState<'sessions' | 'revenue'>('sessions')

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        // Get current week Mon-Fri
        const now = new Date()
        const dayOfWeek = now.getDay()
        const monday = new Date(now)
        monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
        monday.setHours(0, 0, 0, 0)

        const friday = new Date(monday)
        friday.setDate(monday.getDate() + 4)

        const res = await api.get('/sessions', {
          params: {
            date_from: monday.toISOString().split('T')[0],
            date_to: friday.toISOString().split('T')[0],
            page_size: '200',
          },
        })

        const sessions = (res.data.items || []).filter((s: any) => s.status !== 'CANCELLED')
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

        const data: DayData[] = labels.map((label, i) => {
          const dayDate = new Date(monday)
          dayDate.setDate(monday.getDate() + i)
          const dayStr = dayDate.toISOString().split('T')[0]

          const daySessions = sessions.filter((s: any) => s.scheduled_at.startsWith(dayStr))
          const revenue = daySessions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

          return { label, sessions: daySessions.length, revenue }
        })

        setWeekData(data)
      } catch {
        setWeekData([
          { label: 'Lun', sessions: 0, revenue: 0 },
          { label: 'Mar', sessions: 0, revenue: 0 },
          { label: 'Mié', sessions: 0, revenue: 0 },
          { label: 'Jue', sessions: 0, revenue: 0 },
          { label: 'Vie', sessions: 0, revenue: 0 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchWeekData()
  }, [])

  const maxSessions = Math.max(...weekData.map(d => d.sessions), 1)
  const maxRevenue = Math.max(...weekData.map(d => d.revenue), 1)

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Esta Semana</h3>
        <div className="flex gap-1 rounded-xl bg-neomorphic-light-shade dark:bg-slate-700/50 p-1">
          <button
            onClick={() => setMetric('sessions')}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-all',
              metric === 'sessions'
                ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-neomorphic-sm'
                : 'text-slate-400 dark:text-slate-500',
            )}
          >
            Sesiones
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-all',
              metric === 'revenue'
                ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-neomorphic-sm'
                : 'text-slate-400 dark:text-slate-500',
            )}
          >
            Ingresos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3 h-48">
            {weekData.map((day, i) => {
              const val = metric === 'sessions' ? day.sessions : day.revenue
              const maxVal = metric === 'sessions' ? maxSessions : maxRevenue
              const height = maxVal > 0 ? (val / maxVal) * 100 : 0

              return (
                <div
                  key={day.label}
                  className="flex flex-1 flex-col items-center gap-2"
                  onMouseEnter={() => setActiveDay(i)}
                  onMouseLeave={() => setActiveDay(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: activeDay === i ? 1 : 0, y: activeDay === i ? 0 : 5 }}
                    className="rounded-lg bg-slate-700 px-2 py-1 text-[10px] font-semibold text-white"
                  >
                    {metric === 'sessions' ? `${val} sesiones` : `$${(val / 1000).toFixed(0)}k`}
                  </motion.div>

                  <div className="relative w-full flex-1 flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                      className={cn(
                        'w-full max-w-[44px] rounded-xl transition-all duration-200 cursor-pointer',
                        activeDay === i
                          ? 'bg-gradient-to-t from-neomorphic-primary-dark to-neomorphic-primary dark:from-pink-500 dark:to-pink-400 shadow-[0_4px_15px_rgba(255,179,204,0.5)]'
                          : 'bg-gradient-to-t from-neomorphic-primary/80 to-neomorphic-primary/50 dark:from-pink-500/70 dark:to-pink-400/50',
                      )}
                    />
                  </div>

                  <span className={cn(
                    'text-xs font-medium transition-colors',
                    activeDay === i ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500',
                  )}>
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-pastel-blue/20 dark:bg-blue-900/20 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Total sesiones</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                {weekData.reduce((a, d) => a + d.sessions, 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-pastel-green/20 dark:bg-green-900/20 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Total ingresos</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                ${(weekData.reduce((a, d) => a + d.revenue, 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
