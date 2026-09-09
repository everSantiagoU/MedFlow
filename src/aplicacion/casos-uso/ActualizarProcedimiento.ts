import type { ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aProcedimientoDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { ObtenerProcedimiento } from './ObtenerProcedimiento.js'
import type { DatosProcedimiento } from './tipos.js'

export class ActualizarProcedimiento {
  private readonly obtener: ObtenerProcedimiento
  constructor(private readonly procedimientos: ProcedimientoDAO) { this.obtener = new ObtenerProcedimiento(procedimientos) }
  async ejecutar(id: number, datos: DatosProcedimiento) {
    const procedimiento = await this.obtener.buscarEntidad(id)
    if (await this.procedimientos.existeNombre(datos.nombre, id)) {
      throw new Conflicto(`Ya existe un procedimiento con el nombre ${datos.nombre}`)
    }
    return aProcedimientoDTO(await this.procedimientos.guardar({
      ...procedimiento, nombre: datos.nombre.trim(), precio: datos.precio, duracionMinutos: datos.duracionMinutos,
    }))
  }
}
