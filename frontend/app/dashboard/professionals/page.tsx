'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, MoreHorizontal,
  Mail, Star, Calendar,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuCard from '@/components/neumorphism/Card'
import NeuInput from '@/components/neumorphism/Input'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import { cn, getInitials } from '@/lib/utils'

// Demo data
const professionals = [
  {
    id: '1', name: 'Andrea López', email: 'andrea@pscielo.com', phone: '351-555-0001',
    specialties: ['Psicología Clínica', 'Ansiedad'], hourlyRate: 15000,
    commission: 30, sessions: 24, rating: 4.9, status: 'active',
    color: 'from-neomorphic-primary to-neomorphic-primary-dark',
  },
  {
    id: '2', name: 'Yamila Gutiérrez', email: 'yamila@pscielo.com', phone: '351-555-0002',
    specialties: ['Terapia Cognitiva', 'Adolescentes'], hourlyRate: 14000,
    commission: 30, sessions: 18, rating: 4.8, status: 'active',
    color: 'from-neomorphic-secondary to-neomorphic-secondary-dark',
  },
  {
    id: '3', name: 'Martín Rodríguez', email: 'martin@pscielo.com', phone: '351-555-0003',
    specialties: ['Neuropsicología', 'Evaluaciones'], hourlyRate: 18000,
    commission: 25, sessions: 12, rating: 4.7, status: 'active',
    color: 'from-pastel-purple to-purple-300',
  },
  {
    id: '4', name: 'Lucía Fernández', email: 'lucia@pscielo.com', phone: '351-555-0004',
    specialties: ['Psicología Infantil', 'Juego'], hourlyRate: 13000,
    commission: 30, sessions: 20, rating: 4.9, status: 'active',
    color: 'from-neomorphic-success to-green-300',
  },
  {
    id: '5', name: 'Diego Morales', email: 'diego@pscielo.com', phone: '351-555-0005',
    specialties: ['Terapia de Pareja', 'Adultos'], hourlyRate: 16000,
    commission: 25, sessions: 8, rating: 4.6, status: 'inactive',
    color: 'from-pastel-yellow to-yellow-300',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
}

export default function ProfessionalsPage() {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = professionals.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen pb-8">
      <Header title="Profesionales" subtitle="Gestión del equipo de profesionales" />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <NeuInput
              placeholder="Buscar por nombre o especialidad..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* View toggle */}
            <div className="flex gap-1 rounded-xl bg-white/60 dark:bg-slate-900/60 p-1 shadow-neomorphic-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium transition-all',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-neomorphic-sm'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                Tarjetas
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-neomorphic-sm'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                Lista
              </button>
            </div>

            <NeuButton
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreate(true)}
            >
              Nuevo
            </NeuButton>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((prof) => (
              <motion.div key={prof.id} variants={item}>
                <NeuCard
                  hover
                  glow={prof.status === 'active' ? 'blue' : 'none'}
                  className="relative overflow-hidden"
                >
                  {/* Top gradient accent */}
                  <div className={cn(
                    'absolute left-0 right-0 top-0 h-1 bg-gradient-to-r',
                    prof.color,
                  )} />

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                        'bg-gradient-to-br text-lg font-bold text-white shadow-elevate-2',
                        prof.color,
                      )}
                    >
                      {getInitials(prof.name)}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200">{prof.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {prof.specialties.map((s) => (
                          <NeuBadge key={s} variant="blue" size="sm">{s}</NeuBadge>
                        ))}
                      </div>
                    </div>
                    <NeuBadge
                      variant={prof.status === 'active' ? 'green' : 'gray'}
                      pulse={prof.status === 'active'}
                      size="sm"
                    >
                      {prof.status === 'active' ? 'Activo' : 'Inactivo'}
                    </NeuBadge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-2.5 text-center">
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{prof.sessions}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Sesiones/mes</p>
                    </div>
                    <div className="rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-2.5 text-center">
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">${(prof.hourlyRate / 1000).toFixed(0)}k</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Por sesión</p>
                    </div>
                    <div className="rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{prof.rating}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Rating</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Mail className="h-3 w-3" /> {prof.email}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <NeuButton variant="ghost" size="sm" className="flex-1">
                      <Calendar className="h-3.5 w-3.5 mr-1" /> Agenda
                    </NeuButton>
                    <NeuButton variant="ghost" size="sm" className="flex-1">
                      Editar
                    </NeuButton>
                  </div>
                </NeuCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm overflow-hidden dark:border dark:border-white/[0.05]"
          >
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              <div className="col-span-3">Profesional</div>
              <div className="col-span-3">Especialidades</div>
              <div className="col-span-1 text-center">Sesiones</div>
              <div className="col-span-2 text-center">Tarifa</div>
              <div className="col-span-1 text-center">Comisión</div>
              <div className="col-span-1 text-center">Estado</div>
              <div className="col-span-1"></div>
            </div>

            {filtered.map((prof, i) => (
              <motion.div
                key={prof.id}
                variants={item}
                whileHover={{ backgroundColor: 'rgba(245,247,252,0.5)' }}
                className={cn(
                  'grid grid-cols-12 items-center gap-4 px-6 py-4 cursor-pointer transition-colors',
                  i < filtered.length - 1 && 'border-b border-slate-50 dark:border-slate-800/80',
                )}
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    'bg-gradient-to-br text-sm font-bold text-white',
                    prof.color,
                  )}>
                    {getInitials(prof.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{prof.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{prof.email}</p>
                  </div>
                </div>
                <div className="col-span-3 flex flex-wrap gap-1">
                  {prof.specialties.map((s) => (
                    <NeuBadge key={s} variant="blue" size="sm">{s}</NeuBadge>
                  ))}
                </div>
                <div className="col-span-1 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {prof.sessions}
                </div>
                <div className="col-span-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  ${prof.hourlyRate.toLocaleString('es-AR')}
                </div>
                <div className="col-span-1 text-center text-sm text-slate-500 dark:text-slate-400">
                  {prof.commission}%
                </div>
                <div className="col-span-1 flex justify-center">
                  <NeuBadge
                    variant={prof.status === 'active' ? 'green' : 'gray'}
                    pulse={prof.status === 'active'}
                    size="sm"
                  >
                    {prof.status === 'active' ? 'Activo' : 'Inactivo'}
                  </NeuBadge>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="rounded-xl p-2 text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <NeuModal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Profesional" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Nombre" placeholder="Nombre" variant="inset" />
            <NeuInput label="Apellido" placeholder="Apellido" variant="inset" />
          </div>
          <NeuInput label="Email" type="email" placeholder="email@pscielo.com" variant="inset" />
          <NeuInput label="Teléfono" placeholder="351-555-0000" variant="inset" />
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Tarifa por sesión (ARS)" type="number" placeholder="15000" variant="inset" />
            <NeuInput label="Comisión (%)" type="number" placeholder="30" variant="inset" />
          </div>
          <NeuInput label="Especialidades" placeholder="Ej: Psicología Clínica, Ansiedad" variant="inset" />
          <div className="flex justify-end gap-2 pt-2">
            <NeuButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</NeuButton>
            <NeuButton variant="primary" icon={<Plus className="h-4 w-4" />}>Crear Profesional</NeuButton>
          </div>
        </div>
      </NeuModal>
    </div>
  )
}
