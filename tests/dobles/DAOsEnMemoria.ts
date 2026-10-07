import type { Cita, CitaDetalle, CitaNueva } from '../../src/dominio/modelo/Cita.js'
import type { DoctorDAOEnMemoria } from './DoctorDAOEnMemoria.js'
import type { EventoCalendarioDetalle, EventoCalendarioNuevo } from '../../src/dominio/modelo/EventoCalendario.js'
import type { HistoriaClinicaDetalle, HistoriaClinicaNueva } from '../../src/dominio/modelo/HistoriaClinica.js'
import type { PacienteDAOEnMemoria } from './PacienteDAOEnMemoria.js'
import type { Procedimiento, ProcedimientoNuevo } from '../../src/dominio/modelo/Procedimiento.js'
import type { Rol, Usuario } from '../../src/dominio/modelo/Usuario.js'
import type { CitaDAO, EventoCalendarioDAO, HistoriaClinicaDAO, ProcedimientoDAO, ServicioClaves, UsuarioDAO } from '../../src/dominio/puertos/index.js'

const contiene = (valor: string, termino: string) => valor.toLowerCase().includes(termino.toLowerCase())

export class UsuarioDAOEnMemoria implements UsuarioDAO {
  constructor(readonly filas: Usuario[] = []) {}
  async porEmail(email: string) { return this.filas.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null }
  agregar(email: string, password: string, rol: Rol = 'ADMIN') {
    const usuario = { id: this.filas.length + 1, email, password, rol }
    this.filas.push(usuario)
    return usuario
  }
}

export class ClavesFalsas implements ServicioClaves {
  async coincide(clave: string, hash: string) { return hash === `hash:${clave}` }
}

export class ProcedimientoDAOEnMemoria implements ProcedimientoDAO {
  constructor(readonly filas: Procedimiento[] = []) {}
  async porId(id: number) { return this.filas.find(f => f.id === id) ?? null }
  async guardar(valor: ProcedimientoNuevo | Procedimiento) {
    const fila = 'id' in valor ? { ...valor } : { ...valor, id: Math.max(0, ...this.filas.map(f => f.id)) + 1 }
    const indice = this.filas.findIndex(f => f.id === fila.id)
    if (indice >= 0) this.filas[indice] = fila; else this.filas.push(fila)
    return fila
  }
  async eliminar(id: number) { this.filas.splice(this.filas.findIndex(f => f.id === id), 1) }
  async existeNombre(valor: string, exceptoId?: number) { return this.filas.some(f => f.id !== exceptoId && f.nombre.toLowerCase() === valor.toLowerCase()) }
  async listar(busqueda?: string) { return this.filas.filter(f => !busqueda || contiene(f.nombre, busqueda)).sort((a, b) => a.nombre.localeCompare(b.nombre)) }
}

export class CitaDAOEnMemoria implements CitaDAO {
  readonly filas: Cita[] = []
  constructor(private readonly pacientes: PacienteDAOEnMemoria, private readonly doctores: DoctorDAOEnMemoria, private readonly procedimientos: ProcedimientoDAOEnMemoria) {}
  private async detalle(cita: Cita): Promise<CitaDetalle> {
    return { ...cita, paciente: (await this.pacientes.porId(cita.pacienteId))!, doctor: (await this.doctores.porId(cita.doctorId))!, procedimiento: (await this.procedimientos.porId(cita.procedimientoId))! }
  }
  async porId(id: number) { const fila = this.filas.find(f => f.id === id); return fila ? this.detalle(fila) : null }
  async guardar(valor: CitaNueva | Cita) {
    const fila = 'id' in valor ? { ...valor } : { ...valor, id: Math.max(0, ...this.filas.map(f => f.id)) + 1 }
    const indice = this.filas.findIndex(f => f.id === fila.id)
    if (indice >= 0) this.filas[indice] = fila; else this.filas.push(fila)
    return this.detalle(fila)
  }
  async listarPorFecha(fecha?: string) { const filas = this.filas.filter(f => !fecha || f.fechaHora.toISOString().slice(0, 10) === fecha); return Promise.all(filas.sort((a,b) => +a.fechaHora - +b.fechaHora).map(f => this.detalle(f))) }
  async listarPorDoctorYRango(id: number, desde: Date, hasta: Date) { return Promise.all(this.filas.filter(f => f.doctorId === id && f.fechaHora >= desde && f.fechaHora < hasta).map(f => this.detalle(f))) }
  async listarActivasParaCruce(id: number, desde: Date, hasta: Date) { return Promise.all(this.filas.filter(f => f.doctorId === id && !['CANCELADA', 'NO_ASISTIO'].includes(f.estado) && f.fechaHora >= desde && f.fechaHora < hasta).map(f => this.detalle(f))) }
  async existeCruceDoctor(id: number, fecha: Date, exceptoId?: number) { return this.filas.some(f => f.id !== exceptoId && f.doctorId === id && !['CANCELADA', 'NO_ASISTIO'].includes(f.estado) && +f.fechaHora === +fecha) }
  async existeCrucePaciente(id: number, fecha: Date, exceptoId?: number) { return this.filas.some(f => f.id !== exceptoId && f.pacienteId === id && !['CANCELADA', 'NO_ASISTIO'].includes(f.estado) && +f.fechaHora === +fecha) }
  async actualizarEstado(id: number, estado: string) { const fila = this.filas.find(f => f.id === id)!; fila.estado = estado; return this.detalle(fila) }
}

export class EventoDAOEnMemoria implements EventoCalendarioDAO {
  readonly filas: EventoCalendarioDetalle[] = []
  constructor(private readonly doctores: DoctorDAOEnMemoria) {}
  async guardar(valor: EventoCalendarioNuevo) { const fila = { ...valor, id: this.filas.length + 1, doctor: (await this.doctores.porId(valor.doctorId))! }; this.filas.push(fila); return fila }
  async listarPorDoctorYRango(id: number, desde: Date, hasta: Date) { return this.filas.filter(f => f.doctorId === id && f.inicio < hasta && f.fin > desde) }
  async existeCruce(id: number, inicio: Date, fin: Date) { return this.filas.some(f => f.doctorId === id && f.inicio < fin && f.fin > inicio) }
}

export class HistoriaDAOEnMemoria implements HistoriaClinicaDAO {
  readonly filas: HistoriaClinicaDetalle[] = []
  transacciones = 0
  constructor(private readonly citas: CitaDAOEnMemoria) {}
  async porId(id: number) { return this.filas.find(f => f.id === id) ?? null }
  async listar() { return [...this.filas].sort((a,b) => +b.fechaRegistro - +a.fechaRegistro) }
  async listarPorPaciente(id: number) { return (await this.listar()).filter(f => f.pacienteId === id) }
  async existePorCita(id: number) { return this.filas.some(f => f.citaId === id) }
  async guardar(valor: HistoriaClinicaNueva | HistoriaClinicaDetalle) {
    const cita = (await this.citas.porId(valor.citaId))!
    const fila: HistoriaClinicaDetalle = 'id' in valor ? { ...valor } : { ...valor, id: this.filas.length + 1, cita, doctor: cita.doctor, paciente: cita.paciente }
    const indice = this.filas.findIndex(f => f.id === fila.id)
    if (indice >= 0) this.filas[indice] = fila; else this.filas.push(fila)
    return fila
  }
  async guardarYCompletarCita(valor: HistoriaClinicaNueva) { this.transacciones++; await this.citas.actualizarEstado(valor.citaId, 'COMPLETADA'); return this.guardar(valor) }
}
