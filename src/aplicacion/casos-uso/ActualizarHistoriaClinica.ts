import type { HistoriaClinicaDAO } from '../../dominio/puertos/index.js'
import { aHistoriaClinicaDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { ObtenerHistoriaClinica } from './ObtenerHistoriaClinica.js'
import type { DatosHistoriaClinica } from './tipos.js'

export class ActualizarHistoriaClinica {
  private readonly obtener: ObtenerHistoriaClinica
  constructor(private readonly historias: HistoriaClinicaDAO) { this.obtener = new ObtenerHistoriaClinica(historias) }
  async ejecutar(id: number, datos: DatosHistoriaClinica) {
    const historia = await this.obtener.buscarEntidad(id)
    if (historia.citaId !== datos.citaId) {
      throw new Conflicto('No se puede cambiar la cita asociada a una historia clinica')
    }
    return aHistoriaClinicaDTO(await this.historias.guardar({
      ...historia,
      diagnostico: datos.diagnostico.trim(),
      observaciones: datos.observaciones.trim(),
      datosRelevantes: datos.datosRelevantes.trim(),
    }))
  }
}
