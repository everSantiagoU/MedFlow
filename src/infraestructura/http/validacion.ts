import type { DatosCita, DatosDoctor, DatosEventoCalendario, DatosHistoriaClinica, DatosPaciente, DatosProcedimiento } from '../../aplicacion/casos-uso/tipos.js'
import { ahoraLocal, parsearFechaLocal } from '../../aplicacion/fechas.js'
import { SolicitudInvalida } from '../../aplicacion/errores.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const objeto = (valor: unknown): Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor) ? valor as Record<string, unknown> : {}

function textoRequerido(d: Record<string, unknown>, campo: string, mensaje: string, max: number, mensajeMax: string, errores: string[]) {
  const valor = d[campo]
  if (typeof valor !== 'string' || !valor.trim()) errores.push(`${campo}: ${mensaje}`)
  else if (valor.length > max) errores.push(`${campo}: ${mensajeMax}`)
  return typeof valor === 'string' ? valor : ''
}

function emailRequerido(d: Record<string, unknown>, errores: string[]) {
  const valor = textoRequerido(d, 'email', 'El email es obligatorio', 120, 'El email no puede superar los 120 caracteres', errores)
  if (valor.trim() && valor.length <= 120 && !EMAIL.test(valor)) errores.push('email: El email debe tener un formato valido')
  return valor
}

export function validarLogin(cuerpo: unknown): { email: string; password: string } {
  const d = objeto(cuerpo), errores: string[] = []
  const email = typeof d['email'] === 'string' ? d['email'] : ''
  const password = typeof d['password'] === 'string' ? d['password'] : ''
  if (!email.trim()) errores.push('email: El email es obligatorio')
  else if (!EMAIL.test(email)) errores.push('email: Formato de email inválido')
  if (!password.trim()) errores.push('password: La contraseña es obligatoria')
  if (errores.length) throw new SolicitudInvalida(errores)
  return { email, password }
}

export function validarDoctor(cuerpo: unknown): DatosDoctor {
  const d = objeto(cuerpo), errores: string[] = []
  const nombreCompleto = textoRequerido(d, 'nombreCompleto', 'El nombre completo es obligatorio', 150, 'El nombre completo no puede superar los 150 caracteres', errores)
  const especialidad = textoRequerido(d, 'especialidad', 'La especialidad es obligatoria', 100, 'La especialidad no puede superar los 100 caracteres', errores)
  const registroMedico = textoRequerido(d, 'registroMedico', 'El registro medico es obligatorio', 80, 'El registro medico no puede superar los 80 caracteres', errores)
  const email = emailRequerido(d, errores)
  if (errores.length) throw new SolicitudInvalida(errores)
  return { nombreCompleto, especialidad, registroMedico, email }
}

export function validarPaciente(cuerpo: unknown): DatosPaciente {
  const d = objeto(cuerpo), errores: string[] = []
  const nombreCompleto = textoRequerido(d, 'nombreCompleto', 'El nombre completo es obligatorio', 150, 'El nombre completo no puede superar los 150 caracteres', errores)
  const documento = textoRequerido(d, 'documento', 'El documento es obligatorio', 30, 'El documento no puede superar los 30 caracteres', errores)
  const telefono = textoRequerido(d, 'telefono', 'El telefono es obligatorio', 30, 'El telefono no puede superar los 30 caracteres', errores)
  const email = emailRequerido(d, errores)
  const direccion = textoRequerido(d, 'direccion', 'La direccion es obligatoria', 200, 'La direccion no puede superar los 200 caracteres', errores)
  if (errores.length) throw new SolicitudInvalida(errores)
  return { nombreCompleto, documento, telefono, email, direccion }
}

export function validarProcedimiento(cuerpo: unknown): DatosProcedimiento {
  const d = objeto(cuerpo), errores: string[] = []
  const nombre = textoRequerido(d, 'nombre', 'El nombre es obligatorio', 120, 'El nombre no puede superar los 120 caracteres', errores)
  const precio = d['precio']
  const duracionMinutos = d['duracionMinutos']
  if (typeof precio !== 'number' || !Number.isFinite(precio)) errores.push('precio: El precio es obligatorio')
  else if (precio <= 0) errores.push('precio: El precio debe ser mayor a cero')
  if (!Number.isInteger(duracionMinutos)) errores.push('duracionMinutos: La duracion es obligatoria')
  else if ((duracionMinutos as number) <= 0) errores.push('duracionMinutos: La duracion debe ser mayor a cero')
  if (errores.length) throw new SolicitudInvalida(errores)
  return { nombre, precio: precio as number, duracionMinutos: duracionMinutos as number }
}

function enteroRequerido(d: Record<string, unknown>, campo: string, mensaje: string, errores: string[]) {
  const valor = d[campo]
  if (!Number.isInteger(valor)) errores.push(`${campo}: ${mensaje}`)
  return typeof valor === 'number' ? valor : 0
}

function fechaRequerida(d: Record<string, unknown>, campo: string, mensaje: string, mensajeFuturo: string, errores: string[]) {
  const valor = d[campo]
  const fecha = typeof valor === 'string' ? parsearFechaLocal(valor) : null
  if (!fecha) errores.push(`${campo}: ${mensaje}`)
  else if (fecha <= ahoraLocal()) errores.push(`${campo}: ${mensajeFuturo}`)
  return fecha ?? new Date(0)
}

export function validarCita(cuerpo: unknown): DatosCita {
  const d = objeto(cuerpo), errores: string[] = []
  const pacienteId = enteroRequerido(d, 'pacienteId', 'El paciente es obligatorio', errores)
  const doctorId = enteroRequerido(d, 'doctorId', 'El doctor es obligatorio', errores)
  const procedimientoId = enteroRequerido(d, 'procedimientoId', 'El procedimiento es obligatorio', errores)
  const fechaHora = fechaRequerida(d, 'fechaHora', 'La fecha y hora son obligatorias', 'La cita debe programarse en una fecha futura', errores)
  const estado = d['estado']
  if (estado != null && typeof estado !== 'string') errores.push('estado: El estado no puede superar los 50 caracteres')
  else if (typeof estado === 'string' && estado.length > 50) errores.push('estado: El estado no puede superar los 50 caracteres')
  if (errores.length) throw new SolicitudInvalida(errores)
  return { pacienteId, doctorId, procedimientoId, fechaHora, ...(typeof estado === 'string' ? { estado } : {}) }
}

export function validarEvento(cuerpo: unknown): DatosEventoCalendario {
  const d = objeto(cuerpo), errores: string[] = []
  const doctorId = enteroRequerido(d, 'doctorId', 'El doctor es obligatorio', errores)
  const titulo = textoRequerido(d, 'titulo', 'El titulo es obligatorio', 150, 'El titulo no puede superar los 150 caracteres', errores)
  const descripcion = d['descripcion']
  if (descripcion != null && typeof descripcion !== 'string') errores.push('descripcion: La descripcion no puede superar los 5000 caracteres')
  else if (typeof descripcion === 'string' && descripcion.length > 5000) errores.push('descripcion: La descripcion no puede superar los 5000 caracteres')
  const inicio = fechaRequerida(d, 'inicio', 'La fecha y hora de inicio son obligatorias', 'El evento debe iniciar en una fecha futura', errores)
  const fin = fechaRequerida(d, 'fin', 'La fecha y hora de fin son obligatorias', 'El evento debe finalizar en una fecha futura', errores)
  if (errores.length) throw new SolicitudInvalida(errores)
  return { doctorId, titulo, inicio, fin, ...(typeof descripcion === 'string' || descripcion === null ? { descripcion } : {}) }
}

export function validarHistoria(cuerpo: unknown): DatosHistoriaClinica {
  const d = objeto(cuerpo), errores: string[] = []
  const citaId = enteroRequerido(d, 'citaId', 'La cita es obligatoria', errores)
  const diagnostico = textoRequerido(d, 'diagnostico', 'El diagnostico es obligatorio', 5000, 'El diagnostico no puede superar los 5000 caracteres', errores)
  const observaciones = textoRequerido(d, 'observaciones', 'Las observaciones son obligatorias', 5000, 'Las observaciones no pueden superar los 5000 caracteres', errores)
  const datosRelevantes = textoRequerido(d, 'datosRelevantes', 'Los datos relevantes son obligatorios', 5000, 'Los datos relevantes no pueden superar los 5000 caracteres', errores)
  if (errores.length) throw new SolicitudInvalida(errores)
  return { citaId, diagnostico, observaciones, datosRelevantes }
}

export function validarId(valor: string | string[] | undefined): number {
  const texto = typeof valor === 'string' ? valor : ''
  if (!/^-?\d+$/.test(texto)) throw new SolicitudInvalida(['id: debe ser un numero entero'])
  return Number(texto)
}

export function validarFechaConsulta(valor: unknown): string | undefined {
  if (valor === undefined) return undefined
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || !parsearFechaLocal(`${valor}T00:00:00`)) {
    throw new SolicitudInvalida(['fecha: debe tener formato YYYY-MM-DD'])
  }
  return valor
}
