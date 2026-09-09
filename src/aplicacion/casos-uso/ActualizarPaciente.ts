import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPacienteDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { ObtenerPaciente } from './ObtenerPaciente.js'
import type { DatosPaciente } from './tipos.js'

export class ActualizarPaciente {
  private readonly obtener: ObtenerPaciente
  constructor(private readonly pacientes: PacienteDAO) { this.obtener = new ObtenerPaciente(pacientes) }
  async ejecutar(id: number, datos: DatosPaciente) {
    const paciente = await this.obtener.buscarEntidad(id)
    const documento = datos.documento.trim()
    const email = datos.email.trim().toLowerCase()
    if (await this.pacientes.existeDocumento(documento, id)) {
      throw new Conflicto(`Ya existe un paciente con el documento ${datos.documento}`)
    }
    if (await this.pacientes.existeEmail(email, id)) {
      throw new Conflicto(`Ya existe un paciente con el email ${datos.email}`)
    }
    return aPacienteDTO(await this.pacientes.guardar({
      ...paciente, nombreCompleto: datos.nombreCompleto.trim(), documento,
      telefono: datos.telefono.trim(), email, direccion: datos.direccion.trim(),
    }))
  }
}
