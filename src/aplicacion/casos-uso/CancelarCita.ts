import type { CitaDAO } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'
import { ObtenerCita } from './ObtenerCita.js'

export class CancelarCita {
  private readonly obtener: ObtenerCita
  constructor(private readonly citas: CitaDAO) { this.obtener = new ObtenerCita(citas) }
  async ejecutar(id: number) {
    await this.obtener.buscarEntidad(id)
    return aCitaDTO(await this.citas.actualizarEstado(id, 'CANCELADA'))
  }
}
