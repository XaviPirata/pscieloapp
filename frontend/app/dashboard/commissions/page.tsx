'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, ChevronLeft, ChevronRight,
  Loader2, AlertTriangle, CheckCircle2, Calendar,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuBadge from '@/components/neumorphism/Badge'
import StatCard from '@/components/dashboard/StatCard'
import api from '@/lib/api'

interface Professional {
  id: string
  user_name: string | null
  user_email: string | null
  commission_percentage: number
  hourly_rate: number
  is_active: boolean
}

interface SessionItem {
  id: string
  professional_id: string
  status: string
  amount: number
  scheduled_at: string
  professional_name: string | null
  patient_name: string | null
}

interface ProfCommission {
  professional: Professional
  totalSessions: number
  attendedSessions: number
  noShowSessions: number
  cancelledSessions: number
  totalRevenue: number
  commissionAmount: number
  commissionPct: number
  netForCenter: number
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

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
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
  const [expandedProf, setExpandedProf] = useState<string | null>(null)
  const [profSessions, setProfSessions] = useState<SessionItem[]>([])

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
      setProfSessions(sessions)

      const result: ProfCommission[] = professionals
        .filter(p => p.is_active)
        .map(prof => {
          const ps = sessions.filter(s => s.professional_id === prof.id)
          const attended = ps.filter(s => s.status === 'ATTENDED')
          const noShow = ps.filter(s => s.status === 'NO_SHOW')
          const cancelled = ps.filter(s => s.status === 'CANCELLED')
          const totalRevenue = attended.reduce((sum, s) => sum + (s.amount || 0), 0)
          const commissionPct = prof.commission_percentage
          const commissionAmount = Math.round(totalRevenue * commissionPct / 100)

          return {
            professional: prof,
            totalSessions: ps.filter(s => s.status !== 'CANCELLED').length,
            attendedSessions: attended.length,
            noShowSessions: noShow.length,
            cancelledSessions: cancelled.length,
            totalRevenue,
            commissionAmount,
            commissionPct,
            netForCenter: totalRevenue - commissionAmount,
          }
        })
        .sort((a, b) => b.totalRevenue - a.totalRevenue)

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

  const prevWeek = () => { setWeekStart(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000)); setExpandedProf(null) }
  const nextWeek = () => { setWeekStart(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000)); setExpandedProf(null) }
  const goToday = () => { setWeekStart(getMonday(new Date())); setExpandedProf(null) }

  const totalRevenue = commissions.reduce((sum, c) => sum + c.totalRevenue, 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const totalAttended = commissions.reduce((sum, c) => sum + c.attendedSessions, 0)
  const totalNet = totalRevenue - totalCommissions

  const weekLabel = `${formatDateShort(weekStart)} — ${formatDateShort(weekEnd)}`

  // Get sessions for expanded professional
  const expandedSessions = expandedProf
    ? profSessions
        .filter(s => s.professional_id === expandedProf && s.status !== 'CANCELLED')
        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    : []

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Comisiones" subtitle="Liquidación semanal por profesional" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Week nav */}
        <div className="flex items-center justify-center gap-3">
          <NeuButton variant="ghost" size="sm" icon={<ChevronLeft className="h-4 w-4" />} onClick={prevWeek} />
          <NeuButton variant="ghost" size="sm" onClick={goToday}>Hoy</NeuButton>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[150px] text-center">
            {weekLabel}
          </span>
          <NeuButton variant="ghost" size="sm" icon={<ChevronRight className="h-4 w-4" />} onClick={nextWeek} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Facturado" value={totalRevenue} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="blue" delay={0} />
          <StatCard title="Comisiones" value={totalCommissions} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="purple" delay={100} />
          <StatCard title="Neto Centro" value={totalNet} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="green" delay={200} />
          <StatCard title="Sesiones" value={totalAttended} icon={<CheckCircle2 className="h-5 w-5" />} color="rose" delay={300} />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchData} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Commission table */}
        {!loading && commissions.length > 0 && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {/* Desktop header */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="col-span-3">Profesional</div>
              <div className="col-span-1 text-center">Sesiones</div>
              <div className="col-span-1 text-center">Asistieron</div>
              <div className="col-span-1 text-center">% Com.</div>
              <div className="col-span-2 text-right">Facturado</div>
              <div className="col-span-2 text-right">Comisión a pagar</div>
              <div className="col-span-2 text-right">Neto centro</div>
            </div>

            {commissions.map((c) => {
              const isExpanded = expandedProf === c.professional.id
              return (
                <motion.div key={c.professional.id} variants={item}>
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedProf(isExpanded ? null : c.professional.id)}
                    className="w-full rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm backdrop-blur-sm p-4 sm:p-5 dark:border dark:border-white/[0.05] text-left transition-all hover:shadow-neomorphic"
                  >
                    {/* Mobile layout */}
                    <div className="lg:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/40 text-sm font-bold text-slate-600 dark:text-slate-200">
                            {(c.professional.user_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {c.professional.user_name || c.professional.user_email || 'Profesional'}
                            </h3>
                            <p className="text-xs text-slate-400">{c.commissionPct}% comisión</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatARS(c.commissionAmount)}</p>
                          <p className="text-[10px] text-slate-400">a pagar</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.attendedSessions}/{c.totalSessions}</p>
                          <p className="text-[10px] text-slate-400">Sesiones</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatARS(c.totalRevenue)}</p>
                          <p className="text-[10px] text-slate-400">Facturado</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatARS(c.netForCenter)}</p>
                          <p className="text-[10px] text-slate-400">Neto centro</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/40 text-sm font-bold text-slate-600 dark:text-slate-200">
                          {(c.professional.user_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {c.professional.user_name || c.professional.user_email || 'Profesional'}
                          </p>
                          <p className="text-xs text-slate-400">{formatARS(c.professional.hourly_rate)}/sesión</p>
                        </div>
                      </div>
                      <div className="col-span-1 text-center">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.totalSessions}</p>
                      </div>
                      <div className="col-span-1 text-center">
                        <NeuBadge variant={c.attendedSessions > 0 ? 'green' : 'gray'} size="sm">
                          {c.attendedSessions}
                        </NeuBadge>
                      </div>
                      <div className="col-span-1 text-center">
                        <NeuBadge variant="purple" size="sm">{c.commissionPct}%</NeuBadge>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatARS(c.totalRevenue)}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatARS(c.commissionAmount)}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatARS(c.netForCenter)}</p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && expandedSessions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-4 sm:ml-8 mt-1 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-500">Detalle de sesiones</p>
                      </div>
                      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {expandedSessions.map(s => {
                          const dt = new Date(s.scheduled_at)
                          const dayStr = dt.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
                          const timeStr = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
                          const statusLabel = s.status === 'ATTENDED' ? 'Atendida' : s.status === 'NO_SHOW' ? 'No asistió' : s.status === 'SCHEDULED' ? 'Programada' : s.status === 'CONFIRMED' ? 'Confirmada' : s.status
                          const statusColor = s.status === 'ATTENDED' ? 'green' : s.status === 'NO_SHOW' ? 'red' : 'blue'
                          return (
                            <div key={s.id} className="flex items-center justify-between px-4 py-2 text-xs">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-400 w-24">{dayStr} {timeStr}</span>
                                <span className="text-slate-700 dark:text-slate-200 font-medium">{s.patient_name || '—'}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <NeuBadge variant={statusColor as any} size="sm">{statusLabel}</NeuBadge>
                                <span className="font-semibold text-slate-700 dark:text-slate-200 w-20 text-right">
                                  {s.status === 'ATTENDED' ? formatARS(s.amount || 0) : '—'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {!loading && !error && commissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No hay sesiones para esta semana</p>
          </div>
        )}

        {/* Totals footer */}
        {!loading && commissions.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3">
              Resumen semanal — {weekLabel}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Sesiones atendidas</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{totalAttended}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total facturado</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{formatARS(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total comisiones a pagar</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatARS(totalCommissions)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Neto para el centro</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatARS(totalNet)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
