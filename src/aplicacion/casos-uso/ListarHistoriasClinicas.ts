import type { HistoriaClinicaDAO } from '../../dominio/puertos/index.js'
import { aHistoriaClinicaDTO } from '../conversores.js'

export class ListarHistoriasClinicas {
  constructor(private readonly historias: HistoriaClinicaDAO) {}
  async ejecutar() { return (await this.historias.listar()).map(aHistoriaClinicaDTO) }
}
