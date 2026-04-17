'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle,
  Loader2, AlertTriangle,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import NeuInput from '@/components/neumorphism/Input'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

/* ─── Types ─── */

interface SessionItem {
  id: string
  professional_id: string
  patient_id: string
  room_id: string
  scheduled_at: string
  duration_minutes: number
  session_type: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW'
  amount: number
  professional_name: string | null
  patient_name: string | null
  room_name: string | null
}

interface SelectOption {
  id: string
  label: string
}

/* ─── Status config ─── */

const statusConfig: Record<string, { color: string; darkColor: string; label: string; badgeVariant: string }> = {
  SCHEDULED: { color: 'from-pastel-blue/70 to-pastel-blue/40 border-blue-200/40', darkColor: 'dark:from-blue-900/70 dark:to-blue-900/50 dark:border-blue-700/40', label: 'Programada', badgeVariant: 'blue' },
  CONFIRMED: { color: 'from-pastel-purple/70 to-pastel-purple/40 border-purple-200/40', darkColor: 'dark:from-purple-900/70 dark:to-purple-900/50 dark:border-purple-700/40', label: 'Confirmada', badgeVariant: 'purple' },
  ATTENDED: { color: 'from-pastel-green/70 to-pastel-green/40 border-green-200/40', darkColor: 'dark:from-green-900/70 dark:to-green-900/50 dark:border-green-700/40', label: 'Asistió', badgeVariant: 'green' },
  CANCELLED: { color: 'from-slate-100/60 to-slate-50/30 border-slate-200/40', darkColor: 'dark:from-slate-800/60 dark:to-slate-800/40 dark:border-slate-700/40', label: 'Cancelada', badgeVariant: 'gray' },
  NO_SHOW: { color: 'from-pastel-rose/70 to-pastel-rose/40 border-rose-200/40', darkColor: 'dark:from-rose-900/70 dark:to-rose-900/50 dark:border-rose-700/40', label: 'No asistió', badgeVariant: 'red' },
}

const sessionTypeLabels: Record<string, string> = {
  CONSULTATION: 'Consulta',
  FOLLOW_UP: 'Seguimiento',
  INITIAL: 'Primera vez',
  ASSESSMENT: 'Evaluación',
}

/* ─── Helpers ─── */

function getMondayOfWeek(d: Date): Date {
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

const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState<Date>(getMondayOfWeek(new Date()))
  const [showCreate, setShowCreate] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null)

  const weekEnd = new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000)

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const endDate = new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000)
      const res = await api.get('/sessions', {
        params: {
          date_from: formatDateISO(weekStart),
          date_to: formatDateISO(endDate),
          page_size: '100',
        },
      })
      setSessions(res.data.items || [])
    } catch {
      setError('Error cargando sesiones')
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const prevWeek = () => setWeekStart(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000))
  const nextWeek = () => setWeekStart(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000))
  const goToday = () => setWeekStart(getMondayOfWeek(new Date()))

  // Group sessions by day for mobile
  const sessionsByDay: Record<number, SessionItem[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] }
  sessions.forEach(s => {
    const d = new Date(s.scheduled_at)
    const dayOfWeek = (d.getDay() + 6) % 7 // Mon=0
    if (dayOfWeek >= 0 && dayOfWeek < 5) {
      sessionsByDay[dayOfWeek].push(s)
    }
  })
  // Sort by time within each day
  Object.values(sessionsByDay).forEach(arr => arr.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)))

  // Build grid data for desktop
  const getSessionsForSlot = (dayIndex: number, hour: string): SessionItem[] => {
    const dayDate = new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000)
    return sessions.filter(s => {
      const d = new Date(s.scheduled_at)
      return d.toDateString() === dayDate.toDateString() &&
        `${d.getHours().toString().padStart(2, '0')}:00` === hour
    })
  }

  const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1} — ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Sesiones" subtitle={`Semana ${weekLabel}`} />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <NeuButton variant="ghost" size="sm" icon={<ChevronLeft className="h-4 w-4" />} onClick={prevWeek} />
            <button onClick={goToday} className="text-xs text-blue-600 dark:text-blue-400 underline px-1">Hoy</button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-1">
              {weekLabel}
            </span>
            <NeuButton variant="ghost" size="sm" icon={<ChevronRight className="h-4 w-4" />} onClick={nextWeek} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className={cn('h-2.5 w-2.5 rounded-full bg-gradient-to-r', cfg.color)} />
                  {cfg.label}
                </span>
              ))}
            </div>
            <NeuButton variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
              Nueva Sesión
            </NeuButton>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchSessions} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && (
          <>
            {/* ─── MOBILE: Session list by day (< lg) ─── */}
            <div className="space-y-3 lg:hidden">
              {dayLabels.map((label, dayIdx) => {
                const daySessions = sessionsByDay[dayIdx]
                const dayDate = new Date(weekStart.getTime() + dayIdx * 24 * 60 * 60 * 1000)
                const dayStr = `${label} ${dayDate.getDate()}`

                return (
                  <div key={dayIdx}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                      {dayStr}
                    </p>
                    {daySessions.length === 0 ? (
                      <p className="text-xs text-slate-300 dark:text-slate-600 italic pl-2 mb-3">Sin sesiones</p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {daySessions.map((session) => {
                          const config = statusConfig[session.status] || statusConfig.SCHEDULED
                          const time = new Date(session.scheduled_at)
                          const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`

                          return (
                            <motion.button
                              key={session.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedSession(session)}
                              className={cn(
                                'w-full rounded-2xl border p-3 text-left transition-all bg-gradient-to-br',
                                config.color, config.darkColor,
                                session.status === 'CANCELLED' && 'opacity-60',
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                    {session.patient_name || 'Paciente'}
                                  </p>
                                </div>
                                <NeuBadge variant={config.badgeVariant as any} size="sm">
                                  {config.label}
                                </NeuBadge>
                              </div>
                              <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeStr}</span>
                                <span>{session.professional_name || '—'}</span>
                                <span>{session.room_name || '—'}</span>
                                <span className="text-slate-400">{sessionTypeLabels[session.session_type] || session.session_type}</span>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ─── DESKTOP: Calendar grid (>= lg) ─── */}
            <div className="hidden lg:block rounded-3xl bg-white/80 dark:bg-slate-900/80 dark:border dark:border-white/[0.05] shadow-neomorphic backdrop-blur-sm overflow-x-auto scrollbar-hide">
              <div className="min-w-[600px]">
                {/* Days header */}
                <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-100 dark:border-slate-800">
                  <div className="p-3" />
                  {dayLabels.map((label, i) => {
                    const dayDate = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
                    const isToday = dayDate.toDateString() === new Date().toDateString()
                    return (
                      <div key={i} className={cn(
                        'border-l border-slate-50 dark:border-slate-800 p-3 text-center',
                        isToday && 'bg-neomorphic-primary/5 dark:bg-pink-900/10',
                      )}>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
                        <p className={cn(
                          'text-lg font-bold',
                          isToday ? 'text-neomorphic-primary-dark dark:text-pink-400' : 'text-slate-700 dark:text-slate-200',
                        )}>
                          {dayDate.getDate()}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Time rows */}
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-50/50 dark:border-slate-800/50 min-h-[60px]">
                    <div className="flex items-start justify-end p-2 pr-3">
                      <span className="text-xs font-medium text-slate-300 dark:text-slate-700">{hour}</span>
                    </div>
                    {dayLabels.map((_, dayIndex) => {
                      const slotSessions = getSessionsForSlot(dayIndex, hour)
                      const dayDate = new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000)
                      const isToday = dayDate.toDateString() === new Date().toDateString()

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'border-l border-slate-50/50 dark:border-slate-800/50 p-1 transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-800/30',
                            isToday && 'bg-neomorphic-primary/[0.02] dark:bg-pink-900/[0.03]',
                          )}
                        >
                          {slotSessions.map((session) => {
                            const config = statusConfig[session.status] || statusConfig.SCHEDULED
                            return (
                              <motion.button
                                key={session.id}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedSession(session)}
                                className={cn(
                                  'w-full rounded-xl border p-2 text-left transition-all bg-gradient-to-br',
                                  config.color, config.darkColor,
                                  session.status === 'CANCELLED' && 'opacity-50',
                                )}
                              >
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                  {session.patient_name || 'Paciente'}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {session.professional_name} - {session.room_name}
                                </p>
                              </motion.button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onUpdated={fetchSessions}
      />

      {/* Create Session Modal */}
      <CreateSessionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchSessions}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SESSION DETAIL MODAL
   ════════════════════════════════════════════════════════════════ */

function SessionDetailModal({
  session, onClose, onUpdated,
}: {
  session: SessionItem | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [saving, setSaving] = useState(false)

  const updateStatus = async (newStatus: string) => {
    if (!session) return
    setSaving(true)
    try {
      await api.put(`/sessions/${session.id}`, { status: newStatus })
      onUpdated()
      onClose()
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const cancelSession = async () => {
    if (!session) return
    setSaving(true)
    try {
      await api.delete(`/sessions/${session.id}`)
      onUpdated()
      onClose()
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  if (!session) return <NeuModal open={false} onClose={onClose}><div /></NeuModal>

  const config = statusConfig[session.status] || statusConfig.SCHEDULED
  const time = new Date(session.scheduled_at)
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
  const dateStr = time.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <NeuModal open={!!session} onClose={onClose} title="Detalle de Sesión" size="md">
      <div className="space-y-4">
        <div className={cn('rounded-2xl bg-gradient-to-br p-4', config.color)}>
          <div className="flex items-center gap-2 mb-2">
            <NeuBadge variant={config.badgeVariant as any} size="md">{config.label}</NeuBadge>
            <span className="text-xs text-slate-400">{sessionTypeLabels[session.session_type] || session.session_type}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{session.patient_name || 'Paciente'}</h3>
          <p className="text-sm text-slate-500 mt-1">{dateStr}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-3">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Hora</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-3">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Profesional</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{session.professional_name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-3">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Consultorio</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{session.room_name || '—'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {session.status === 'SCHEDULED' && (
            <>
              <NeuButton variant="success" size="sm" className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => updateStatus('CONFIRMED')} loading={saving}>
                Confirmar
              </NeuButton>
              <NeuButton variant="danger" size="sm" className="flex-1" icon={<XCircle className="h-4 w-4" />}
                onClick={cancelSession} loading={saving}>
                Cancelar
              </NeuButton>
            </>
          )}
          {session.status === 'CONFIRMED' && (
            <>
              <NeuButton variant="success" size="sm" className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => updateStatus('ATTENDED')} loading={saving}>
                Marcar Asistencia
              </NeuButton>
              <NeuButton variant="danger" size="sm" icon={<AlertCircle className="h-4 w-4" />}
                onClick={() => updateStatus('NO_SHOW')} loading={saving}>
                No asistió
              </NeuButton>
            </>
          )}
          <NeuButton variant="ghost" size="sm" onClick={onClose}>Cerrar</NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}

/* ════════════════════════════════════════════════════════════════
   CREATE SESSION MODAL
   ════════════════════════════════════════════════════════════════ */

function CreateSessionModal({
  open, onClose, onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [patients, setPatients] = useState<SelectOption[]>([])
  const [professionals, setProfessionals] = useState<SelectOption[]>([])
  const [rooms, setRooms] = useState<SelectOption[]>([])

  const [patientId, setPatientId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('50')
  const [amount, setAmount] = useState('15000')
  const [sessionType, setSessionType] = useState('CONSULTATION')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    // Fetch options for selects
    const fetchOptions = async () => {
      try {
        const [pRes, prRes, rRes] = await Promise.all([
          api.get('/patients', { params: { page_size: '100', is_active: true } }),
          api.get('/professionals', { params: { page_size: '50' } }),
          api.get('/rooms'),
        ])
        setPatients((pRes.data.items || []).map((p: any) => ({ id: p.id, label: `${p.first_name} ${p.last_name}` })))
        setProfessionals((prRes.data.items || []).map((p: any) => ({ id: p.id, label: p.user_name || p.user_email || p.id })))
        setRooms((rRes.data || []).map((r: any) => ({ id: r.id, label: r.name })))
      } catch {
        // options will be empty
      }
    }
    fetchOptions()
    // Reset form
    setPatientId(''); setProfessionalId(''); setRoomId('')
    setDate(''); setTime(''); setDuration('50'); setAmount('15000')
    setSessionType('CONSULTATION'); setNotes(''); setError('')
  }, [open])

  const handleSubmit = async () => {
    if (!patientId || !professionalId || !roomId || !date || !time) {
      setError('Completar paciente, profesional, consultorio, fecha y hora')
      return
    }
    setSaving(true)
    setError('')

    const scheduled_at = `${date}T${time}:00`

    try {
      await api.post('/sessions', {
        patient_id: patientId,
        professional_id: professionalId,
        room_id: roomId,
        scheduled_at,
        duration_minutes: parseFloat(duration) || 50,
        amount: parseFloat(amount) || 0,
        session_type: sessionType,
        notes: notes.trim() || null,
      })
      onCreated()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail || 'Error creando sesión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <NeuModal open={open} onClose={onClose} title="Nueva Sesión" size="lg">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Paciente *</label>
          <select value={patientId} onChange={e => setPatientId(e.target.value)}
            className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm px-4 py-3 text-slate-700 dark:text-slate-200 outline-none">
            <option value="">Seleccionar paciente...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Profesional *</label>
            <select value={professionalId} onChange={e => setProfessionalId(e.target.value)}
              className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm px-4 py-3 text-slate-700 dark:text-slate-200 outline-none">
              <option value="">Seleccionar...</option>
              {professionals.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Consultorio *</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)}
              className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm px-4 py-3 text-slate-700 dark:text-slate-200 outline-none">
              <option value="">Seleccionar...</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput label="Fecha *" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <NeuInput label="Hora *" type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NeuInput label="Duración (min)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
          <NeuInput label="Monto (ARS)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Tipo</label>
            <select value={sessionType} onChange={e => setSessionType(e.target.value)}
              className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm px-4 py-3 text-slate-700 dark:text-slate-200 outline-none">
              <option value="CONSULTATION">Consulta</option>
              <option value="FOLLOW_UP">Seguimiento</option>
              <option value="INITIAL">Primera vez</option>
              <option value="ASSESSMENT">Evaluación</option>
            </select>
          </div>
        </div>

        <NeuInput label="Notas" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones..." />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancelar</NeuButton>
          <NeuButton size="sm" onClick={handleSubmit} loading={saving} icon={<CalendarIcon className="h-4 w-4" />}>
            Crear Sesión
          </NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}
