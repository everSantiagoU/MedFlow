import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPacienteDTO } from '../conversores.js'
import { RecursoNoEncontrado } from '../errores.js'

export class ObtenerPaciente {
  constructor(private readonly pacientes: PacienteDAO) {}
  async buscarEntidad(id: number) {
    const paciente = await this.pacientes.porId(id)
    if (!paciente) throw new RecursoNoEncontrado(`Paciente no encontrado con id ${id}`)
    return paciente
  }
  async ejecutar(id: number) { return aPacienteDTO(await this.buscarEntidad(id)) }
}
