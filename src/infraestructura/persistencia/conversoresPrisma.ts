import type { CitaDetalle } from '../../dominio/modelo/Cita.js'
import type { Doctor } from '../../dominio/modelo/Doctor.js'
import type { EventoCalendarioDetalle } from '../../dominio/modelo/EventoCalendario.js'
import type { HistoriaClinicaDetalle } from '../../dominio/modelo/HistoriaClinica.js'
import type { Paciente } from '../../dominio/modelo/Paciente.js'
import type { Procedimiento } from '../../dominio/modelo/Procedimiento.js'

export interface FilaDoctor { id: number; nombreCompleto: string; especialidad: string; registroMedico: string; email: string }
export interface FilaPaciente { id: number; nombreCompleto: string; documento: string; telefono: string; email: string; direccion: string }
export interface FilaProcedimiento { id: number; nombre: string; precio: unknown; duracionMinutos: number }
export interface FilaCita {
  id: number; fechaHora: Date; estado: string; pacienteId: number; doctorId: number; procedimientoId: number
  paciente: FilaPaciente; doctor: FilaDoctor; procedimiento: FilaProcedimiento
}
export interface FilaEvento {
  id: number; doctorId: number; titulo: string; descripcion: string | null; inicio: Date; fin: Date; doctor: FilaDoctor
}
export interface FilaHistoria {
  id: number; fechaRegistro: Date; diagnostico: string; observaciones: string; datosRelevantes: string
  citaId: number; doctorId: number; pacienteId: number; cita: FilaCita; doctor: FilaDoctor; paciente: FilaPaciente
}

export const aDoctor = (fila: FilaDoctor): Doctor => ({ ...fila })
export const aPaciente = (fila: FilaPaciente): Paciente => ({ ...fila })
export const aProcedimiento = (fila: FilaProcedimiento): Procedimiento => ({ ...fila, precio: Number(fila.precio) })
export const aCita = (fila: FilaCita): CitaDetalle => ({
  id: fila.id, fechaHora: fila.fechaHora, estado: fila.estado,
  pacienteId: fila.pacienteId, doctorId: fila.doctorId, procedimientoId: fila.procedimientoId,
  paciente: aPaciente(fila.paciente), doctor: aDoctor(fila.doctor), procedimiento: aProcedimiento(fila.procedimiento),
})
export const aEvento = (fila: FilaEvento): EventoCalendarioDetalle => ({
  id: fila.id, doctorId: fila.doctorId, titulo: fila.titulo, descripcion: fila.descripcion,
  inicio: fila.inicio, fin: fila.fin, doctor: aDoctor(fila.doctor),
})
export const aHistoria = (fila: FilaHistoria, microsegundos?: number): HistoriaClinicaDetalle => ({
  id: fila.id, fechaRegistro: fila.fechaRegistro, diagnostico: fila.diagnostico,
  observaciones: fila.observaciones, datosRelevantes: fila.datosRelevantes,
  citaId: fila.citaId, doctorId: fila.doctorId, pacienteId: fila.pacienteId,
  cita: aCita(fila.cita), doctor: aDoctor(fila.doctor), paciente: aPaciente(fila.paciente),
  ...(microsegundos === undefined ? {} : { microsegundos }),
})
