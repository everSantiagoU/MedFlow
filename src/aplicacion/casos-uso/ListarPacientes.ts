import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPacienteDTO } from '../conversores.js'

export class ListarPacientes {
  constructor(private readonly pacientes: PacienteDAO) {}
  async ejecutar(busqueda?: string) {
    const termino = busqueda?.trim()
    return (await this.pacientes.listar(termino || undefined)).map(aPacienteDTO)
  }
}
