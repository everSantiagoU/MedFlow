import type { ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aProcedimientoDTO } from '../conversores.js'

export class ListarProcedimientos {
  constructor(private readonly procedimientos: ProcedimientoDAO) {}
  async ejecutar(busqueda?: string) {
    const termino = busqueda?.trim()
    return (await this.procedimientos.listar(termino || undefined)).map(aProcedimientoDTO)
  }
}
