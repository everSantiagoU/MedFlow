import type { Usuario, Rol } from '../modelo/Usuario.js'
import type { Doctor, DoctorNuevo } from '../modelo/Doctor.js'
import type { Paciente, PacienteNuevo } from '../modelo/Paciente.js'
import type { Procedimiento, ProcedimientoNuevo } from '../modelo/Procedimiento.js'
import type { Cita, CitaDetalle, CitaNueva } from '../modelo/Cita.js'
import type { EventoCalendarioDetalle, EventoCalendarioNuevo } from '../modelo/EventoCalendario.js'
import type { HistoriaClinicaDetalle, HistoriaClinicaNueva } from '../modelo/HistoriaClinica.js'

export interface UsuarioDAO {
  porEmail(email: string): Promise<Usuario | null>
}

export interface ServicioClaves {
  coincide(clave: string, hash: string): Promise<boolean>
}

export interface CredencialDTO {
  email: string
  rol: Rol
}

export interface ServicioTokens {
  emitir(credencial: CredencialDTO): string
  verificar(token: string): CredencialDTO | null
}

export interface DoctorDAO {
  porId(id: number): Promise<Doctor | null>
  guardar(doctor: DoctorNuevo | Doctor): Promise<Doctor>
  eliminar(id: number): Promise<void>
  existeRegistroMedico(registroMedico: string, exceptoId?: number): Promise<boolean>
  existeEmail(email: string, exceptoId?: number): Promise<boolean>
  listar(busqueda?: string): Promise<Doctor[]>
}

export interface PacienteDAO {
  porId(id: number): Promise<Paciente | null>
  guardar(paciente: PacienteNuevo | Paciente): Promise<Paciente>
  eliminar(id: number): Promise<void>
  existeDocumento(documento: string, exceptoId?: number): Promise<boolean>
  existeEmail(email: string, exceptoId?: number): Promise<boolean>
  listar(busqueda?: string): Promise<Paciente[]>
}

export interface ProcedimientoDAO {
  porId(id: number): Promise<Procedimiento | null>
  guardar(procedimiento: ProcedimientoNuevo | Procedimiento): Promise<Procedimiento>
  eliminar(id: number): Promise<void>
  existeNombre(nombre: string, exceptoId?: number): Promise<boolean>
  listar(busqueda?: string): Promise<Procedimiento[]>
}

export interface CitaDAO {
  porId(id: number): Promise<CitaDetalle | null>
  guardar(cita: CitaNueva | Cita): Promise<CitaDetalle>
  listarPorFecha(fecha?: string): Promise<CitaDetalle[]>
  listarPorDoctorYRango(doctorId: number, desde: Date, hasta: Date): Promise<CitaDetalle[]>
  listarActivasParaCruce(doctorId: number, desde: Date, hasta: Date): Promise<CitaDetalle[]>
  existeCruceDoctor(doctorId: number, fechaHora: Date, exceptoId?: number): Promise<boolean>
  existeCrucePaciente(pacienteId: number, fechaHora: Date, exceptoId?: number): Promise<boolean>
  actualizarEstado(id: number, estado: string): Promise<CitaDetalle>
}

export interface EventoCalendarioDAO {
  guardar(evento: EventoCalendarioNuevo): Promise<EventoCalendarioDetalle>
  listarPorDoctorYRango(doctorId: number, desde: Date, hasta: Date): Promise<EventoCalendarioDetalle[]>
  existeCruce(doctorId: number, inicio: Date, fin: Date): Promise<boolean>
}

export interface HistoriaClinicaDAO {
  porId(id: number): Promise<HistoriaClinicaDetalle | null>
  listar(): Promise<HistoriaClinicaDetalle[]>
  listarPorPaciente(pacienteId: number): Promise<HistoriaClinicaDetalle[]>
  existePorCita(citaId: number): Promise<boolean>
  guardar(historia: HistoriaClinicaNueva | HistoriaClinicaDetalle): Promise<HistoriaClinicaDetalle>
  guardarYCompletarCita(historia: HistoriaClinicaNueva): Promise<HistoriaClinicaDetalle>
}
