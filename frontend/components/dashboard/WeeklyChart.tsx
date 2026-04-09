'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DayData {
  label: string
  sessions: number
  revenue: number
}

// Demo data
const weekData: DayData[] = [
  { label: 'Lun', sessions: 8, revenue: 120000 },
  { label: 'Mar', sessions: 6, revenue: 90000 },
  { label: 'Mié', sessions: 10, revenue: 150000 },
  { label: 'Jue', sessions: 7, revenue: 105000 },
  { label: 'Vie', sessions: 9, revenue: 135000 },
]

const maxSessions = Math.max(...weekData.map((d) => d.sessions))

export default function WeeklyChart() {
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [metric, setMetric] = useState<'sessions' | 'revenue'>('sessions')

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-neomorphic backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-700">Esta Semana</h3>
        <div className="flex gap-1 rounded-xl bg-neomorphic-light-shade p-1">
          <button
            onClick={() => setMetric('sessions')}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-all',
              metric === 'sessions'
                ? 'bg-white text-slate-700 shadow-neomorphic-sm'
                : 'text-slate-400 hover:text-slate-600',
            )}
          >
            Sesiones
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-all',
              metric === 'revenue'
                ? 'bg-white text-slate-700 shadow-neomorphic-sm'
                : 'text-slate-400 hover:text-slate-600',
            )}
          >
            Ingresos
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-3 h-48">
        {weekData.map((day, i) => {
          const val = metric === 'sessions' ? day.sessions : day.revenue
          const maxVal = metric === 'sessions'
            ? maxSessions
            : Math.max(...weekData.map((d) => d.revenue))
          const height = (val / maxVal) * 100

          return (
            <div
              key={day.label}
              className="flex flex-1 flex-col items-center gap-2"
              onMouseEnter={() => setActiveDay(i)}
              onMouseLeave={() => setActiveDay(null)}
            >
              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: activeDay === i ? 1 : 0,
                  y: activeDay === i ? 0 : 5,
                }}
                className="rounded-lg bg-slate-700 px-2 py-1 text-[10px] font-semibold text-white"
              >
                {metric === 'sessions'
                  ? `${val} sesiones`
                  : `$${(val / 1000).toFixed(0)}k`
                }
              </motion.div>

              {/* Bar */}
              <div className="relative w-full flex-1 flex items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                  className={cn(
                    'w-full max-w-[44px] rounded-xl transition-all duration-200 cursor-pointer',
                    activeDay === i
                      ? 'bg-gradient-to-t from-neomorphic-primary-dark to-neomorphic-primary shadow-[0_4px_15px_rgba(255,179,204,0.5)]'
                      : 'bg-gradient-to-t from-neomorphic-primary/60 to-neomorphic-primary/30',
                  )}
                />
              </div>

              {/* Label */}
              <span className={cn(
                'text-xs font-medium transition-colors',
                activeDay === i ? 'text-slate-700' : 'text-slate-400',
              )}>
                {day.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-pastel-blue/20 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total sesiones</p>
          <p className="text-lg font-bold text-slate-700">
            {weekData.reduce((a, d) => a + d.sessions, 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-pastel-green/20 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total ingresos</p>
          <p className="text-lg font-bold text-slate-700">
            ${(weekData.reduce((a, d) => a + d.revenue, 0) / 1000).toFixed(0)}k
          </p>
        </div>
      </div>
    </div>
  )
}
