import type { EventoCalendarioNuevo } from '../../dominio/modelo/EventoCalendario.js'
import type { EventoCalendarioDAO } from '../../dominio/puertos/index.js'
import { aEvento } from './conversoresPrisma.js'
import type { FilaEvento } from './conversoresPrisma.js'
import type { ClientePrisma } from './prisma.js'

export class EventoCalendarioDAOPrisma implements EventoCalendarioDAO {
  constructor(private readonly prisma: ClientePrisma) {}
  async guardar(evento: EventoCalendarioNuevo) {
    const fila = await this.prisma.eventoCalendario.create({ data: evento, include: { doctor: true } })
    return aEvento(fila as FilaEvento)
  }
  async listarPorDoctorYRango(doctorId: number, desde: Date, hasta: Date) {
    const filas = await this.prisma.eventoCalendario.findMany({
      where: { doctorId, inicio: { lt: hasta }, fin: { gt: desde } },
      include: { doctor: true }, orderBy: { inicio: 'asc' },
    })
    return filas.map(fila => aEvento(fila as FilaEvento))
  }
  async existeCruce(doctorId: number, inicio: Date, fin: Date) {
    return (await this.prisma.eventoCalendario.count({
      where: { doctorId, inicio: { lt: fin }, fin: { gt: inicio } },
    })) > 0
  }
}
