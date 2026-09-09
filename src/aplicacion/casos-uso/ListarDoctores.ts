import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { aDoctorDTO } from '../conversores.js'

export class ListarDoctores {
  constructor(private readonly doctores: DoctorDAO) {}
  async ejecutar(busqueda?: string) {
    const termino = busqueda?.trim()
    return (await this.doctores.listar(termino || undefined)).map(aDoctorDTO)
  }
}
