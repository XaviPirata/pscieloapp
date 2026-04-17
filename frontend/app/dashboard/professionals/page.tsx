'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Plus,
  Mail, Loader2, AlertTriangle,
  Edit3, DollarSign, Users,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuCard from '@/components/neumorphism/Card'
import NeuInput from '@/components/neumorphism/Input'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import { cn, getInitials, formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

/* ─── Types ─── */

interface Professional {
  id: string
  user_id: string
  specialties: string[]
  hourly_rate: number
  commission_percentage: number
  is_active: boolean
  license_number: string | null
  bio: string | null
  room_rental_monthly: number
  user_email: string | null
  user_name: string | null
  created_at: string | null
}

const gradientColors = [
  'from-neomorphic-primary to-neomorphic-primary-dark',
  'from-neomorphic-secondary to-neomorphic-secondary-dark',
  'from-pastel-purple to-purple-300',
  'from-neomorphic-success to-green-300',
  'from-pastel-yellow to-yellow-300',
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editProf, setEditProf] = useState<Professional | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/professionals', { params: { page_size: '50' } })
      setProfessionals(res.data.items || [])
    } catch {
      setError('Error cargando profesionales')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfessionals()
  }, [fetchProfessionals])

  const filtered = professionals.filter((p) => {
    const term = search.toLowerCase()
    if (!term) return true
    return (
      (p.user_name || '').toLowerCase().includes(term) ||
      p.specialties.some((s) => s.toLowerCase().includes(term)) ||
      (p.user_email || '').toLowerCase().includes(term)
    )
  })

  const activeCount = professionals.filter(p => p.is_active).length

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Profesionales" subtitle={`${activeCount} activos`} />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <NeuInput
              placeholder="Buscar por nombre o especialidad..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <NeuButton variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
              <span className="hidden sm:inline">Nuevo Profesional</span>
              <span className="sm:hidden">Nuevo</span>
            </NeuButton>
            <div className="hidden lg:flex gap-1 rounded-xl bg-white/60 dark:bg-slate-900/60 p-1 shadow-neomorphic-sm">
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
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchProfessionals} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && professionals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">No hay profesionales registrados</p>
            <NeuButton size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
              Agregar primer profesional
            </NeuButton>
          </div>
        )}

        {/* Grid View - always on mobile */}
        {!loading && filtered.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={cn(
              'grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3',
              viewMode === 'list' && 'lg:hidden',
            )}
          >
            {filtered.map((prof, idx) => {
              const color = gradientColors[idx % gradientColors.length]
              return (
                <motion.div key={prof.id} variants={item}>
                  <NeuCard
                    hover
                    glow={prof.is_active ? 'blue' : 'none'}
                    className="relative overflow-hidden"
                  >
                    <div className={cn('absolute left-0 right-0 top-0 h-1 bg-gradient-to-r', color)} />

                    {/* Header */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={cn(
                          'flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl',
                          'bg-gradient-to-br text-base sm:text-lg font-bold text-white shadow-elevate-2',
                          color,
                        )}
                      >
                        {getInitials(prof.user_name || '??')}
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                            {prof.user_name || 'Sin nombre'}
                          </h3>
                          <NeuBadge
                            variant={prof.is_active ? 'green' : 'gray'}
                            pulse={prof.is_active}
                            size="sm"
                          >
                            {prof.is_active ? 'Activo' : 'Inactivo'}
                          </NeuBadge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {prof.specialties.map((s) => (
                            <NeuBadge key={s} variant="blue" size="sm">{s}</NeuBadge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className={cn('grid gap-2 mb-4', prof.commission_percentage === 0 ? 'grid-cols-1' : 'grid-cols-2')}>
                      <div className="rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-2 sm:p-2.5 text-center">
                        <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
                          {formatCurrency(prof.hourly_rate)}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500">Por sesión</p>
                      </div>
                      {prof.commission_percentage > 0 ? (
                        <div className="rounded-xl bg-neomorphic-light-shade/50 dark:bg-slate-800/60 p-2 sm:p-2.5 text-center">
                          <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">{prof.commission_percentage}%</p>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500">Comisión</p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 p-2 sm:p-2.5 text-center">
                          <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">Solo alquiler</p>
                          <p className="text-[9px] sm:text-[10px] text-amber-500/70 dark:text-amber-500/50">Sin comisión</p>
                        </div>
                      )}
                    </div>

                    {/* Contact */}
                    {prof.user_email && (
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1 dark:text-slate-500 truncate">
                          <Mail className="h-3 w-3 shrink-0" /> {prof.user_email}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <NeuButton variant="ghost" size="sm" className="flex-1" onClick={() => setEditProf(prof)}>
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Editar
                      </NeuButton>
                    </div>
                  </NeuCard>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* List View - desktop only */}
        {!loading && filtered.length > 0 && viewMode === 'list' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="hidden lg:block rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm overflow-hidden dark:border dark:border-white/[0.05]"
          >
            <div className="grid grid-cols-12 gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              <div className="col-span-3">Profesional</div>
              <div className="col-span-3">Especialidades</div>
              <div className="col-span-2 text-center">Tarifa</div>
              <div className="col-span-1 text-center">Comisión</div>
              <div className="col-span-1 text-center">Estado</div>
              <div className="col-span-2"></div>
            </div>

            {filtered.map((prof, i) => {
              const color = gradientColors[i % gradientColors.length]
              return (
                <motion.div
                  key={prof.id}
                  variants={item}
                  whileHover={{ backgroundColor: 'rgba(245,247,252,0.5)' }}
                  className={cn(
                    'grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors',
                    i < filtered.length - 1 && 'border-b border-slate-50 dark:border-slate-800/80',
                  )}
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      'bg-gradient-to-br text-sm font-bold text-white',
                      color,
                    )}>
                      {getInitials(prof.user_name || '??')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{prof.user_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{prof.user_email}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {prof.specialties.map((s) => (
                      <NeuBadge key={s} variant="blue" size="sm">{s}</NeuBadge>
                    ))}
                  </div>
                  <div className="col-span-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {formatCurrency(prof.hourly_rate)}
                  </div>
                  <div className="col-span-1 text-center text-sm text-slate-500 dark:text-slate-400">
                    {prof.commission_percentage}%
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <NeuBadge variant={prof.is_active ? 'green' : 'gray'} pulse={prof.is_active} size="sm">
                      {prof.is_active ? 'Activo' : 'Inactivo'}
                    </NeuBadge>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button onClick={() => setEditProf(prof)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ProfessionalCreateModal open={showCreate} onClose={() => setShowCreate(false)} onSaved={fetchProfessionals} />
      <ProfessionalEditModal prof={editProf} onClose={() => setEditProf(null)} onSaved={fetchProfessionals} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   CREATE MODAL — Crea usuario + perfil profesional en un paso
   ════════════════════════════════════════════════════════════════ */

function ProfessionalCreateModal({
  open, onClose, onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [hourlyRate, setHourlyRate] = useState('40000')
  const [commission, setCommission] = useState('30')
  const [licenseNumber, setLicenseNumber] = useState('')

  useEffect(() => {
    if (!open) return
    setFirstName(''); setLastName(''); setEmail(''); setPhone('')
    setSpecialties(''); setHourlyRate('40000'); setCommission('30')
    setLicenseNumber(''); setError('')
  }, [open])

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) { setError('Nombre y apellido son obligatorios'); return }
    if (!email.trim()) { setError('Email es obligatorio'); return }

    setSaving(true)
    setError('')

    try {
      await api.post('/professionals/full', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        license_number: licenseNumber.trim() || null,
        specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
        hourly_rate: parseFloat(hourlyRate) || 40000,
        commission_percentage: parseFloat(commission) ?? 30,
      })
      onSaved()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail || 'Error creando profesional')
    } finally {
      setSaving(false)
    }
  }

  return (
    <NeuModal open={open} onClose={onClose} title="Nuevo Profesional" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput label="Nombre *" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nombre" />
          <NeuInput label="Apellido *" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Apellido" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput label="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="profesional@email.com" />
          <NeuInput label="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} placeholder="351-555-0000" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NeuInput
            label="Tarifa por sesión (ARS)"
            type="number"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            icon={<DollarSign className="h-4 w-4" />}
            placeholder="40000"
          />
          <NeuInput
            label="Comisión (%)"
            type="number"
            value={commission}
            onChange={e => setCommission(e.target.value)}
            min="0"
            max="100"
            placeholder="0 = solo alquiler"
          />
          <NeuInput
            label="Matrícula"
            value={licenseNumber}
            onChange={e => setLicenseNumber(e.target.value)}
            placeholder="MP 12345"
          />
        </div>
        <NeuInput
          label="Especialidades (separadas por coma)"
          value={specialties}
          onChange={e => setSpecialties(e.target.value)}
          placeholder="Psicología Clínica, Ansiedad, Terapia Cognitiva..."
        />

        <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/20 p-3 text-xs text-blue-600 dark:text-blue-400">
          Se creará una cuenta de acceso con la contraseña por defecto <strong>PsCielo2026!</strong>. El profesional deberá cambiarla al ingresar.
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancelar</NeuButton>
          <NeuButton size="sm" onClick={handleSubmit} loading={saving} icon={<Users className="h-4 w-4" />}>
            Crear Profesional
          </NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}

/* ════════════════════════════════════════════════════════════════
   EDIT MODAL (tarifa, comisión, especialidades, estado)
   ════════════════════════════════════════════════════════════════ */

function ProfessionalEditModal({
  prof, onClose, onSaved,
}: {
  prof: Professional | null
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [hourlyRate, setHourlyRate] = useState('')
  const [commission, setCommission] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (prof) {
      setHourlyRate(String(prof.hourly_rate))
      setCommission(String(prof.commission_percentage))
      setSpecialties(prof.specialties.join(', '))
      setIsActive(prof.is_active)
    }
    setError('')
  }, [prof])

  const handleSubmit = async () => {
    if (!prof) return
    setSaving(true)
    setError('')

    const commissionVal = parseFloat(commission)
    const rateVal = parseFloat(hourlyRate)

    const payload: Record<string, unknown> = {
      hourly_rate: isNaN(rateVal) ? prof.hourly_rate : rateVal,
      commission_percentage: isNaN(commissionVal) ? prof.commission_percentage : commissionVal,
      specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
      is_active: isActive,
    }

    try {
      await api.put(`/professionals/${prof.id}`, payload)
      onSaved()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail || 'Error guardando profesional')
    } finally {
      setSaving(false)
    }
  }

  return (
    <NeuModal open={!!prof} onClose={onClose} title={`Editar — ${prof?.user_name || ''}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput
            label="Tarifa por sesión (ARS)"
            type="number"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <NeuInput
            label="Comisión (%) — 0 = solo alquiler"
            type="number"
            value={commission}
            onChange={e => setCommission(e.target.value)}
            min="0"
            max="100"
          />
        </div>
        <NeuInput
          label="Especialidades (separadas por coma)"
          value={specialties}
          onChange={e => setSpecialties(e.target.value)}
          placeholder="Psicología Clínica, Ansiedad..."
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Estado</label>
          <select
            value={isActive ? 'active' : 'inactive'}
            onChange={e => setIsActive(e.target.value === 'active')}
            className="w-full rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm px-4 py-3 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancelar</NeuButton>
          <NeuButton size="sm" onClick={handleSubmit} loading={saving}>Guardar cambios</NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}
