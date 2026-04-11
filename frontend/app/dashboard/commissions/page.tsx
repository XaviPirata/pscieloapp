'use client'

import { motion } from 'framer-motion'
import { DollarSign, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function CommissionsPage() {
  return (
    <div className="min-h-screen pb-8">
      <Header title="Comisiones" subtitle="Cálculo y seguimiento de comisiones semanales" />
      <div className="px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-full max-w-lg text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-neomorphic-success/40 to-neomorphic-secondary/30 shadow-neomorphic text-green-600 dark:text-green-400"
            >
              <DollarSign className="h-12 w-12" />
            </motion.div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-neomorphic-warning/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-4">
              <Clock className="h-3 w-3" />
              En desarrollo
            </span>

            <h2 className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">Comisiones</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 dark:text-slate-500">
              El módulo de comisiones calculará automáticamente los porcentajes semanales por profesional, considerando sesiones realizadas, tipo de consulta y acuerdos individuales.
            </p>

            <div className="mt-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic text-left">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Funcionalidades planificadas
              </p>
              <ul className="space-y-3">
                {[
                  'Cálculo automático semanal por profesional',
                  'Historial de comisiones con trazabilidad completa',
                  'Desglose por tipo de sesión y consultorio',
                  'Exportación a PDF/Excel para liquidación',
                  'Alertas de discrepancias automáticas',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neomorphic-success/30">
                      <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
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
      </div>
    </div>
  )
}
