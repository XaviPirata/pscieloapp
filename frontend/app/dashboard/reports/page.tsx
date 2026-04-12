'use client'

import { motion } from 'framer-motion'
import { BarChart3, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'

export default function ReportsPage() {
  return (
    <div className="min-h-screen pb-8">
      <Header title="Reportes" subtitle="Analíticas e informes del centro" />
      <div className="px-4 sm:px-6 lg:px-8">
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
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pastel-purple/40 to-neomorphic-secondary/30 shadow-neomorphic text-purple-600 dark:text-purple-400"
            >
              <BarChart3 className="h-12 w-12" />
            </motion.div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-neomorphic-warning/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-4">
              <Clock className="h-3 w-3" />
              En desarrollo
            </span>

            <h2 className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">Reportes y Analíticas</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 dark:text-slate-500">
              Visualizá el rendimiento completo del centro con gráficos interactivos, comparativas entre períodos y reportes descargables para contaduría.
            </p>

            <div className="mt-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic text-left">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Funcionalidades planificadas
              </p>
              <ul className="space-y-3">
                {[
                  'Dashboard de KPIs en tiempo real',
                  'Comparativas mensuales y anuales',
                  'Reporte de ingresos por profesional',
                  'Tasa de asistencia y cancelaciones',
                  'Exportación PDF para contaduría externa',
                  'Acceso de solo lectura para contador (rol READONLY)',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pastel-purple/30">
                      <svg className="h-3 w-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
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
