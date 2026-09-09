export interface DoctorDTO {
  id: number
  nombreCompleto: string
  especialidad: string
  registroMedico: string
  email: string
}

export interface PacienteDTO {
  id: number
  nombreCompleto: string
  documento: string
  telefono: string
  email: string
  direccion: string
}

export interface ProcedimientoDTO {
  id: number
  nombre: string
  precio: number
  duracionMinutos: number
}

export interface CitaDTO {
  id: number
  fechaHora: string
  estado: string
  pacienteId: number
  pacienteNombre: string
  doctorId: number
  doctorNombre: string
  doctorEspecialidad: string
  procedimientoId: number
  procedimientoNombre: string
  procedimientoDuracionMinutos: number
}

export interface EventoCalendarioDTO {
  id: number
  tipo: 'CITA' | 'EVENTO'
  titulo: string
  descripcion: string | null
  inicio: string
  fin: string
  estado: string | null
  doctorId: number
  doctorNombre: string
  pacienteId: number | null
  pacienteNombre: string | null
  citaId: number | null
  eventoId: number | null
  procedimientoId: number | null
  procedimientoNombre: string | null
}

export interface HistoriaClinicaDTO {
  id: number
  fechaRegistro: string
  diagnostico: string
  observaciones: string
  datosRelevantes: string
  citaId: number
  citaFechaHora: string
  citaEstado: string
  pacienteId: number
  pacienteNombre: string
  doctorId: number
  doctorNombre: string
  doctorEspecialidad: string
  procedimientoId: number
  procedimientoNombre: string
}
