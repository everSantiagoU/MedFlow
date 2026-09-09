import type { Doctor } from './Doctor.js'

export interface EventoCalendario {
  id: number
  doctorId: number
  titulo: string
  descripcion: string | null
  inicio: Date
  fin: Date
}

export interface EventoCalendarioDetalle extends EventoCalendario {
  doctor: Doctor
}

export type EventoCalendarioNuevo = Omit<EventoCalendario, 'id'>
