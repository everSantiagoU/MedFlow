import type { CitaDAO } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'

export class ListarCitas {
  constructor(private readonly citas: CitaDAO) {}
  async ejecutar(fecha?: string) {
    return (await this.citas.listarPorFecha(fecha)).map(aCitaDTO)
  }
}
