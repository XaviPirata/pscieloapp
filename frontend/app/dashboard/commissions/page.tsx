'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, ChevronLeft, ChevronRight,
  Loader2, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuBadge from '@/components/neumorphism/Badge'
import StatCard from '@/components/dashboard/StatCard'
import api from '@/lib/api'

interface Professional {
  id: string
  user_id: string
  user_name: string | null
  user_email: string | null
  commission_percentage: number
  hourly_rate: number
  is_active: boolean
}

interface SessionItem {
  id: string
  professional_id: string
  patient_id: string
  status: string
  amount: number
  scheduled_at: string
  professional_name: string | null
  patient_name: string | null
}

interface ProfCommission {
  professional: Professional
  sessions: SessionItem[]
  totalSessions: number
  attendedSessions: number
  totalRevenue: number
  commissionAmount: number
  commissionPct: number
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function CommissionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()))
  const [commissions, setCommissions] = useState<ProfCommission[]>([])

  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const [profsRes, sessionsRes] = await Promise.all([
        api.get('/professionals', { params: { page_size: '50' } }),
        api.get('/sessions', {
          params: {
            date_from: formatDateISO(weekStart),
            date_to: formatDateISO(endDate),
            page_size: '500',
          },
        }),
      ])

      const professionals: Professional[] = profsRes.data.items || []
      const sessions: SessionItem[] = sessionsRes.data.items || []

      const result: ProfCommission[] = professionals
        .filter(p => p.is_active)
        .map(prof => {
          const profSessions = sessions.filter(s => s.professional_id === prof.id)
          const attended = profSessions.filter(s => s.status === 'ATTENDED')
          const totalRevenue = attended.reduce((sum, s) => sum + (s.amount || 0), 0)
          const commissionPct = prof.commission_percentage
          const commissionAmount = Math.round(totalRevenue * commissionPct / 100)

          return {
            professional: prof,
            sessions: profSessions,
            totalSessions: profSessions.filter(s => s.status !== 'CANCELLED').length,
            attendedSessions: attended.length,
            totalRevenue,
            commissionAmount,
            commissionPct,
          }
        })
        .sort((a, b) => b.commissionAmount - a.commissionAmount)

      setCommissions(result)
    } catch {
      setError('Error cargando datos de comisiones')
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const prevWeek = () => setWeekStart(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000))
  const nextWeek = () => setWeekStart(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000))
  const goToday = () => setWeekStart(getMonday(new Date()))

  const totalRevenue = commissions.reduce((sum, c) => sum + c.totalRevenue, 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const totalAttended = commissions.reduce((sum, c) => sum + c.attendedSessions, 0)
  const totalSessions = commissions.reduce((sum, c) => sum + c.totalSessions, 0)

  const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1} — ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Comisiones" subtitle={`Semana ${weekLabel}`} />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Week nav */}
        <div className="flex items-center justify-center gap-3">
          <NeuButton variant="ghost" size="sm" icon={<ChevronLeft className="h-4 w-4" />} onClick={prevWeek} />
          <button onClick={goToday} className="text-xs text-blue-600 dark:text-blue-400 underline px-1">Hoy</button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
            {weekLabel}
          </span>
          <NeuButton variant="ghost" size="sm" icon={<ChevronRight className="h-4 w-4" />} onClick={nextWeek} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Ingresos Semana" value={totalRevenue} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="green" delay={0} />
          <StatCard title="Comisiones" value={totalCommissions} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="purple" delay={100} />
          <StatCard title="Sesiones Atendidas" value={totalAttended} icon={<CheckCircle2 className="h-5 w-5" />} color="blue" delay={200} />
          <StatCard title="Profesionales" value={commissions.length} icon={<Users className="h-5 w-5" />} color="rose" delay={300} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchData} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Commission cards */}
        {!loading && commissions.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {commissions.map((c) => (
              <motion.div
                key={c.professional.id}
                variants={item}
                className="rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm overflow-hidden dark:border dark:border-white/[0.05]"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Professional info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/40 text-sm font-bold text-slate-600 dark:text-slate-200">
                        {(c.professional.user_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {c.professional.user_name || c.professional.user_email || 'Profesional'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <NeuBadge variant="purple" size="sm">{c.commissionPct}% comisión</NeuBadge>
                          <span className="text-xs text-slate-400">{formatARS(c.professional.hourly_rate)}/sesión</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary numbers */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Sesiones</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {c.attendedSessions}/{c.totalSessions}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Facturado</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {formatARS(c.totalRevenue)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Comisión</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatARS(c.commissionAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {c.totalSessions > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Asistencia</span>
                        <span>{c.totalSessions > 0 ? Math.round(c.attendedSessions / c.totalSessions * 100) : 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                          style={{ width: `${c.totalSessions > 0 ? (c.attendedSessions / c.totalSessions * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && commissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <DollarSign className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No hay datos de comisiones para esta semana</p>
          </div>
        )}

        {/* Totals summary */}
        {!loading && commissions.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30 p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">Resumen Semanal</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {totalAttended} sesiones atendidas de {totalSessions} programadas
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total facturado</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{formatARS(totalRevenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total comisiones</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatARS(totalCommissions)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Neto centro</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatARS(totalRevenue - totalCommissions)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
