import type { Cita, CitaNueva } from '../../dominio/modelo/Cita.js'
import type { CitaDAO } from '../../dominio/puertos/index.js'
import { parsearFechaLocal } from '../../aplicacion/fechas.js'
import { aCita } from './conversoresPrisma.js'
import type { FilaCita } from './conversoresPrisma.js'
import type { ClientePrisma } from './prisma.js'

const relaciones = { paciente: true, doctor: true, procedimiento: true } as const

export class CitaDAOPrisma implements CitaDAO {
  constructor(private readonly prisma: ClientePrisma) {}

  async porId(id: number) {
    const fila = await this.prisma.cita.findUnique({ where: { id }, include: relaciones })
    return fila && aCita(fila as FilaCita)
  }

  async guardar(cita: CitaNueva | Cita) {
    const data = {
      fechaHora: cita.fechaHora, estado: cita.estado, pacienteId: cita.pacienteId,
      doctorId: cita.doctorId, procedimientoId: cita.procedimientoId,
    }
    const fila = 'id' in cita
      ? await this.prisma.cita.update({ where: { id: cita.id }, data, include: relaciones })
      : await this.prisma.cita.create({ data, include: relaciones })
    return aCita(fila as FilaCita)
  }

  async listarPorFecha(fecha?: string) {
    let where = {}
    if (fecha) {
      const desde = parsearFechaLocal(`${fecha}T00:00:00`)
      if (desde) {
        const hasta = new Date(desde)
        hasta.setDate(hasta.getDate() + 1)
        where = { fechaHora: { gte: desde, lt: hasta } }
      }
    }
    const filas = await this.prisma.cita.findMany({ where, include: relaciones, orderBy: { fechaHora: 'asc' } })
    return filas.map(fila => aCita(fila as FilaCita))
  }

  async listarPorDoctorYRango(doctorId: number, desde: Date, hasta: Date) {
    const filas = await this.prisma.cita.findMany({
      where: { doctorId, fechaHora: { gte: desde, lt: hasta } }, include: relaciones, orderBy: { fechaHora: 'asc' },
    })
    return filas.map(fila => aCita(fila as FilaCita))
  }

  async listarActivasParaCruce(doctorId: number, desde: Date, hasta: Date) {
    const filas = await this.prisma.cita.findMany({
      where: { doctorId, fechaHora: { gte: desde, lt: hasta }, NOT: { estado: { in: ['CANCELADA', 'NO_ASISTIO'] } } },
      include: relaciones, orderBy: { fechaHora: 'asc' },
    })
    return filas.map(fila => aCita(fila as FilaCita))
  }

  async existeCruceDoctor(doctorId: number, fechaHora: Date, exceptoId?: number) {
    return (await this.prisma.cita.count({ where: {
      doctorId, fechaHora, NOT: { estado: { in: ['CANCELADA', 'NO_ASISTIO'] } },
      ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }),
    } })) > 0
  }

  async existeCrucePaciente(pacienteId: number, fechaHora: Date, exceptoId?: number) {
    return (await this.prisma.cita.count({ where: {
      pacienteId, fechaHora, NOT: { estado: { in: ['CANCELADA', 'NO_ASISTIO'] } },
      ...(exceptoId === undefined ? {} : { id: { not: exceptoId } }),
    } })) > 0
  }

  async actualizarEstado(id: number, estado: string) {
    const fila = await this.prisma.cita.update({ where: { id }, data: { estado }, include: relaciones })
    return aCita(fila as FilaCita)
  }
}
