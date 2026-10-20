import type { CitaDAO, FiltrosCitas } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'

export class ListarCitas {
  constructor(private readonly citas: CitaDAO) {}
  async ejecutar(fecha?: string, filtros: FiltrosCitas = {}) {
    return (await this.citas.listarPorFecha(fecha, filtros)).map(aCitaDTO)
  }
}
