'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Heart,
  MoreHorizontal, Filter, Download,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuInput from '@/components/neumorphism/Input'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import { cn, getInitials } from '@/lib/utils'

const patients = [
  { id: '1', name: 'Federico Mendoza', email: 'fede@email.com', phone: '351-111-0001', age: 28, referral: 'Instagram', sessions: 12, professional: 'Andrea', status: 'active', lastSession: '7 Abr 2026' },
  { id: '2', name: 'Ismael Ruiz', email: 'ismael@email.com', phone: '351-111-0002', age: 34, referral: 'Derivación', sessions: 8, professional: 'Andrea', status: 'active', lastSession: '8 Abr 2026' },
  { id: '3', name: 'Morena López', email: 'morena@email.com', phone: '351-111-0003', age: 22, referral: 'Google', sessions: 15, professional: 'Yamila', status: 'active', lastSession: '9 Abr 2026' },
  { id: '4', name: 'Victoria Sánchez', email: 'vicky@email.com', phone: '351-111-0004', age: 31, referral: 'Amigo', sessions: 6, professional: 'Yamila', status: 'active', lastSession: '5 Abr 2026' },
  { id: '5', name: 'Sofía Ramírez', email: 'sofia@email.com', phone: '351-111-0005', age: 26, referral: 'Instagram', sessions: 20, professional: 'Andrea', status: 'active', lastSession: '8 Abr 2026' },
  { id: '6', name: 'Nicolás Cattaneo', email: 'nico@email.com', phone: '351-111-0006', age: 19, referral: 'Instagram', sessions: 3, professional: 'Yamila', status: 'active', lastSession: '4 Abr 2026' },
  { id: '7', name: 'Camila Ríos', email: 'camila@email.com', phone: '351-111-0007', age: 40, referral: 'Web', sessions: 0, professional: 'Sin asignar', status: 'inactive', lastSession: 'Nunca' },
]

const referralColors: Record<string, string> = {
  Instagram: 'purple',
  Google: 'blue',
  Web: 'blue',
  Derivación: 'green',
  Amigo: 'yellow',
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
}

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.professional.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pb-8">
      <Header title="Pacientes" subtitle={`${patients.filter(p => p.status === 'active').length} activos`} />

      <div className="px-8">
        {/* Stats row */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: patients.length, color: 'bg-pastel-blue/30' },
            { label: 'Activos', value: patients.filter(p => p.status === 'active').length, color: 'bg-pastel-green/30' },
            { label: 'Nuevos este mes', value: 2, color: 'bg-pastel-purple/30' },
            { label: 'Desde Instagram', value: patients.filter(p => p.referral === 'Instagram').length, color: 'bg-pastel-rose/30' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('rounded-2xl p-4 dark:bg-opacity-10', stat.color)}
            >
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <NeuInput
              placeholder="Buscar pacientes..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <NeuButton variant="ghost" size="sm" icon={<Filter className="h-4 w-4" />}>Filtros</NeuButton>
          <NeuButton variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>Exportar</NeuButton>
          <NeuButton variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            Nuevo Paciente
          </NeuButton>
        </div>

        {/* Table */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm overflow-hidden dark:border dark:border-white/[0.05]"
        >
          <div className="grid grid-cols-12 gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            <div className="col-span-3">Paciente</div>
            <div className="col-span-2">Profesional</div>
            <div className="col-span-1 text-center">Sesiones</div>
            <div className="col-span-2">Origen</div>
            <div className="col-span-2">Última Sesión</div>
            <div className="col-span-1 text-center">Estado</div>
            <div className="col-span-1"></div>
          </div>

          {filtered.map((patient, i) => (
            <motion.div
              key={patient.id}
              variants={item}
              whileHover={{ backgroundColor: 'rgba(245,247,252,0.5)' }}
              className={cn(
                'grid grid-cols-12 items-center gap-4 px-6 py-3.5 cursor-pointer transition-colors',
                i < filtered.length - 1 && 'border-b border-slate-50 dark:border-slate-800/80',
              )}
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/40 text-sm font-bold text-slate-600 dark:text-slate-200">
                  {getInitials(patient.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{patient.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{patient.email}</p>
                </div>
              </div>
              <div className="col-span-2 text-sm text-slate-600 dark:text-slate-300">{patient.professional}</div>
              <div className="col-span-1 text-center">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{patient.sessions}</span>
              </div>
              <div className="col-span-2">
                <NeuBadge variant={(referralColors[patient.referral] || 'gray') as any} size="sm">
                  {patient.referral}
                </NeuBadge>
              </div>
              <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400">{patient.lastSession}</div>
              <div className="col-span-1 flex justify-center">
                <NeuBadge
                  variant={patient.status === 'active' ? 'green' : 'gray'}
                  pulse={patient.status === 'active'}
                  size="sm"
                >
                  {patient.status === 'active' ? 'Activo' : 'Inactivo'}
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
      </div>

      {/* Create Modal */}
      <NeuModal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Paciente" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Nombre" placeholder="Nombre" variant="inset" />
            <NeuInput label="Apellido" placeholder="Apellido" variant="inset" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Email" type="email" placeholder="email@ejemplo.com" variant="inset" />
            <NeuInput label="Teléfono" placeholder="351-555-0000" variant="inset" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NeuInput label="Fecha de Nacimiento" type="date" variant="inset" />
            <NeuInput label="Género" placeholder="Seleccionar..." variant="inset" />
          </div>
          <NeuInput label="Origen de Derivación" placeholder="Instagram, Google, Amigo..." variant="inset" />
          <NeuInput label="Notas" placeholder="Observaciones adicionales..." variant="inset" />
          <div className="flex justify-end gap-2 pt-2">
            <NeuButton variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</NeuButton>
            <NeuButton variant="primary" icon={<Heart className="h-4 w-4" />}>Registrar Paciente</NeuButton>
          </div>
        </div>
      </NeuModal>
    </div>
  )
}
