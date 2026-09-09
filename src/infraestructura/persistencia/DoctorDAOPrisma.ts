import type { Doctor, DoctorNuevo } from '../../dominio/modelo/Doctor.js'
import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { aDoctor } from './conversoresPrisma.js'
import type { ClientePrisma } from './prisma.js'

export class DoctorDAOPrisma implements DoctorDAO {
  constructor(private readonly prisma: ClientePrisma) {}
  async porId(id: number) { const fila = await this.prisma.doctor.findUnique({ where: { id } }); return fila && aDoctor(fila) }
  async guardar(doctor: DoctorNuevo | Doctor) {
    const data = { nombreCompleto: doctor.nombreCompleto, especialidad: doctor.especialidad, registroMedico: doctor.registroMedico, email: doctor.email }
    const fila = 'id' in doctor
      ? await this.prisma.doctor.update({ where: { id: doctor.id }, data })
      : await this.prisma.doctor.create({ data })
    return aDoctor(fila)
  }
  async eliminar(id: number) { await this.prisma.doctor.delete({ where: { id } }) }
  async existeRegistroMedico(registroMedico: string, exceptoId?: number) {
    return (await this.prisma.doctor.count({ where: { registroMedico, ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }) } })) > 0
  }
  async existeEmail(email: string, exceptoId?: number) {
    return (await this.prisma.doctor.count({ where: { email, ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }) } })) > 0
  }
  async listar(busqueda?: string) {
    const filas = await this.prisma.doctor.findMany({
      ...(busqueda ? { where: { OR: [
        { nombreCompleto: { contains: busqueda } }, { especialidad: { contains: busqueda } },
        { registroMedico: { contains: busqueda } }, { email: { contains: busqueda } },
      ] } } : {}),
      orderBy: { nombreCompleto: 'asc' },
    })
    return filas.map(aDoctor)
  }
}
