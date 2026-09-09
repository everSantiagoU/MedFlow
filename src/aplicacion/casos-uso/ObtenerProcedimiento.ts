import type { ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aProcedimientoDTO } from '../conversores.js'
import { RecursoNoEncontrado } from '../errores.js'

export class ObtenerProcedimiento {
  constructor(private readonly procedimientos: ProcedimientoDAO) {}
  async buscarEntidad(id: number) {
    const procedimiento = await this.procedimientos.porId(id)
    if (!procedimiento) throw new RecursoNoEncontrado(`Procedimiento no encontrado con id ${id}`)
    return procedimiento
  }
  async ejecutar(id: number) { return aProcedimientoDTO(await this.buscarEntidad(id)) }
}
