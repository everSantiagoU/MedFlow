import type { PacienteDAO } from '../../dominio/puertos/index.js'
import type { ObtenerPaciente } from './ObtenerPaciente.js'

export class EliminarPaciente {
  constructor(
    private readonly pacientes: PacienteDAO,
    private readonly obtener: ObtenerPaciente,
  ) {}
  async ejecutar(id: number) {
    await this.obtener.buscarEntidad(id)
    await this.pacientes.eliminar(id)
  }
}
