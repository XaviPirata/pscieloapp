'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import NeuInput from '@/components/neumorphism/Input'
import { cn } from '@/lib/utils'

// Demo sessions per time slot
interface SessionSlot {
  id: string
  time: string
  patient: string
  professional: string
  room: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW'
  type: string
}

const daysOfWeek = ['Lun 7', 'Mar 8', 'Mié 9', 'Jue 10', 'Vie 11']
const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const sessionsData: Record<string, SessionSlot[]> = {
  'Lun 7-8:00': [{ id: '1', time: '8:00', patient: 'Federico M.', professional: 'Andrea', room: 'C2', status: 'ATTENDED', type: 'Seguimiento' }],
  'Lun 7-9:00': [{ id: '2', time: '9:00', patient: 'Ismael R.', professional: 'Andrea', room: 'C2', status: 'ATTENDED', type: 'Consulta' }],
  'Mar 8-10:00': [{ id: '3', time: '10:00', patient: 'Morena L.', professional: 'Yamila', room: 'C1', status: 'ATTENDED', type: 'Seguimiento' }],
  'Mar 8-16:00': [{ id: '4', time: '16:00', patient: 'Sofía P.', professional: 'Andrea', room: 'C3', status: 'CONFIRMED', type: 'Consulta' }],
  'Mié 9-14:00': [{ id: '5', time: '14:00', patient: 'Federico M.', professional: 'Andrea', room: 'C2', status: 'SCHEDULED', type: 'Seguimiento' }],
  'Mié 9-16:00': [{ id: '6', time: '16:00', patient: 'Nicolás C.', professional: 'Yamila', room: 'C1', status: 'SCHEDULED', type: 'Primera vez' }],
  'Jue 10-9:00': [{ id: '7', time: '9:00', patient: 'Vicky S.', professional: 'Yamila', room: 'C1', status: 'SCHEDULED', type: 'Seguimiento' }],
  'Jue 10-17:00': [{ id: '8', time: '17:00', patient: 'Camila R.', professional: 'Andrea', room: 'C2', status: 'CANCELLED', type: 'Consulta' }],
  'Vie 11-10:00': [{ id: '9', time: '10:00', patient: 'Morena L.', professional: 'Yamila', room: 'C1', status: 'SCHEDULED', type: 'Seguimiento' }],
  'Vie 11-15:00': [{ id: '10', time: '15:00', patient: 'Sofía P.', professional: 'Andrea', room: 'C3', status: 'SCHEDULED', type: 'Evaluación' }],
}

const statusConfig: Record<string, { color: string; darkColor: string; icon: any; label: string }> = {
  SCHEDULED: { color: 'from-pastel-blue/70 to-pastel-blue/40 border-blue-200/40', darkColor: 'dark:from-blue-900/70 dark:to-blue-900/50 dark:border-blue-700/40', icon: CalendarIcon, label: 'Programada' },
  CONFIRMED: { color: 'from-pastel-purple/70 to-pastel-purple/40 border-purple-200/40', darkColor: 'dark:from-purple-900/70 dark:to-purple-900/50 dark:border-purple-700/40', icon: CheckCircle2, label: 'Confirmada' },
  ATTENDED: { color: 'from-pastel-green/70 to-pastel-green/40 border-green-200/40', darkColor: 'dark:from-green-900/70 dark:to-green-900/50 dark:border-green-700/40', icon: CheckCircle2, label: 'Asistió' },
  CANCELLED: { color: 'from-slate-100/60 to-slate-50/30 border-slate-200/40', darkColor: 'dark:from-slate-800/60 dark:to-slate-800/40 dark:border-slate-700/40', icon: XCircle, label: 'Cancelada' },
  NO_SHOW: { color: 'from-pastel-rose/70 to-pastel-rose/40 border-rose-200/40', darkColor: 'dark:from-rose-900/70 dark:to-rose-900/50 dark:border-rose-700/40', icon: AlertCircle, label: 'No asistió' },
}

const profColors: Record<string, string> = {
  Andrea: 'bg-neomorphic-primary/70',
  Yamila: 'bg-neomorphic-secondary/70',
}

export default function SessionsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionSlot | null>(null)

  return (
    <div className="min-h-screen pb-8">
      <Header title="Sesiones" subtitle="Semana del 7 al 11 de Abril 2026" />

      <div className="px-8">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NeuButton variant="ghost" size="sm" icon={<ChevronLeft className="h-4 w-4" />} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-3">Abril 2026 - Semana 2</span>
            <NeuButton variant="ghost" size="sm" icon={<ChevronRight className="h-4 w-4" />} />
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
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

        {/* Calendar grid */}
        <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 dark:border dark:border-white/[0.05] shadow-neomorphic backdrop-blur-sm overflow-hidden">
          {/* Days header */}
          <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-100 dark:border-slate-800">
            <div className="p-3" />
            {daysOfWeek.map((day, i) => (
              <div key={day} className={cn(
                'border-l border-slate-50 dark:border-slate-800 p-3 text-center',
                i === 2 && 'bg-neomorphic-primary/5 dark:bg-pink-900/10',
              )}>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{day.split(' ')[0]}</p>
                <p className={cn(
                  'text-lg font-bold',
                  i === 2 ? 'text-neomorphic-primary-dark dark:text-pink-400' : 'text-slate-700 dark:text-slate-200',
                )}>
                  {day.split(' ')[1]}
                </p>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-50/50 dark:border-slate-800/50 min-h-[60px]">
              {/* Time label */}
              <div className="flex items-start justify-end p-2 pr-3">
                <span className="text-xs font-medium text-slate-300 dark:text-slate-700">{hour}</span>
              </div>

              {/* Day cells */}
              {daysOfWeek.map((day, dayIndex) => {
                const key = `${day}-${hour}`
                const slotSessions = sessionsData[key] || []

                return (
                  <div
                    key={key}
                    className={cn(
                      'border-l border-slate-50/50 dark:border-slate-800/50 p-1 transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-800/30',
                      dayIndex === 2 && 'bg-neomorphic-primary/[0.02] dark:bg-pink-900/[0.03]',
                    )}
                  >
                    {slotSessions.map((session) => {
                      const config = statusConfig[session.status]
                      return (
                        <motion.button
                          key={session.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedSession(session)}
                          className={cn(
                            'w-full rounded-xl border p-2 text-left transition-all',
                            'bg-gradient-to-br',
                            config.color,
                            config.darkColor,
                            session.status === 'CANCELLED' && 'opacity-50',
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={cn('h-1.5 w-1.5 rounded-full', profColors[session.professional])} />
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                              {session.patient}
                            </p>
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {session.professional} - {session.room}
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

      {/* Session Detail Modal */}
      <NeuModal
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Detalle de Sesión"
        size="md"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className={cn(
              'rounded-2xl bg-gradient-to-br p-4',
              statusConfig[selectedSession.status].color,
            )}>
              <div className="flex items-center gap-2 mb-2">
                <NeuBadge
                  variant={
                    selectedSession.status === 'ATTENDED' ? 'green' :
                    selectedSession.status === 'CANCELLED' ? 'gray' :
                    selectedSession.status === 'CONFIRMED' ? 'purple' : 'blue'
                  }
                  size="md"
                >
                  {statusConfig[selectedSession.status].label}
                </NeuBadge>
                <span className="text-xs text-slate-400">{selectedSession.type}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{selectedSession.patient}</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-3">
                <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Hora</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedSession.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-3">
                <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Profesional</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedSession.professional}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-3">
                <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Consultorio</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedSession.room}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {selectedSession.status === 'SCHEDULED' && (
                <>
                  <NeuButton variant="success" size="sm" className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />}>
                    Confirmar
                  </NeuButton>
                  <NeuButton variant="danger" size="sm" className="flex-1" icon={<XCircle className="h-4 w-4" />}>
                    Cancelar
                  </NeuButton>
                </>
              )}
              {selectedSession.status === 'CONFIRMED' && (
                <NeuButton variant="success" size="sm" className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />}>
                  Marcar Asistencia
                </NeuButton>
              )}
              <NeuButton variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                Cerrar
              </NeuButton>
            </div>
          </div>
        )}
      </NeuModal>

      {/* Create Session Modal */}
      <NeuModal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva Sesión" size="lg">
        <div className="space-y-4">
          <NeuInput label="Paciente" placeholder="Buscar paciente..." variant="inset" icon={<User className="h-4 w-4" />} />
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Profesional" placeholder="Seleccionar..." variant="inset" />
            <NeuInput label="Consultorio" placeholder="Seleccionar..." variant="inset" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Fecha" type="date" variant="inset" />
            <NeuInput label="Hora" type="time" variant="inset" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Duración (min)" type="number" placeholder="50" variant="inset" />
            <NeuInput label="Monto (ARS)" type="number" placeholder="15000" variant="inset" />
          </div>
          <NeuInput label="Notas" placeholder="Observaciones..." variant="inset" />
          <div className="flex justify-end gap-2 pt-2">
            <NeuButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</NeuButton>
            <NeuButton variant="primary" icon={<CalendarIcon className="h-4 w-4" />}>Crear Sesión</NeuButton>
          </div>
        </div>
      </NeuModal>
    </div>
  )
}
