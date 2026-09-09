import type { CitaDAO, DoctorDAO, PacienteDAO, ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'
import { ObtenerCita } from './ObtenerCita.js'
import { normalizarEstado, validarDisponibilidad, validarRelacionesCita } from './soporteCitas.js'
import type { DatosCita } from './tipos.js'

export class ActualizarCita {
  private readonly obtener: ObtenerCita
  constructor(
    private readonly citas: CitaDAO,
    private readonly pacientes: PacienteDAO,
    private readonly doctores: DoctorDAO,
    private readonly procedimientos: ProcedimientoDAO,
  ) { this.obtener = new ObtenerCita(citas) }
  async ejecutar(id: number, datos: DatosCita) {
    await this.obtener.buscarEntidad(id)
    const estado = normalizarEstado(datos.estado)
    await validarRelacionesCita(datos, this.pacientes, this.doctores, this.procedimientos)
    await validarDisponibilidad(datos, this.citas, id)
    return aCitaDTO(await this.citas.guardar({
      id, pacienteId: datos.pacienteId, doctorId: datos.doctorId,
      procedimientoId: datos.procedimientoId, fechaHora: datos.fechaHora, estado,
    }))
  }
}
