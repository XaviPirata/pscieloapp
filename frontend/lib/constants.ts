/** Role labels in Spanish */
export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  PROFESSIONAL: 'Profesional',
  READONLY: 'Solo Lectura',
}

/** Session status labels */
export const SESSION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada',
  ATTENDED: 'Asistió',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

/** Session status colors */
export const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-pastel-blue text-blue-700',
  CONFIRMED: 'bg-pastel-purple text-purple-700',
  ATTENDED: 'bg-pastel-green text-green-700',
  CANCELLED: 'bg-pastel-gray text-gray-600',
  NO_SHOW: 'bg-pastel-rose text-red-700',
}

/** Navigation items */
export const NAV_ITEMS = [
  { label: 'Inicio', href: '/dashboard', icon: 'Home' },
  { label: 'Profesionales', href: '/dashboard/professionals', icon: 'Users' },
  { label: 'Pacientes', href: '/dashboard/patients', icon: 'Heart' },
  { label: 'Sesiones', href: '/dashboard/sessions', icon: 'Calendar' },
  { label: 'Consultorios', href: '/dashboard/rooms', icon: 'Building2' },
  { label: 'Comisiones', href: '/dashboard/commissions', icon: 'DollarSign' },
  { label: 'Reportes', href: '/dashboard/reports', icon: 'BarChart3' },
]
