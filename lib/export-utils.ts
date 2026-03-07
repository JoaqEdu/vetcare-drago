import * as XLSX from 'xlsx'

/**
 * Exporta datos a formato CSV
 * @param data Array de objetos a exportar
 * @param filename Nombre del archivo sin extensión
 */
export function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.href = url
  link.download = `${filename}.csv`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exporta datos a formato Excel (.xlsx)
 * @param data Array de objetos a exportar
 * @param filename Nombre del archivo sin extensión
 * @param sheetName Nombre de la hoja (opcional)
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Datos') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Formatea datos de pacientes para exportación
 */
export function formatPatientsForExport(patients: any[]) {
  return patients.map(patient => ({
    'Nombre': patient.name,
    'Especie': patient.species,
    'Raza': patient.breed || 'N/A',
    'Edad': patient.birthDate
      ? `${Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} años`
      : 'N/A',
    'Peso (kg)': patient.weight || 'N/A',
    'Color': patient.color || 'N/A',
    'Chip': patient.chipNumber || 'N/A',
    'Propietario': `${patient.owner.firstName} ${patient.owner.lastName}`,
    'Teléfono': patient.owner.phone || 'N/A',
    'Estado': patient.isActive ? 'Activo' : 'Inactivo',
    'Fecha de Registro': new Date(patient.createdAt).toLocaleDateString('es-ES'),
  }))
}

/**
 * Formatea datos de citas para exportación
 */
export function formatAppointmentsForExport(appointments: any[]) {
  return appointments.map(apt => ({
    'Paciente': apt.patient.name,
    'Propietario': `${apt.patient.owner.firstName} ${apt.patient.owner.lastName}`,
    'Tipo': apt.type,
    'Fecha': new Date(apt.scheduledAt).toLocaleDateString('es-ES'),
    'Hora': new Date(apt.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    'Duración (min)': apt.duration,
    'Veterinario': apt.vet.name,
    'Estado': apt.status,
    'Motivo': apt.reason || 'N/A',
    'Notas': apt.notes || 'N/A',
  }))
}

/**
 * Formatea datos de propietarios para exportación
 */
export function formatOwnersForExport(owners: any[]) {
  return owners.map(owner => ({
    'Nombre': `${owner.firstName} ${owner.lastName}`,
    'Email': owner.email || 'N/A',
    'Teléfono': owner.phone || 'N/A',
    'Dirección': owner.address || 'N/A',
    'Ciudad': owner.city || 'N/A',
    'Pacientes': owner._count?.patients || 0,
    'Fecha de Registro': new Date(owner.createdAt).toLocaleDateString('es-ES'),
  }))
}
