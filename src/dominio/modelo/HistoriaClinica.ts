import type { CitaDetalle } from './Cita.js'
import type { Doctor } from './Doctor.js'
import type { Paciente } from './Paciente.js'

export interface HistoriaClinica {
  id: number
  fechaRegistro: Date
  microsegundos?: number
  diagnostico: string
  observaciones: string
  datosRelevantes: string
  citaId: number
  doctorId: number
  pacienteId: number
}

export interface HistoriaClinicaDetalle extends HistoriaClinica {
  cita: CitaDetalle
  doctor: Doctor
  paciente: Paciente
}

export type HistoriaClinicaNueva = Omit<HistoriaClinica, 'id'>
