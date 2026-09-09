import type { CitaDAO, DoctorDAO, EventoCalendarioDAO } from '../../dominio/puertos/index.js'
import { citaAEventoDTO, eventoAEventoDTO } from '../conversores.js'
import { Conflicto, RecursoNoEncontrado } from '../errores.js'

export class ConsultarCalendario {
  constructor(
    private readonly eventos: EventoCalendarioDAO,
    private readonly citas: CitaDAO,
    private readonly doctores: DoctorDAO,
  ) {}
  async ejecutar(doctorId: number, desde: Date, hasta: Date) {
    if (hasta <= desde) throw new Conflicto('La fecha y hora de fin debe ser posterior al inicio')
    if (!(await this.doctores.porId(doctorId))) {
      throw new RecursoNoEncontrado(`Doctor no encontrado con id ${doctorId}`)
    }
    const [citas, eventos] = await Promise.all([
      this.citas.listarPorDoctorYRango(doctorId, desde, hasta),
      this.eventos.listarPorDoctorYRango(doctorId, desde, hasta),
    ])
    return [...citas.map(citaAEventoDTO), ...eventos.map(eventoAEventoDTO)]
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
  }
}
