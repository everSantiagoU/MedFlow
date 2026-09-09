import type { Doctor } from '../dominio/modelo/Doctor.js'
import type { Paciente } from '../dominio/modelo/Paciente.js'
import type { Procedimiento } from '../dominio/modelo/Procedimiento.js'
import type { CitaDetalle } from '../dominio/modelo/Cita.js'
import type { EventoCalendarioDetalle } from '../dominio/modelo/EventoCalendario.js'
import type { HistoriaClinicaDetalle } from '../dominio/modelo/HistoriaClinica.js'
import type { CitaDTO, DoctorDTO, EventoCalendarioDTO, HistoriaClinicaDTO, PacienteDTO, ProcedimientoDTO } from './dto/index.js'
import { formatearFechaLocal, sumarMinutos } from './fechas.js'

export const aDoctorDTO = (doctor: Doctor): DoctorDTO => ({
  id: doctor.id, nombreCompleto: doctor.nombreCompleto, especialidad: doctor.especialidad,
  registroMedico: doctor.registroMedico, email: doctor.email,
})
export const aPacienteDTO = (paciente: Paciente): PacienteDTO => ({
  id: paciente.id, nombreCompleto: paciente.nombreCompleto, documento: paciente.documento,
  telefono: paciente.telefono, email: paciente.email, direccion: paciente.direccion,
})
export const aProcedimientoDTO = (procedimiento: Procedimiento): ProcedimientoDTO => ({
  id: procedimiento.id, nombre: procedimiento.nombre, precio: procedimiento.precio,
  duracionMinutos: procedimiento.duracionMinutos,
})

export const aCitaDTO = (cita: CitaDetalle): CitaDTO => ({
  id: cita.id,
  fechaHora: formatearFechaLocal(cita.fechaHora),
  estado: cita.estado,
  pacienteId: cita.paciente.id,
  pacienteNombre: cita.paciente.nombreCompleto,
  doctorId: cita.doctor.id,
  doctorNombre: cita.doctor.nombreCompleto,
  doctorEspecialidad: cita.doctor.especialidad,
  procedimientoId: cita.procedimiento.id,
  procedimientoNombre: cita.procedimiento.nombre,
  procedimientoDuracionMinutos: cita.procedimiento.duracionMinutos,
})

export const citaAEventoDTO = (cita: CitaDetalle): EventoCalendarioDTO => ({
  id: cita.id,
  tipo: 'CITA',
  titulo: `${cita.procedimiento.nombre} - ${cita.paciente.nombreCompleto}`,
  descripcion: null,
  inicio: formatearFechaLocal(cita.fechaHora),
  fin: formatearFechaLocal(sumarMinutos(cita.fechaHora, cita.procedimiento.duracionMinutos)),
  estado: cita.estado,
  doctorId: cita.doctor.id,
  doctorNombre: cita.doctor.nombreCompleto,
  pacienteId: cita.paciente.id,
  pacienteNombre: cita.paciente.nombreCompleto,
  citaId: cita.id,
  eventoId: null,
  procedimientoId: cita.procedimiento.id,
  procedimientoNombre: cita.procedimiento.nombre,
})

export const eventoAEventoDTO = (evento: EventoCalendarioDetalle): EventoCalendarioDTO => ({
  id: evento.id,
  tipo: 'EVENTO',
  titulo: evento.titulo,
  descripcion: evento.descripcion,
  inicio: formatearFechaLocal(evento.inicio),
  fin: formatearFechaLocal(evento.fin),
  estado: null,
  doctorId: evento.doctor.id,
  doctorNombre: evento.doctor.nombreCompleto,
  pacienteId: null,
  pacienteNombre: null,
  citaId: null,
  eventoId: evento.id,
  procedimientoId: null,
  procedimientoNombre: null,
})

export const aHistoriaClinicaDTO = (historia: HistoriaClinicaDetalle): HistoriaClinicaDTO => ({
  id: historia.id,
  fechaRegistro: formatearFechaLocal(historia.fechaRegistro, historia.microsegundos),
  diagnostico: historia.diagnostico,
  observaciones: historia.observaciones,
  datosRelevantes: historia.datosRelevantes,
  citaId: historia.cita.id,
  citaFechaHora: formatearFechaLocal(historia.cita.fechaHora),
  citaEstado: historia.cita.estado,
  pacienteId: historia.paciente.id,
  pacienteNombre: historia.paciente.nombreCompleto,
  doctorId: historia.doctor.id,
  doctorNombre: historia.doctor.nombreCompleto,
  doctorEspecialidad: historia.doctor.especialidad,
  procedimientoId: historia.cita.procedimiento.id,
  procedimientoNombre: historia.cita.procedimiento.nombre,
})
