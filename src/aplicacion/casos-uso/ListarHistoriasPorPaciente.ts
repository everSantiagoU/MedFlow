import type { HistoriaClinicaDAO, PacienteDAO } from '../../dominio/puertos/index.js'
import { aHistoriaClinicaDTO } from '../conversores.js'
import { RecursoNoEncontrado } from '../errores.js'

export class ListarHistoriasPorPaciente {
  constructor(private readonly historias: HistoriaClinicaDAO, private readonly pacientes: PacienteDAO) {}
  async ejecutar(pacienteId: number) {
    if (!(await this.pacientes.porId(pacienteId))) {
      throw new RecursoNoEncontrado(`Paciente no encontrado con id ${pacienteId}`)
    }
    return (await this.historias.listarPorPaciente(pacienteId)).map(aHistoriaClinicaDTO)
  }
}
