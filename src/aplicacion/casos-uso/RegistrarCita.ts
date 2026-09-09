import type { CitaDAO, DoctorDAO, PacienteDAO, ProcedimientoDAO } from '../../dominio/puertos/index.js'
import { aCitaDTO } from '../conversores.js'
import { normalizarEstado, validarDisponibilidad, validarRelacionesCita } from './soporteCitas.js'
import type { DatosCita } from './tipos.js'

export class RegistrarCita {
  constructor(
    private readonly citas: CitaDAO,
    private readonly pacientes: PacienteDAO,
    private readonly doctores: DoctorDAO,
    private readonly procedimientos: ProcedimientoDAO,
  ) {}
  async ejecutar(datos: DatosCita) {
    const estado = normalizarEstado(datos.estado)
    await validarRelacionesCita(datos, this.pacientes, this.doctores, this.procedimientos)
    await validarDisponibilidad(datos, this.citas)
    return aCitaDTO(await this.citas.guardar({
      pacienteId: datos.pacienteId, doctorId: datos.doctorId,
      procedimientoId: datos.procedimientoId, fechaHora: datos.fechaHora, estado,
    }))
  }
}
