import type { CitaDAO } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'
import { RecursoNoEncontrado } from '../errores.js'

export class ObtenerCita {
  constructor(private readonly citas: CitaDAO) {}
  async buscarEntidad(id: number) {
    const cita = await this.citas.porId(id)
    if (!cita) throw new RecursoNoEncontrado(`Cita no encontrada con id ${id}`)
    return cita
  }
  async ejecutar(id: number) { return aCitaDTO(await this.buscarEntidad(id)) }
}
