import type { CitaDAO, HistoriaClinicaDAO } from '../../dominio/puertos/index.js'
import { aHistoriaClinicaDTO } from '../conversores.js'
import { ahoraLocal } from '../fechas.js'
import { Conflicto, RecursoNoEncontrado } from '../errores.js'
import type { DatosHistoriaClinica } from './tipos.js'

export class RegistrarHistoriaClinica {
  constructor(private readonly historias: HistoriaClinicaDAO, private readonly citas: CitaDAO) {}
  async ejecutar(datos: DatosHistoriaClinica) {
    const cita = await this.citas.porId(datos.citaId)
    if (!cita) throw new RecursoNoEncontrado(`Cita no encontrada con id ${datos.citaId}`)
    if (await this.historias.existePorCita(datos.citaId)) {
      throw new Conflicto('La cita ya tiene una historia clinica registrada')
    }
    if (cita.estado.toUpperCase() === 'CANCELADA') {
      throw new Conflicto('No se puede crear historia clinica para una cita cancelada')
    }
    return aHistoriaClinicaDTO(await this.historias.guardarYCompletarCita({
      citaId: cita.id, pacienteId: cita.pacienteId, doctorId: cita.doctorId,
      diagnostico: datos.diagnostico.trim(), observaciones: datos.observaciones.trim(),
      datosRelevantes: datos.datosRelevantes.trim(), fechaRegistro: ahoraLocal(),
    }))
  }
}
