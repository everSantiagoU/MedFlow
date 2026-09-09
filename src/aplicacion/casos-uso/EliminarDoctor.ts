import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { ObtenerDoctor } from './ObtenerDoctor.js'

export class EliminarDoctor {
  private readonly obtener: ObtenerDoctor
  constructor(private readonly doctores: DoctorDAO) {
    this.obtener = new ObtenerDoctor(doctores)
  }
  async ejecutar(id: number) {
    await this.obtener.buscarEntidad(id)
    await this.doctores.eliminar(id)
  }
}
