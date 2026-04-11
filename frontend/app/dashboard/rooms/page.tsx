'use client'

import { motion } from 'framer-motion'
import { Building2, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function RoomsPage() {
  return (
    <div className="min-h-screen pb-8">
      <Header title="Consultorios" subtitle="Gestión de salas y disponibilidad" />
      <div className="px-8">
        <ComingSoon
          icon={<Building2 className="h-12 w-12" />}
          title="Consultorios"
          description="Acá vas a poder gestionar los consultorios, ver disponibilidad en tiempo real, asignar alquileres fijos y registrar el uso por sesión."
          features={[
            'Vista de grilla por consultorio y horario',
            'Alquileres fijos mensuales por profesional',
            'Historial de uso y ocupación',
            'Bloqueo de salas por mantenimiento',
          ]}
        />
      </div>
    </div>
  )
}

function ComingSoon({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/30 shadow-neomorphic text-neomorphic-primary-dark dark:text-neomorphic-primary"
        >
          {icon}
        </motion.div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neomorphic-warning/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-4">
          <Clock className="h-3 w-3" />
          En desarrollo
        </span>

        <h2 className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 dark:text-slate-500">{description}</p>

        {/* Features */}
        <div className="mt-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Funcionalidades planificadas
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neomorphic-primary/30">
                  <svg className="h-3 w-3 text-neomorphic-primary-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
