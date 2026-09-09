import type { ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { ObtenerProcedimiento } from './ObtenerProcedimiento.js'

export class EliminarProcedimiento {
  private readonly obtener: ObtenerProcedimiento
  constructor(private readonly procedimientos: ProcedimientoDAO) { this.obtener = new ObtenerProcedimiento(procedimientos) }
  async ejecutar(id: number) {
    await this.obtener.buscarEntidad(id)
    await this.procedimientos.eliminar(id)
  }
}
