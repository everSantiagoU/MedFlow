import type { Procedimiento, ProcedimientoNuevo } from '../../dominio/modelo/Procedimiento.js'
import type { ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aProcedimiento } from './conversoresPrisma.js'
import type { ClientePrisma } from './prisma.js'

export class ProcedimientoDAOPrisma implements ProcedimientoDAO {
  constructor(private readonly prisma: ClientePrisma) {}
  async porId(id: number) { const fila = await this.prisma.procedimiento.findUnique({ where: { id } }); return fila && aProcedimiento(fila) }
  async guardar(procedimiento: ProcedimientoNuevo | Procedimiento) {
    const data = { nombre: procedimiento.nombre, precio: procedimiento.precio, duracionMinutos: procedimiento.duracionMinutos }
    const fila = 'id' in procedimiento
      ? await this.prisma.procedimiento.update({ where: { id: procedimiento.id }, data })
      : await this.prisma.procedimiento.create({ data })
    return aProcedimiento(fila)
  }
  async eliminar(id: number) { await this.prisma.procedimiento.delete({ where: { id } }) }
  async existeNombre(nombre: string, exceptoId?: number) {
    return (await this.prisma.procedimiento.count({ where: { nombre, ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }) } })) > 0
  }
  async listar(busqueda?: string) {
    return (await this.prisma.procedimiento.findMany({
      ...(busqueda ? { where: { nombre: { contains: busqueda } } } : {}),
      orderBy: { nombre: 'asc' },
    })).map(aProcedimiento)
  }
}
