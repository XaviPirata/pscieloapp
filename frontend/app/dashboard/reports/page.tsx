'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Heart, DollarSign, Calendar,
  TrendingUp, Loader2, AlertTriangle,
  CheckCircle2, XCircle, Clock,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/dashboard/StatCard'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

interface ReportData {
  totalPatients: number
  activePatients: number
  inactivePatients: number
  totalProfessionals: number
  totalRooms: number
  totalSessionsMonth: number
  attendedMonth: number
  cancelledMonth: number
  noShowMonth: number
  revenueMonth: number
  topProfessionals: { name: string; attended: number; revenue: number }[]
  referralBreakdown: { source: string; count: number }[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const dateFrom = monthStart.toISOString().split('T')[0]
        const dateTo = monthEnd.toISOString().split('T')[0]

        const [patientsRes, profsRes, roomsRes, sessionsRes] = await Promise.all([
          api.get('/patients', { params: { page_size: '1' } }),
          api.get('/professionals', { params: { page_size: '50' } }),
          api.get('/rooms'),
          api.get('/sessions', { params: { date_from: dateFrom, date_to: dateTo, page_size: '500' } }),
        ])

        // Patients stats
        const totalPatients = patientsRes.data.total || 0
        // Fetch active count
        const activePatientsRes = await api.get('/patients', { params: { page_size: '1', is_active: true } })
        const activePatients = activePatientsRes.data.total || 0

        // Professionals
        const professionals = profsRes.data.items || []
        const totalProfessionals = professionals.filter((p: any) => p.is_active).length

        // Rooms
        const totalRooms = (roomsRes.data || []).length

        // Sessions
        const sessions = sessionsRes.data.items || []
        const attended = sessions.filter((s: any) => s.status === 'ATTENDED')
        const cancelled = sessions.filter((s: any) => s.status === 'CANCELLED')
        const noShow = sessions.filter((s: any) => s.status === 'NO_SHOW')
        const revenueMonth = attended.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

        // Top professionals by attended
        const profMap = new Map<string, { name: string; attended: number; revenue: number }>()
        attended.forEach((s: any) => {
          const existing = profMap.get(s.professional_id) || { name: s.professional_name || '?', attended: 0, revenue: 0 }
          existing.attended++
          existing.revenue += s.amount || 0
          profMap.set(s.professional_id, existing)
        })
        const topProfessionals = Array.from(profMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        // Referral breakdown - get all patients
        const allPatientsRes = await api.get('/patients', { params: { page_size: '200' } })
        const allPatients = allPatientsRes.data.items || []
        const refMap = new Map<string, number>()
        allPatients.forEach((p: any) => {
          const src = p.referral_source || 'Sin especificar'
          refMap.set(src, (refMap.get(src) || 0) + 1)
        })
        const referralBreakdown = Array.from(refMap.entries())
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)

        setData({
          totalPatients,
          activePatients,
          inactivePatients: totalPatients - activePatients,
          totalProfessionals,
          totalRooms,
          totalSessionsMonth: sessions.filter((s: any) => s.status !== 'CANCELLED').length,
          attendedMonth: attended.length,
          cancelledMonth: cancelled.length,
          noShowMonth: noShow.length,
          revenueMonth,
          topProfessionals,
          referralBreakdown,
        })
      } catch {
        setError('Error cargando reportes')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const monthLabel = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Reportes" subtitle={`Resumen de ${monthLabel}`} />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => window.location.reload()} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {data && !loading && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Main stats */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <StatCard title="Pacientes Activos" value={data.activePatients} icon={<Heart className="h-5 w-5" />} color="rose" delay={0} />
              <StatCard title="Profesionales" value={data.totalProfessionals} icon={<Users className="h-5 w-5" />} color="purple" delay={100} />
              <StatCard title="Sesiones Mes" value={data.totalSessionsMonth} icon={<Calendar className="h-5 w-5" />} color="blue" delay={200} />
              <StatCard title="Ingresos Mes" value={data.revenueMonth} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="green" delay={300} />
            </motion.div>

            {/* Session breakdown */}
            <motion.div variants={item} className="rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm p-5 dark:border dark:border-white/[0.05]">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-4">
                Sesiones del Mes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950/20 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.attendedMonth}</p>
                    <p className="text-xs text-slate-400">Atendidas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.cancelledMonth}</p>
                    <p className="text-xs text-slate-400">Canceladas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.noShowMonth}</p>
                    <p className="text-xs text-slate-400">No asistieron</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      {data.totalSessionsMonth > 0 ? Math.round(data.attendedMonth / data.totalSessionsMonth * 100) : 0}%
                    </p>
                    <p className="text-xs text-slate-400">Tasa asistencia</p>
                  </div>
                </div>
              </div>

              {/* Attendance bar */}
              {data.totalSessionsMonth > 0 && (
                <div className="mt-4">
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="h-full bg-green-400 dark:bg-green-500 transition-all"
                      style={{ width: `${(data.attendedMonth / data.totalSessionsMonth) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400 dark:bg-amber-500 transition-all"
                      style={{ width: `${(data.noShowMonth / data.totalSessionsMonth) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-400 dark:bg-red-500 transition-all"
                      style={{ width: `${(data.cancelledMonth / data.totalSessionsMonth) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" />Atendidas</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />No asistieron</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Canceladas</span>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top professionals */}
              <motion.div variants={item} className="rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm p-5 dark:border dark:border-white/[0.05]">
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-4">
                  Top Profesionales
                </h3>
                {data.topProfessionals.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Sin datos este mes</p>
                ) : (
                  <div className="space-y-3">
                    {data.topProfessionals.map((prof, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                          i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                          'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
                        )}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{prof.name}</p>
                          <p className="text-xs text-slate-400">{prof.attended} sesiones atendidas</p>
                        </div>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">
                          {formatARS(prof.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Referral sources */}
              <motion.div variants={item} className="rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm p-5 dark:border dark:border-white/[0.05]">
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-4">
                  Origen de Pacientes
                </h3>
                {data.referralBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Sin datos</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.referralBreakdown.map((ref) => {
                      const pct = data.totalPatients > 0 ? Math.round(ref.count / data.totalPatients * 100) : 0
                      return (
                        <div key={ref.source}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-300">{ref.source}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{ref.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Summary footer */}
            <motion.div variants={item} className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/20 border border-purple-200/50 dark:border-purple-800/30 p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Resumen General</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">{monthLabel}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Pacientes</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.totalPatients}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Consultorios</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.totalRooms}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Ingresos</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatARS(data.revenueMonth)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
