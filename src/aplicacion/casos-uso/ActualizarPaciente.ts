import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPacienteDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import type { ObtenerPaciente } from './ObtenerPaciente.js'
import { normalizarPaciente } from './normalizarPaciente.js'
import type { DatosPaciente } from './tipos.js'

export class ActualizarPaciente {
  constructor(
    private readonly pacientes: PacienteDAO,
    private readonly obtener: ObtenerPaciente,
  ) {}
  async ejecutar(id: number, datos: DatosPaciente) {
    const paciente = await this.obtener.buscarEntidad(id)
    const normalizado = normalizarPaciente(datos)
    const { documento, email } = normalizado
    if (await this.pacientes.existeDocumento(documento, id)) {
      throw new Conflicto(`Ya existe un paciente con el documento ${datos.documento}`)
    }
    if (await this.pacientes.existeEmail(email, id)) {
      throw new Conflicto(`Ya existe un paciente con el email ${datos.email}`)
    }
    return aPacienteDTO(await this.pacientes.guardar({ ...paciente, ...normalizado }))
  }
}
