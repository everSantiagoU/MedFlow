import type { ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aProcedimientoDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import type { DatosProcedimiento } from './tipos.js'

export class RegistrarProcedimiento {
  constructor(private readonly procedimientos: ProcedimientoDAO) {}
  async ejecutar(datos: DatosProcedimiento) {
    if (await this.procedimientos.existeNombre(datos.nombre)) {
      throw new Conflicto(`Ya existe un procedimiento con el nombre ${datos.nombre}`)
    }
    return aProcedimientoDTO(await this.procedimientos.guardar({
      nombre: datos.nombre.trim(), precio: datos.precio, duracionMinutos: datos.duracionMinutos,
    }))
  }
}
