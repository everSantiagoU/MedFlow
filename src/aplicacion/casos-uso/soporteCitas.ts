import type { CitaDAO, DoctorDAO, PacienteDAO, ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { Conflicto, RecursoNoEncontrado } from '../errores.js'
import type { DatosCita } from './tipos.js'

export function normalizarEstado(estado?: string): string {
  if (!estado?.trim()) return 'PROGRAMADA'
  const normalizado = estado.trim().toUpperCase()
  if (!['PROGRAMADA', 'COMPLETADA', 'CANCELADA'].includes(normalizado)) {
    throw new Conflicto('El estado de la cita no es valido')
  }
  return normalizado
}

export async function validarRelacionesCita(
  datos: DatosCita,
  pacientes: PacienteDAO,
  doctores: DoctorDAO,
  procedimientos: ProcedimientoDAO,
) {
  if (!(await pacientes.porId(datos.pacienteId))) {
    throw new RecursoNoEncontrado(`Paciente no encontrado con id ${datos.pacienteId}`)
  }
  if (!(await doctores.porId(datos.doctorId))) {
    throw new RecursoNoEncontrado(`Doctor no encontrado con id ${datos.doctorId}`)
  }
  if (!(await procedimientos.porId(datos.procedimientoId))) {
    throw new RecursoNoEncontrado(`Procedimiento no encontrado con id ${datos.procedimientoId}`)
  }
}

export async function validarDisponibilidad(
  datos: DatosCita,
  citas: CitaDAO,
  exceptoId?: number,
) {
  if (await citas.existeCruceDoctor(datos.doctorId, datos.fechaHora, exceptoId)) {
    throw new Conflicto('El doctor ya tiene una cita programada en esa fecha y hora')
  }
  if (await citas.existeCrucePaciente(datos.pacienteId, datos.fechaHora, exceptoId)) {
    throw new Conflicto('El paciente ya tiene una cita programada en esa fecha y hora')
  }
}
