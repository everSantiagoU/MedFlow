export interface DatosDoctor {
  nombreCompleto: string
  especialidad: string
  registroMedico: string
  email: string
}

export interface DatosPaciente {
  nombreCompleto: string
  documento: string
  telefono: string
  email: string
  direccion: string
}

export interface DatosProcedimiento {
  nombre: string
  precio: number
  duracionMinutos: number
}

export interface DatosCita {
  pacienteId: number
  doctorId: number
  procedimientoId: number
  fechaHora: Date
  estado?: string
}

export interface DatosEventoCalendario {
  doctorId: number
  titulo: string
  descripcion?: string | null
  inicio: Date
  fin: Date
}

export interface DatosHistoriaClinica {
  citaId: number
  diagnostico: string
  observaciones: string
  datosRelevantes: string
}