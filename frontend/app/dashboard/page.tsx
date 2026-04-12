'use client'

import { motion } from 'framer-motion'
import {
  Calendar, Users, Heart, DollarSign,
  TrendingUp, Sparkles,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/dashboard/StatCard'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import UpcomingSessions from '@/components/dashboard/UpcomingSessions'
import NeuButton from '@/components/neumorphism/Button'
import { getGreeting } from '@/lib/utils'

// TODO: Replace with real data from API
const userName = 'Rocío'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}


export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-8">
      <Header />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-200">
              {getGreeting()}, {userName}
            </h1>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-7 w-7 text-neomorphic-primary" />
            </motion.div>
          </div>
          <p className="text-slate-400 dark:text-slate-500">
            Aquí tenés el resumen de tu centro. Hoy tenés <span className="font-semibold text-neomorphic-primary-dark">4 sesiones</span> programadas.
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8"
        >
          <StatCard
            title="Sesiones Hoy"
            value={4}
            change={12}
            changeLabel="vs ayer"
            icon={<Calendar className="h-5 w-5" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title="Pacientes Activos"
            value={47}
            change={8}
            changeLabel="este mes"
            icon={<Heart className="h-5 w-5" />}
            color="rose"
            delay={100}
          />
          <StatCard
            title="Profesionales"
            value={5}
            icon={<Users className="h-5 w-5" />}
            color="purple"
            delay={200}
          />
          <StatCard
            title="Ingresos del Mes"
            value={1273000}
            prefix="$"
            change={15}
            changeLabel="vs mes anterior"
            icon={<DollarSign className="h-5 w-5" />}
            color="green"
            delay={300}
          />
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left column - Chart + Activity */}
          <div className="xl:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WeeklyChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ActivityFeed />
            </motion.div>
          </div>

          {/* Right column - Upcoming Sessions + Quick Actions */}
          <div className="xl:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <UpcomingSessions />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-3xl bg-white/80 dark:bg-slate-800/80 p-6 shadow-neomorphic backdrop-blur-sm"
            >
              <h3 className="mb-4 text-lg font-bold text-slate-700 dark:text-slate-200">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <NeuButton
                  variant="primary"
                  size="sm"
                  icon={<Calendar className="h-4 w-4" />}
                  className="justify-start"
                >
                  Nueva Sesión
                </NeuButton>
                <NeuButton
                  variant="secondary"
                  size="sm"
                  icon={<Heart className="h-4 w-4" />}
                  className="justify-start"
                >
                  Nuevo Paciente
                </NeuButton>
                <NeuButton
                  variant="ghost"
                  size="sm"
                  icon={<DollarSign className="h-4 w-4" />}
                  className="justify-start"
                >
                  Calcular Comisión
                </NeuButton>
                <NeuButton
                  variant="ghost"
                  size="sm"
                  icon={<TrendingUp className="h-4 w-4" />}
                  className="justify-start"
                >
                  Ver Reportes
                </NeuButton>
              </div>
            </motion.div>

            {/* Professional Overview mini-card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neomorphic-primary/30 via-neomorphic-secondary/20 to-pastel-purple/20 p-6 shadow-neomorphic"
            >
              {/* Decorative blob */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neomorphic-primary/20 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-neomorphic-secondary/20 blur-2xl" />

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Resumen Profesionales</p>
                <div className="mt-4 space-y-3">
                  {/* Professional mini-cards */}
                  {[
                    { name: 'Andrea', sessions: 3, color: 'from-neomorphic-primary to-neomorphic-primary-dark' },
                    { name: 'Yamila', sessions: 1, color: 'from-neomorphic-secondary to-neomorphic-secondary-dark' },
                  ].map((prof) => (
                    <div key={prof.name} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${prof.color} text-xs font-bold text-white shadow-elevate-1`}>
                        {prof.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{prof.name}</p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-white/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(prof.sessions / 4) * 100}%` }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className={`h-full rounded-full bg-gradient-to-r ${prof.color}`}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{prof.sessions}/4</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
