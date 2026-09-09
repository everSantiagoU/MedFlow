import type { DoctorDAO } from '../../dominio/puertos/index.js'
import type { ObtenerDoctor } from './ObtenerDoctor.js'

export class EliminarDoctor {
  constructor(
    private readonly doctores: DoctorDAO,
    private readonly obtener: ObtenerDoctor,
  ) {}
  async ejecutar(id: number) {
    await this.obtener.buscarEntidad(id)
    await this.doctores.eliminar(id)
  }
}
