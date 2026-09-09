import type { ObtenerPaciente } from './ObtenerPaciente.js'
import type { HistoriaClinicaDAO } from '../../dominio/puertos/index.js'
import { aHistoriaClinicaDTO } from '../conversores.js'

export class ListarHistoriasPorPaciente {
  constructor(private readonly historias: HistoriaClinicaDAO, private readonly pacientes: ObtenerPaciente) {}
  async ejecutar(pacienteId: number) {
    await this.pacientes.buscarEntidad(pacienteId)
    return (await this.historias.listarPorPaciente(pacienteId)).map(aHistoriaClinicaDTO)
  }
}
