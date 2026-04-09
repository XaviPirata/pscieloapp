'use client'

import { motion } from 'framer-motion'
import { Calendar, UserPlus, CreditCard, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'session' | 'patient' | 'payment' | 'commission' | 'attendance'
  title: string
  description: string
  time: string
  user: string
}

// Demo data
const activities: Activity[] = [
  { id: '1', type: 'session', title: 'Nueva sesión programada', description: 'Federico M. - Consultorio 2, 14:30', time: 'Hace 5 min', user: 'Andrea' },
  { id: '2', type: 'attendance', title: 'Asistencia confirmada', description: 'Morena L. asistió a su sesión de las 10:00', time: 'Hace 20 min', user: 'Yamila' },
  { id: '3', type: 'patient', title: 'Nuevo paciente registrado', description: 'Nicolás C. - Derivado por Instagram', time: 'Hace 1 hora', user: 'Admin' },
  { id: '4', type: 'payment', title: 'Pago recibido', description: 'Sofía R. abonó sesión ($15,000)', time: 'Hace 2 horas', user: 'Andrea' },
  { id: '5', type: 'commission', title: 'Comisión semanal calculada', description: 'Andrea - Semana 7/04 al 11/04: $245,000', time: 'Hace 3 horas', user: 'Sistema' },
]

const typeConfig = {
  session: { icon: Calendar, color: 'bg-pastel-blue/50 text-blue-600' },
  patient: { icon: UserPlus, color: 'bg-pastel-green/50 text-green-600' },
  payment: { icon: CreditCard, color: 'bg-pastel-purple/50 text-purple-600' },
  commission: { icon: CreditCard, color: 'bg-pastel-yellow/50 text-yellow-600' },
  attendance: { icon: CheckCircle2, color: 'bg-pastel-rose/50 text-rose-600' },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0 },
}

export default function ActivityFeed() {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-neomorphic backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-700">Actividad Reciente</h3>
        <button className="text-xs font-medium text-neomorphic-primary-dark hover:underline">
          Ver todo
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-1"
      >
        {activities.map((activity) => {
          const config = typeConfig[activity.type]
          const Icon = config.icon

          return (
            <motion.div
              key={activity.id}
              variants={item}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.6)' }}
              className="group flex items-start gap-3 rounded-2xl p-3 transition-colors"
            >
              <div className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                config.color,
              )}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-600">{activity.title}</p>
                <p className="truncate text-xs text-slate-400">{activity.description}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[10px] text-slate-300">{activity.time}</p>
                <p className="text-[10px] font-medium text-slate-400">{activity.user}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
