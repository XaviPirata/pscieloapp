'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Users, Heart, DollarSign,
  TrendingUp, Sparkles, Loader2,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/dashboard/StatCard'
import WeeklyChart from '@/components/dashboard/WeeklyChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import UpcomingSessions from '@/components/dashboard/UpcomingSessions'
import NeuButton from '@/components/neumorphism/Button'
import { getGreeting } from '@/lib/utils'
import api from '@/lib/api'

interface DashboardStats {
  sessionsToday: number
  patientsActive: number
  professionalsActive: number
  monthlyRevenue: number
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    sessionsToday: 0,
    patientsActive: 0,
    professionalsActive: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Admin')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel
        const today = new Date().toISOString().split('T')[0]
        const [sessionsRes, patientsRes, profsRes] = await Promise.all([
          api.get('/sessions', { params: { date_from: today, date_to: today, page_size: '100' } }),
          api.get('/patients', { params: { is_active: true, page_size: '1' } }),
          api.get('/professionals', { params: { is_active: true, page_size: '1' } }),
        ])

        const todaySessions = sessionsRes.data.items || []
        const revenue = todaySessions
          .filter((s: any) => s.status !== 'CANCELLED')
          .reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

        setStats({
          sessionsToday: todaySessions.filter((s: any) => s.status !== 'CANCELLED').length,
          patientsActive: patientsRes.data.total || 0,
          professionalsActive: profsRes.data.total || 0,
          monthlyRevenue: revenue,
        })
      } catch {
        // use defaults
      } finally {
        setLoading(false)
      }
    }

    // Fetch actual user name from API
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me')
        if (res.data?.first_name) {
          setUserName(res.data.first_name)
        }
      } catch {
        // fallback: keep default 'Admin'
      }
    }

    fetchStats()
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
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
            {loading ? 'Cargando datos...' : (
              <>Aquí tenés el resumen de tu centro. Hoy tenés <span className="font-semibold text-neomorphic-primary-dark">{stats.sessionsToday} sesiones</span> programadas.</>
            )}
          </p>
        </motion.div>

        {/* Stat cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4 mb-8"
          >
            <StatCard
              title="Sesiones Hoy"
              value={stats.sessionsToday}
              icon={<Calendar className="h-5 w-5" />}
              color="blue"
              delay={0}
            />
            <StatCard
              title="Pacientes Activos"
              value={stats.patientsActive}
              icon={<Heart className="h-5 w-5" />}
              color="rose"
              delay={100}
            />
            <StatCard
              title="Profesionales"
              value={stats.professionalsActive}
              icon={<Users className="h-5 w-5" />}
              color="purple"
              delay={200}
            />
            <StatCard
              title="Ingresos Hoy"
              value={stats.monthlyRevenue}
              prefix="$"
              icon={<DollarSign className="h-5 w-5" />}
              color="green"
              delay={300}
            />
          </motion.div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left column */}
          <div className="xl:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <WeeklyChart />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ActivityFeed />
            </motion.div>
          </div>

          {/* Right column */}
          <div className="xl:col-span-5 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
                <NeuButton variant="primary" size="sm" icon={<Calendar className="h-4 w-4" />} className="justify-start"
                  onClick={() => window.location.href = '/dashboard/sessions'}>
                  Nueva Sesión
                </NeuButton>
                <NeuButton variant="secondary" size="sm" icon={<Heart className="h-4 w-4" />} className="justify-start"
                  onClick={() => window.location.href = '/dashboard/patients'}>
                  Nuevo Paciente
                </NeuButton>
                <NeuButton variant="ghost" size="sm" icon={<DollarSign className="h-4 w-4" />} className="justify-start"
                  onClick={() => window.location.href = '/dashboard/commissions'}>
                  Comisiones
                </NeuButton>
                <NeuButton variant="ghost" size="sm" icon={<TrendingUp className="h-4 w-4" />} className="justify-start"
                  onClick={() => window.location.href = '/dashboard/reports'}>
                  Reportes
                </NeuButton>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
