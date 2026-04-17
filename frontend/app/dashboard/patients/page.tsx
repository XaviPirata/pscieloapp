'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Heart,
  Loader2, AlertTriangle, Edit3, Trash2,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import NeuButton from '@/components/neumorphism/Button'
import NeuInput from '@/components/neumorphism/Input'
import NeuBadge from '@/components/neumorphism/Badge'
import NeuModal from '@/components/neumorphism/Modal'
import { cn, getInitials } from '@/lib/utils'
import api from '@/lib/api'

/* ─── Types ─── */

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  referral_source: string | null
  is_active: boolean
  notes: string | null
  created_at: string | null
}

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

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null)

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = { page_size: '100' }
      if (search.trim()) params.search = search.trim()
      const res = await api.get('/patients', { params })
      setPatients(res.data.items || [])
    } catch {
      setError('Error cargando pacientes')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(fetchPatients, search ? 300 : 0)
    return () => clearTimeout(timeout)
  }, [fetchPatients, search])

  const activeCount = patients.filter(p => p.is_active).length
  const igCount = patients.filter(p => p.referral_source === 'Instagram').length

  const filtered = patients

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Header title="Pacientes" subtitle={`${activeCount} activos`} />

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total', value: patients.length, color: 'bg-pastel-blue/30' },
            { label: 'Activos', value: activeCount, color: 'bg-pastel-green/30' },
            { label: 'Inactivos', value: patients.length - activeCount, color: 'bg-pastel-purple/30' },
            { label: 'Desde Instagram', value: igCount, color: 'bg-pastel-rose/30' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('rounded-2xl p-3 sm:p-4 dark:bg-opacity-10', stat.color)}
            >
              <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <NeuInput
              placeholder="Buscar pacientes..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <NeuButton variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
              <span className="hidden sm:inline">Nuevo Paciente</span>
              <span className="sm:hidden">Nuevo</span>
            </NeuButton>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={fetchPatients} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && patients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
            </p>
            {!search && (
              <NeuButton size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
                Registrar primer paciente
              </NeuButton>
            )}
          </div>
        )}

        {/* ─── MOBILE: Card list (< lg) ─── */}
        {!loading && filtered.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3 lg:hidden"
          >
            {filtered.map((patient) => (
              <motion.div
                key={patient.id}
                variants={item}
                className="rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic-sm backdrop-blur-sm p-4 dark:border dark:border-white/[0.05]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/40 text-sm font-bold text-slate-600 dark:text-slate-200">
                    {getInitials(`${patient.first_name} ${patient.last_name}`)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <NeuBadge
                        variant={patient.is_active ? 'green' : 'gray'}
                        pulse={patient.is_active}
                        size="sm"
                      >
                        {patient.is_active ? 'Activo' : 'Inactivo'}
                      </NeuBadge>
                    </div>
                    {patient.email && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{patient.email}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {patient.referral_source && (
                        <NeuBadge variant={(referralColors[patient.referral_source] || 'gray') as any} size="sm">
                          {patient.referral_source}
                        </NeuBadge>
                      )}
                      {patient.phone && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{patient.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => setEditPatient(patient)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeletePatient(patient)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ─── DESKTOP: Table (>= lg) ─── */}
        {!loading && filtered.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="hidden lg:block rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-neomorphic backdrop-blur-sm overflow-hidden dark:border dark:border-white/[0.05]"
          >
            <div className="grid grid-cols-12 gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              <div className="col-span-3">Paciente</div>
              <div className="col-span-2">Teléfono</div>
              <div className="col-span-2">Origen</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-1 text-center">Estado</div>
              <div className="col-span-2"></div>
            </div>

            {filtered.map((patient, i) => (
              <motion.div
                key={patient.id}
                variants={item}
                whileHover={{ backgroundColor: 'rgba(245,247,252,0.5)' }}
                className={cn(
                  'grid grid-cols-12 items-center gap-4 px-6 py-3.5 transition-colors',
                  i < filtered.length - 1 && 'border-b border-slate-50 dark:border-slate-800/80',
                )}
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neomorphic-primary/40 to-neomorphic-secondary/40 text-sm font-bold text-slate-600 dark:text-slate-200">
                    {getInitials(`${patient.first_name} ${patient.last_name}`)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {patient.first_name} {patient.last_name}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400">{patient.phone || '—'}</div>
                <div className="col-span-2">
                  {patient.referral_source ? (
                    <NeuBadge variant={(referralColors[patient.referral_source] || 'gray') as any} size="sm">
                      {patient.referral_source}
                    </NeuBadge>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
                <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400 truncate">{patient.email || '—'}</div>
                <div className="col-span-1 flex justify-center">
                  <NeuBadge
                    variant={patient.is_active ? 'green' : 'gray'}
                    pulse={patient.is_active}
                    size="sm"
                  >
                    {patient.is_active ? 'Activo' : 'Inactivo'}
                  </NeuBadge>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <button onClick={() => setEditPatient(patient)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletePatient(patient)} className="rounded-xl p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <PatientFormModal open={showCreate} onClose={() => setShowCreate(false)} onSaved={fetchPatients} />
      <PatientFormModal open={!!editPatient} patient={editPatient ?? undefined} onClose={() => setEditPatient(null)} onSaved={fetchPatients} />
      <DeleteConfirmModal patient={deletePatient} onClose={() => setDeletePatient(null)} onDeleted={fetchPatients} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   CREATE / EDIT MODAL
   ════════════════════════════════════════════════════════════════ */

function PatientFormModal({
  open, patient, onClose, onSaved,
}: {
  open: boolean
  patient?: Patient
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!patient
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [referral, setReferral] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (patient) {
      setFirstName(patient.first_name)
      setLastName(patient.last_name)
      setEmail(patient.email || '')
      setPhone(patient.phone || '')
      setDob(patient.date_of_birth || '')
      setGender(patient.gender || '')
      setReferral(patient.referral_source || '')
      setNotes(patient.notes || '')
    } else {
      setFirstName(''); setLastName(''); setEmail(''); setPhone('')
      setDob(''); setGender(''); setReferral(''); setNotes('')
    }
    setError('')
  }, [patient, open])

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) { setError('Nombre y apellido son obligatorios'); return }
    setSaving(true)
    setError('')

    const payload: Record<string, unknown> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      date_of_birth: dob || null,
      gender: gender.trim() || null,
      referral_source: referral.trim() || null,
      notes: notes.trim() || null,
    }

    try {
      if (isEdit && patient) {
        await api.put(`/patients/${patient.id}`, payload)
      } else {
        await api.post('/patients', payload)
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail || 'Error guardando paciente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <NeuModal open={open} onClose={onClose} title={isEdit ? 'Editar Paciente' : 'Nuevo Paciente'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput label="Nombre *" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nombre" />
          <NeuInput label="Apellido *" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Apellido" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" />
          <NeuInput label="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} placeholder="351-555-0000" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NeuInput label="Fecha de Nacimiento" type="date" value={dob} onChange={e => setDob(e.target.value)} />
          <NeuInput label="Género" value={gender} onChange={e => setGender(e.target.value)} placeholder="Masculino, Femenino, Otro..." />
        </div>
        <NeuInput label="Origen de Derivación" value={referral} onChange={e => setReferral(e.target.value)} placeholder="Instagram, Google, Amigo, Derivación..." />
        <NeuInput label="Notas" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones adicionales..." />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancelar</NeuButton>
          <NeuButton size="sm" onClick={handleSubmit} loading={saving} icon={<Heart className="h-4 w-4" />}>
            {isEdit ? 'Guardar cambios' : 'Registrar Paciente'}
          </NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}

/* ════════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
   ════════════════════════════════════════════════════════════════ */

function DeleteConfirmModal({
  patient, onClose, onDeleted,
}: {
  patient: Patient | null
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!patient) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/patients/${patient.id}`)
      onDeleted()
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail || 'Error desactivando paciente')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <NeuModal open={!!patient} onClose={onClose} title="Desactivar Paciente" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ¿Desactivar a <span className="font-bold">{patient?.first_name} {patient?.last_name}</span>? El paciente quedará inactivo pero no se eliminará.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-3">
          <NeuButton variant="ghost" size="sm" onClick={onClose} disabled={deleting}>Cancelar</NeuButton>
          <NeuButton variant="danger" size="sm" onClick={handleDelete} loading={deleting}>Desactivar</NeuButton>
        </div>
      </div>
    </NeuModal>
  )
}
