import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { ObtenerPaciente } from './ObtenerPaciente.js'

export class EliminarPaciente {
  private readonly obtener: ObtenerPaciente
  constructor(private readonly pacientes: PacienteDAO) { this.obtener = new ObtenerPaciente(pacientes) }
  async ejecutar(id: number) {
    await this.obtener.buscarEntidad(id)
    await this.pacientes.eliminar(id)
  }
}
