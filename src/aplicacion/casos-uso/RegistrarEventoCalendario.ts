import type { CitaDAO, DoctorDAO, EventoCalendarioDAO } from '../../dominio/puertos/index.js'
import { eventoAEventoDTO } from '../conversores.js'
import { restarDias, sumarMinutos } from '../fechas.js'
import { Conflicto, RecursoNoEncontrado } from '../errores.js'
import type { DatosEventoCalendario } from './tipos.js'

export class RegistrarEventoCalendario {
  constructor(
    private readonly eventos: EventoCalendarioDAO,
    private readonly citas: CitaDAO,
    private readonly doctores: DoctorDAO,
  ) {}
  async ejecutar(datos: DatosEventoCalendario) {
    if (datos.fin <= datos.inicio) throw new Conflicto('La fecha y hora de fin debe ser posterior al inicio')
    if (!(await this.doctores.porId(datos.doctorId))) {
      throw new RecursoNoEncontrado(`Doctor no encontrado con id ${datos.doctorId}`)
    }
    if (await this.eventos.existeCruce(datos.doctorId, datos.inicio, datos.fin)) {
      throw new Conflicto('El doctor ya tiene un evento programado en ese rango de tiempo')
    }
    const citas = await this.citas.listarActivasParaCruce(datos.doctorId, restarDias(datos.inicio, 1), datos.fin)
    const cruce = citas.some(cita => cita.fechaHora < datos.fin &&
      sumarMinutos(cita.fechaHora, cita.procedimiento.duracionMinutos) > datos.inicio)
    if (cruce) throw new Conflicto('El doctor ya tiene una cita programada en ese rango de tiempo')
    return eventoAEventoDTO(await this.eventos.guardar({
      doctorId: datos.doctorId,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion == null ? null : datos.descripcion.trim(),
      inicio: datos.inicio,
      fin: datos.fin,
    }))
  }
}
