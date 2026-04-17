'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Plus, Edit3, Trash2, Calendar, DollarSign,
  Users, ChevronLeft, ChevronRight, Loader2,
  Wrench, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuInput from '@/components/neumorphism/Input'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import StatCard from '@/components/dashboard/StatCard'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

/* ─── Types ─── */

interface Room {
  id: string
  name: string
  description: string | null
  capacity: number
  hourly_rate: number
  amenities: string | null
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE'
  created_at: string | null
  updated_at: string | null
}

interface ScheduleSlot {
  session_id: string
  hour: string
  patient_name: string
  professional_name: string
  status: string
  session_type: string | null
  duration_minutes: number
}

interface DaySchedule {
  date: string
  day_label: string
  slots: ScheduleSlot[]
}

interface RoomSchedule {
  room_id: string
  room_name: string
  week_start: string
  week_end: string
  business_hours: string[]
  days: DaySchedule[]
}

/* ─── Status config ─── */

const statusConfig: Record<string, { label: string; variant: 'green' | 'blue' | 'yellow' | 'red'; icon: React.ReactNode }> = {
  AVAILABLE: { label: 'Disponible', variant: 'green', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  RENTED: { label: 'Alquilado', variant: 'blue', icon: <DollarSign className="h-3.5 w-3.5" /> },
  MAINTENANCE: { label: 'Mantenimiento', variant: 'yellow', icon: <Wrench className="h-3.5 w-3.5" /> },
  UNAVAILABLE: { label: 'No disponible', variant: 'red', icon: <XCircle className="h-3.5 w-3.5" /> },
}

const sessionStatusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  ATTENDED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  NO_SHOW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

/* ─── Animation variants ─── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

/* ─── Helpers ─── */

function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null)
  const [scheduleRoom, setScheduleRoom] = useState<Room | null>(null)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/rooms')
      setRooms(res.data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando consultorios'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length
  const rentedCount = rooms.filter(r => r.status === 'RENTED').length
  const avgRate = rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + r.hourly_rate, 0) / rooms.length) : 0

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Consultorios" subtitle="Gestión de salas y disponibilidad" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ─── Stats ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total" value={rooms.length} icon={<Building2 className="h-5 w-5" />} color="blue" delay={0} />
          <StatCard title="Disponibles" value={availableCount} icon={<CheckCircle2 className="h-5 w-5" />} color="green" delay={100} />
          <StatCard title="Alquilados" value={rentedCount} icon={<DollarSign className="h-5 w-5" />} color="purple" delay={200} />
          <StatCard title="Tarifa Prom." value={avgRate} prefix="$" icon={<DollarSign className="h-5 w-5" />} color="yellow" delay={300} />
        </div>

        {/* ─── Toolbar ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            {rooms.length} Consultorio{rooms.length !== 1 ? 's' : ''}
          </h2>
          <NeuButton
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
          >
            <span className="hidden sm:inline">Nuevo Consultorio</span>
            <span className="sm:hidden">Nuevo</span>
          </NeuButton>
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchRooms} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* ─── Loading ─── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* ─── Empty ─── */}
        {!loading && !error && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">No hay consultorios creados</p>
            <NeuButton size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
              Crear primer consultorio
            </NeuButton>
          </div>
        )}

        {/* ─── Room Cards Grid ─── */}
        {!loading && rooms.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {rooms.map((room) => {
              const st = statusConfig[room.status] || statusConfig.AVAILABLE
              return (
                <motion.div
                  key={room.id}
                  variants={cardItem}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-neomorphic backdrop-blur-sm p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-secondary/50 to-neomorphic-secondary/20">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">{room.name}</h3>
                        <NeuBadge variant={st.variant} size="sm">{st.label}</NeuBadge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {room.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 line-clamp-2">{room.description}</p>
                  )}

                  {/* Info rows */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Users className="h-3.5 w-3.5" /> Capacidad
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{room.capacity} m²</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <DollarSign className="h-3.5 w-3.5" /> Tarifa/hora
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{formatARS(room.hourly_rate)}</span>
                    </div>
                    {room.amenities && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Wrench className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{room.amenities}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScheduleRoom(room)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-neomorphic-secondary/20 hover:bg-neomorphic-secondary/40 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Horario
                    </button>
                    <button
                      onClick={() => setEditRoom(room)}
                      className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteRoom(room)}
                      className="flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 p-2 text-red-500 dark:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* ─── Modals ─── */}
      <RoomFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={fetchRooms}
      />
      <RoomFormModal
        open={!!editRoom}
        room={editRoom ?? undefined}
        onClose={() => setEditRoom(null)}
        onSaved={fetchRooms}
      />
      <DeleteConfirmModal
        room={deleteRoom}
        onClose={() => setDeleteRoom(null)}
        onDeleted={fetchRooms}
      />
      <ScheduleModal
        room={scheduleRoom}
        onClose={() => setScheduleRoom(null)}
      />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   CREATE / EDIT MODAL
   ════════════════════════════════════════════════════════════════ */

function RoomFormModal({
  open,
  room,
  onClose,
  onSaved,
}: {
  open: boolean
  room?: Room
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!room
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [amenities, setAmenities] = useState('')
  const [status, setStatus] = useState<Room['status']>('AVAILABLE')

  useEffect(() => {
    if (room) {
      setName(room.name)
      setDescription(room.description || '')
      setCapacity(String(room.capacity))
      setHourlyRate(String(room.hourly_rate))
      setAmenities(room.amenities || '')
      setStatus(room.status)
    } else {
      setName('')
      setDescription('')
      setCapacity('')
      setHourlyRate('5000')
      setAmenities('')
      setStatus('AVAILABLE')
    }
    setError('')
  }, [room, open])

  const handleSubmit = async () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    if (!capacity || parseFloat(capacity) <= 0) { setError('Capacidad inválida'); return }

    setSaving(true)
    setError('')

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      capacity: parseFloat(capacity),
      hourly_rate: parseFloat(hourlyRate) || 0,
      amenities: amenities.trim() || null,
      status,
    }

    try {
      if (isEdit && room) {
        await api.put(`/rooms/${room.id}`, payload)
      } else {
        await api.post('/rooms', payload)
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Error guardando consultorio')
      } else {
        setError('Error de conexión')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <NeuModal open={open} onClose={onClose} title={isEdit ? 'Editar Consultorio' : 'Nuevo Consultorio'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NeuInput label="Nombre *" value={name} onChange={e => setName(e.target.value)} placeholder="Consultorio 1" />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Estado</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Room['status'])}
              className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm px-4 py-3 text-slate-700 dark:text-slate-200 outline-none focus:shadow-neomorphic transition-all"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="RENTED">Alquilado</option>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="UNAVAILABLE">No disponible</option>
            </select>
          </div>
        </div>

        <NeuInput label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Consultorio planta baja..." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NeuInput
            label="Capacidad (m²) *"
            type="number"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            placeholder="15"
            min="1"
          />
          <NeuInput
            label="Tarifa por hora (ARS) *"
            type="number"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            placeholder="5000"
            min="0"
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>

        <NeuInput
          label="Amenities"
          value={amenities}
          onChange={e => setAmenities(e.target.value)}
          placeholder="Diván, escritorio, aire acondicionado..."
        />

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancelar
          </NeuButton>
          <NeuButton size="sm" onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Guardar cambios' : 'Crear consultorio'}
          </NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}

/* ════════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
   ════════════════════════════════════════════════════════════════ */

function DeleteConfirmModal({
  room,
  onClose,
  onDeleted,
}: {
  room: Room | null
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!room) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/rooms/${room.id}`)
      onDeleted()
      onClose()
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Error eliminando consultorio')
      } else {
        setError('Error de conexión')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <NeuModal open={!!room} onClose={onClose} title="Eliminar Consultorio" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ¿Estás seguro de eliminar <span className="font-bold">{room?.name}</span>? Esta acción no se puede deshacer.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-3">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={deleting}>Cancelar</NeuButton>
          <NeuButton variant="danger" size="sm" onClick={handleDelete} loading={deleting}>Eliminar</NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}

/* ════════════════════════════════════════════════════════════════
   SCHEDULE MODAL — Vista semanal del consultorio
   ════════════════════════════════════════════════════════════════ */

function ScheduleModal({
  room,
  onClose,
}: {
  room: Room | null
  onClose: () => void
}) {
  const [schedule, setSchedule] = useState<RoomSchedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [weekStart, setWeekStart] = useState<Date>(getMondayOfWeek(new Date()))

  const fetchSchedule = useCallback(async () => {
    if (!room) return
    setLoading(true)
    try {
      const res = await api.get(`/rooms/${room.id}/schedule`, {
        params: { week_start: formatDateISO(weekStart) },
      })
      setSchedule(res.data)
    } catch {
      setSchedule(null)
    } finally {
      setLoading(false)
    }
  }, [room, weekStart])

  useEffect(() => {
    if (room) {
      fetchSchedule()
    } else {
      setSchedule(null)
      setWeekStart(getMondayOfWeek(new Date()))
    }
  }, [room, fetchSchedule])

  const prevWeek = () => setWeekStart(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000))
  const nextWeek = () => setWeekStart(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000))
  const goToday = () => setWeekStart(getMondayOfWeek(new Date()))

  return (
    <NeuModal open={!!room} onClose={onClose} title={`Horario — ${room?.name || ''}`} size="xl">
      <div className="space-y-4">
        {/* Week nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </button>
          <div className="text-center">
            <button onClick={goToday} className="text-xs text-blue-600 dark:text-blue-400 underline mb-1">Hoy</button>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {schedule ? `${schedule.week_start} — ${schedule.week_end}` : formatDateISO(weekStart)}
            </p>
          </div>
          <button onClick={nextWeek} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && schedule && (
          <>
            {/* ─── MOBILE: lista por día ─── */}
            <div className="lg:hidden space-y-4 max-h-[60vh] overflow-y-auto">
              {schedule.days.map((day) => (
                <div key={day.date}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {day.day_label}
                  </p>
                  {day.slots.length === 0 ? (
                    <p className="text-xs text-slate-300 dark:text-slate-600 italic pl-2">Sin sesiones</p>
                  ) : (
                    <div className="space-y-2">
                      {day.slots.map((slot) => (
                        <div
                          key={slot.session_id}
                          className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-slate-800/60 p-3 shadow-neomorphic-sm"
                        >
                          <div className="flex h-9 w-14 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{slot.hour}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{slot.patient_name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{slot.professional_name}</p>
                          </div>
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', sessionStatusColors[slot.status] || '')}>
                            {slot.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ─── DESKTOP: grilla semanal ─── */}
            <div className="hidden lg:block max-h-[60vh] overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="sticky top-0 bg-white/95 dark:bg-slate-900/95 z-10 px-2 py-2 text-left text-slate-400 font-medium w-16">Hora</th>
                    {schedule.days.map((day) => (
                      <th key={day.date} className="sticky top-0 bg-white/95 dark:bg-slate-900/95 z-10 px-2 py-2 text-center text-slate-400 font-medium">
                        {day.day_label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.business_hours.map((hour) => (
                    <tr key={hour} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-2 py-1.5 text-slate-400 font-mono">{hour}</td>
                      {schedule.days.map((day) => {
                        const slot = day.slots.find(s => s.hour === hour)
                        return (
                          <td key={day.date + hour} className="px-1 py-1">
                            {slot ? (
                              <div className={cn('rounded-lg px-2 py-1.5 text-center', sessionStatusColors[slot.status] || 'bg-slate-100')}>
                                <p className="font-semibold truncate">{slot.patient_name}</p>
                                <p className="opacity-70 truncate">{slot.professional_name}</p>
                              </div>
                            ) : (
                              <div className="h-8" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && schedule && schedule.days.every(d => d.slots.length === 0) && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
            No hay sesiones esta semana en {room?.name}
          </p>
        )}
      </div>
    </NeuModal>
  )
}
