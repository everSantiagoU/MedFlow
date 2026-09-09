import type { HistoriaClinica, HistoriaClinicaDetalle, HistoriaClinicaNueva } from '../../dominio/modelo/HistoriaClinica.js'
import type { HistoriaClinicaDAO } from '../../dominio/puertos/index.js'
import { aHistoria } from './conversoresPrisma.js'
import type { FilaHistoria } from './conversoresPrisma.js'
import type { ClientePrisma } from './prisma.js'

const relaciones = {
  paciente: true,
  doctor: true,
  cita: { include: { paciente: true, doctor: true, procedimiento: true } },
} as const

const datos = (historia: HistoriaClinicaNueva | HistoriaClinica | HistoriaClinicaDetalle) => ({
  fechaRegistro: historia.fechaRegistro,
  diagnostico: historia.diagnostico,
  observaciones: historia.observaciones,
  datosRelevantes: historia.datosRelevantes,
  citaId: historia.citaId,
  doctorId: historia.doctorId,
  pacienteId: historia.pacienteId,
})

export class HistoriaClinicaDAOPrisma implements HistoriaClinicaDAO {
  constructor(private readonly prisma: ClientePrisma) {}
  private async precisiones(): Promise<Map<number, number>> {
    const filas = await this.prisma.$queryRawUnsafe<Array<{ id: number; microsegundos: number | bigint }>>(
      'SELECT id, MICROSECOND(fecha_registro) AS microsegundos FROM historias_clinicas',
    )
    return new Map(filas.map(fila => [Number(fila.id), Number(fila.microsegundos)]))
  }
  async porId(id: number) {
    const fila = await this.prisma.historiaClinica.findUnique({ where: { id }, include: relaciones })
    if (!fila) return null
    return aHistoria(fila as FilaHistoria, (await this.precisiones()).get(id))
  }
  async listar() {
    const filas = await this.prisma.historiaClinica.findMany({ include: relaciones, orderBy: { fechaRegistro: 'desc' } })
    const precisiones = await this.precisiones()
    return filas.map(fila => aHistoria(fila as FilaHistoria, precisiones.get(fila.id)))
  }
  async listarPorPaciente(pacienteId: number) {
    const filas = await this.prisma.historiaClinica.findMany({
      where: { pacienteId }, include: relaciones, orderBy: { fechaRegistro: 'desc' },
    })
    const precisiones = await this.precisiones()
    return filas.map(fila => aHistoria(fila as FilaHistoria, precisiones.get(fila.id)))
  }
  async existePorCita(citaId: number) {
    return (await this.prisma.historiaClinica.count({ where: { citaId } })) > 0
  }
  async guardar(historia: HistoriaClinicaNueva | HistoriaClinicaDetalle) {
    const fila = 'id' in historia
      ? await this.prisma.historiaClinica.update({ where: { id: historia.id }, data: datos(historia), include: relaciones })
      : await this.prisma.historiaClinica.create({ data: datos(historia), include: relaciones })
    return aHistoria(fila as FilaHistoria, (await this.precisiones()).get(fila.id))
  }
  async guardarYCompletarCita(historia: HistoriaClinicaNueva) {
    const fila = await this.prisma.$transaction(async tx => {
      await tx.cita.update({ where: { id: historia.citaId }, data: { estado: 'COMPLETADA' } })
      return tx.historiaClinica.create({ data: datos(historia), include: relaciones })
    })
    return aHistoria(fila as FilaHistoria, (await this.precisiones()).get(fila.id))
  }
}
