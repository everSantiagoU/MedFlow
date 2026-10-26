import type { CitaDAO } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { ahoraLocal } from '../fechas.js'
import { ObtenerCita } from './ObtenerCita.js'

export class MarcarInasistencia {
  private readonly obtener: ObtenerCita

  constructor(
    private readonly citas: CitaDAO,
    private readonly ahora: () => Date = ahoraLocal,
  ) {
    this.obtener = new ObtenerCita(citas)
  }

  async ejecutar(id: number) {
    const cita = await this.obtener.buscarEntidad(id)

    if (cita.estado.toUpperCase() !== 'PROGRAMADA') {
      throw new Conflicto('Solo una cita programada puede marcarse como no asistida')
    }
    if (cita.fechaHora >= this.ahora()) {
      throw new Conflicto('La hora programada de la cita todavía no ha pasado')
    }

    return aCitaDTO(await this.citas.actualizarEstado(id, 'NO_ASISTIO'))
  }
}
