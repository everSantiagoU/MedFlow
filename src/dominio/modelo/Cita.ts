import type { Doctor } from './Doctor.js'
import type { Paciente } from './Paciente.js'
import type { Procedimiento } from './Procedimiento.js'

export const ESTADOS_CITA = ['PROGRAMADA', 'COMPLETADA', 'CANCELADA'] as const
export type EstadoCita = (typeof ESTADOS_CITA)[number]

export interface Cita {
  id: number
  fechaHora: Date
  estado: string
  pacienteId: number
  doctorId: number
  procedimientoId: number
}

export interface CitaDetalle extends Cita {
  paciente: Paciente
  doctor: Doctor
  procedimiento: Procedimiento
}

export type CitaNueva = Omit<Cita, 'id'>
