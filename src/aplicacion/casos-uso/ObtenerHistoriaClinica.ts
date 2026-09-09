import type { HistoriaClinicaDAO } from '../../dominio/puertos/index.js'
import { aHistoriaClinicaDTO } from '../conversores.js'
import { RecursoNoEncontrado } from '../errores.js'

export class ObtenerHistoriaClinica {
  constructor(private readonly historias: HistoriaClinicaDAO) {}
  async buscarEntidad(id: number) {
    const historia = await this.historias.porId(id)
    if (!historia) throw new RecursoNoEncontrado(`Historia clinica no encontrada con id ${id}`)
    return historia
  }
  async ejecutar(id: number) { return aHistoriaClinicaDTO(await this.buscarEntidad(id)) }
}
