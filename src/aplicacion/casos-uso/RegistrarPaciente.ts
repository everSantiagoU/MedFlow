import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPacienteDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { normalizarPaciente } from './normalizarPaciente.js'
import type { DatosPaciente } from './tipos.js'

export class RegistrarPaciente {
  constructor(private readonly pacientes: PacienteDAO) {}
  async ejecutar(datos: DatosPaciente) {
    const normalizado = normalizarPaciente(datos)
    const { documento, email } = normalizado
    if (await this.pacientes.existeDocumento(documento)) {
      throw new Conflicto(`Ya existe un paciente con el documento ${datos.documento}`)
    }
    if (await this.pacientes.existeEmail(email)) {
      throw new Conflicto(`Ya existe un paciente con el email ${datos.email}`)
    }
    return aPacienteDTO(await this.pacientes.guardar(normalizado))
  }
}
