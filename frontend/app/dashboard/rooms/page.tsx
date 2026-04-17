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

interface RoomRental {
  id: string
  room_id: string
  professional_id: string
  rental_type: string
  day_of_week: number | null
  time_window: string | null
  month_year: string
  amount: number
  start_date: string
  end_date: string
  paid: boolean
  room_name: string | null
  professional_name: string | null
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

const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const dayLabelsShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const timeWindowLabels: Record<string, string> = {
  MORNING: 'Mañana (08-14)',
  AFTERNOON: 'Tarde (14-20)',
  FULL_DAY: 'Día completo',
}

const rentalColors = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200/50',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200/50',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/50',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200/50',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200/50',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300 border-lime-200/50',
]

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

function getMonthYear(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${y}-${m}`
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [rentals, setRentals] = useState<RoomRental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null)
  const [scheduleRoom, setScheduleRoom] = useState<Room | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [roomsRes, rentalsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/rentals/all', { params: { page_size: '200' } }),
      ])
      setRooms(roomsRes.data)
      setRentals(rentalsRes.data.items || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando consultorios'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length
  const rentedCount = rooms.filter(r => r.status === 'RENTED').length
  const avgRate = rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + r.hourly_rate, 0) / rooms.length) : 0

  // Get rentals for current month
  const currentMonthYear = getMonthYear(calendarMonth)
  const monthRentals = rentals.filter(r => r.month_year === currentMonthYear)

  // Build color map for professionals in rentals
  const profColorMap = new Map<string, string>()
  let colorIdx = 0
  monthRentals.forEach(r => {
    if (!profColorMap.has(r.professional_id)) {
      profColorMap.set(r.professional_id, rentalColors[colorIdx % rentalColors.length])
      colorIdx++
    }
  })

  // Calendar navigation
  const prevMonth = () => setCalendarMonth(prev => {
    const d = new Date(prev)
    d.setMonth(d.getMonth() - 1)
    return d
  })
  const nextMonth = () => setCalendarMonth(prev => {
    const d = new Date(prev)
    d.setMonth(d.getMonth() + 1)
    return d
  })
  const goCurrentMonth = () => setCalendarMonth(new Date())

  // Build calendar grid data
  const calendarDays = buildCalendarDays(calendarMonth)

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
            <button onClick={fetchData} className="ml-auto underline">Reintentar</button>
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
              // Count rentals for this room
              const roomRentals = monthRentals.filter(r => r.room_id === room.id)
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
                  <div className="space-y-2 mb-3">
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
                  </div>

                  {/* Active rentals for this room */}
                  {roomRentals.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Alquileres activos</p>
                      {roomRentals.map(r => (
                        <div key={r.id} className={cn('rounded-lg px-2 py-1 text-[11px] font-medium border', profColorMap.get(r.professional_id) || rentalColors[0])}>
                          {r.professional_name || '?'} — {r.day_of_week != null ? dayLabels[r.day_of_week] : 'Todos'} {r.time_window ? timeWindowLabels[r.time_window] || r.time_window : ''}
                        </div>
                      ))}
                    </div>
                  )}

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

        {/* ─── MONTHLY OCCUPANCY CALENDAR ─── */}
        {!loading && rooms.length > 0 && (
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm overflow-hidden dark:border dark:border-white/[0.05]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                  Ocupación Mensual
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                </button>
                <button onClick={goCurrentMonth} className="text-xs text-blue-600 dark:text-blue-400 underline px-1">Hoy</button>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] text-center capitalize">
                  {getMonthLabel(calendarMonth)}
                </span>
                <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Legend */}
            {monthRentals.length > 0 && (
              <div className="px-5 py-2 border-b border-slate-50 dark:border-slate-800/50 flex flex-wrap gap-2">
                {Array.from(new Set(monthRentals.map(r => r.professional_id))).map(profId => {
                  const rental = monthRentals.find(r => r.professional_id === profId)
                  const colorCls = profColorMap.get(profId) || rentalColors[0]
                  return (
                    <span key={profId} className={cn('inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border', colorCls)}>
                      {rental?.professional_name || '?'}
                    </span>
                  )
                })}
                <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                  Libre
                </span>
              </div>
            )}

            {/* Calendar per room */}
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {rooms.map(room => {
                const roomRentals = monthRentals.filter(r => r.room_id === room.id)
                return (
                  <div key={room.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{room.name}</h4>
                      {roomRentals.length === 0 && (
                        <NeuBadge variant="green" size="sm">Disponible</NeuBadge>
                      )}
                    </div>

                    {/* MOBILE: simple list */}
                    <div className="lg:hidden space-y-1">
                      {roomRentals.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Sin alquileres este mes</p>
                      ) : (
                        roomRentals.map(r => (
                          <div key={r.id} className={cn('rounded-lg px-3 py-2 text-xs font-medium border', profColorMap.get(r.professional_id) || rentalColors[0])}>
                            <div className="font-semibold">{r.professional_name || '?'}</div>
                            <div className="opacity-80">
                              {r.day_of_week != null ? dayLabels[r.day_of_week] : 'Todos los días'} — {r.time_window ? timeWindowLabels[r.time_window] || r.time_window : 'Día completo'}
                              {' · '}{formatARS(r.amount)}
                              {r.paid ? ' ✓' : ''}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* DESKTOP: calendar grid */}
                    <div className="hidden lg:block">
                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {dayLabelsShort.map(d => (
                          <div key={d} className="text-center text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-600">
                            {d}
                          </div>
                        ))}
                      </div>
                      {/* Calendar cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                          if (!day) {
                            return <div key={`empty-${i}`} className="h-14" />
                          }
                          const dayOfWeek = day.getDay()
                          const dow = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0=Mon
                          const isToday = day.toDateString() === new Date().toDateString()

                          // Find rentals occupying this day
                          const dayRentals = roomRentals.filter(r => {
                            if (r.day_of_week === null || r.day_of_week === undefined) return true
                            return r.day_of_week === dow
                          })

                          const hasMorning = dayRentals.some(r => r.time_window === 'MORNING' || r.time_window === 'FULL_DAY')
                          const hasAfternoon = dayRentals.some(r => r.time_window === 'AFTERNOON' || r.time_window === 'FULL_DAY')

                          return (
                            <div
                              key={day.toISOString()}
                              className={cn(
                                'relative rounded-lg h-14 p-1 text-center transition-all',
                                isToday && 'ring-2 ring-blue-400/50',
                                dayRentals.length === 0
                                  ? 'bg-slate-50/50 dark:bg-slate-800/30'
                                  : '',
                              )}
                            >
                              <span className={cn(
                                'text-[10px] font-medium',
                                isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400',
                              )}>
                                {day.getDate()}
                              </span>
                              {dayRentals.length > 0 && (
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  {hasMorning && (
                                    <div className={cn(
                                      'rounded px-0.5 py-px text-[8px] font-semibold truncate leading-tight border',
                                      profColorMap.get(dayRentals.find(r => r.time_window === 'MORNING' || r.time_window === 'FULL_DAY')?.professional_id || '') || rentalColors[0],
                                    )}>
                                      AM
                                    </div>
                                  )}
                                  {hasAfternoon && (
                                    <div className={cn(
                                      'rounded px-0.5 py-px text-[8px] font-semibold truncate leading-tight border',
                                      profColorMap.get(dayRentals.find(r => r.time_window === 'AFTERNOON' || r.time_window === 'FULL_DAY')?.professional_id || '') || rentalColors[0],
                                    )}>
                                      PM
                                    </div>
                                  )}
                                  {!hasMorning && !hasAfternoon && dayRentals.length > 0 && (
                                    <div className={cn(
                                      'rounded px-0.5 py-px text-[8px] font-semibold truncate leading-tight border',
                                      profColorMap.get(dayRentals[0]?.professional_id || '') || rentalColors[0],
                                    )}>
                                      Ocup.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      <RoomFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={fetchData}
      />
      <RoomFormModal
        open={!!editRoom}
        room={editRoom ?? undefined}
        onClose={() => setEditRoom(null)}
        onSaved={fetchData}
      />
      <DeleteConfirmModal
        room={deleteRoom}
        onClose={() => setDeleteRoom(null)}
        onDeleted={fetchData}
      />
      <ScheduleModal
        room={scheduleRoom}
        onClose={() => setScheduleRoom(null)}
      />
    </div>
  )
}

/* ─── Calendar helper ─── */

function buildCalendarDays(month: Date): (Date | null)[] {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstDay = new Date(year, m, 1)
  const lastDay = new Date(year, m + 1, 0)

  // Monday-based: 0=Mon, 6=Sun
  let startDow = firstDay.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const days: (Date | null)[] = []

  // Padding before first day
  for (let i = 0; i < startDow; i++) {
    days.push(null)
  }

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, m, d))
  }

  return days
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

  // Reset weekStart when modal opens with a new room
  const roomId = room?.id ?? null
  useEffect(() => {
    if (roomId) {
      setWeekStart(getMondayOfWeek(new Date()))
    } else {
      setSchedule(null)
    }
  }, [roomId])

  useEffect(() => {
    if (!room) return
    let cancelled = false
    setLoading(true)
    api.get(`/rooms/${room.id}/schedule`, {
      params: { week_start: formatDateISO(weekStart) },
    })
      .then(res => { if (!cancelled) setSchedule(res.data) })
      .catch(() => { if (!cancelled) setSchedule(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [room, weekStart])

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
