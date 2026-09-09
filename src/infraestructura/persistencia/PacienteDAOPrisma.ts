import type { Paciente, PacienteNuevo } from '../../dominio/modelo/Paciente.js'
import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPaciente } from './conversoresPrisma.js'
import type { ClientePrisma } from './prisma.js'

export class PacienteDAOPrisma implements PacienteDAO {
  constructor(private readonly prisma: Pick<ClientePrisma, 'paciente'>) {}
  async porId(id: number) { const fila = await this.prisma.paciente.findUnique({ where: { id } }); return fila && aPaciente(fila) }
  async guardar(paciente: PacienteNuevo | Paciente) {
    const data = { nombreCompleto: paciente.nombreCompleto, documento: paciente.documento, telefono: paciente.telefono, email: paciente.email, direccion: paciente.direccion }
    const fila = 'id' in paciente
      ? await this.prisma.paciente.update({ where: { id: paciente.id }, data })
      : await this.prisma.paciente.create({ data })
    return aPaciente(fila)
  }
  async eliminar(id: number) { await this.prisma.paciente.delete({ where: { id } }) }
  async existeDocumento(documento: string, exceptoId?: number) {
    return (await this.prisma.paciente.count({ where: { documento, ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }) } })) > 0
  }
  async existeEmail(email: string, exceptoId?: number) {
    return (await this.prisma.paciente.count({ where: { email, ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }) } })) > 0
  }
  async listar(busqueda?: string) {
    const filas = await this.prisma.paciente.findMany({
      ...(busqueda ? { where: { OR: [
        { nombreCompleto: { contains: busqueda } }, { documento: { contains: busqueda } },
        { telefono: { contains: busqueda } }, { email: { contains: busqueda } }, { direccion: { contains: busqueda } },
      ] } } : {}),
      orderBy: { nombreCompleto: 'asc' },
    })
    return filas.map(aPaciente)
  }
}
