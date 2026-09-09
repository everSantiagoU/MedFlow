import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { aDoctorDTO } from '../conversores.js'
import { RecursoNoEncontrado } from '../errores.js'

export class ObtenerDoctor {
  constructor(private readonly doctores: DoctorDAO) {}
  async buscarEntidad(id: number) {
    const doctor = await this.doctores.porId(id)
    if (!doctor) throw new RecursoNoEncontrado(`Doctor no encontrado con id ${id}`)
    return doctor
  }
  async ejecutar(id: number) {
    return aDoctorDTO(await this.buscarEntidad(id))
  }
}
