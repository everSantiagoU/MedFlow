import type { PacienteDAO } from '../../dominio/puertos/index.js'
import { aPacienteDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import type { DatosPaciente } from './tipos.js'

export class RegistrarPaciente {
  constructor(private readonly pacientes: PacienteDAO) {}
  async ejecutar(datos: DatosPaciente) {
    const documento = datos.documento.trim()
    const email = datos.email.trim().toLowerCase()
    if (await this.pacientes.existeDocumento(documento)) {
      throw new Conflicto(`Ya existe un paciente con el documento ${datos.documento}`)
    }
    if (await this.pacientes.existeEmail(email)) {
      throw new Conflicto(`Ya existe un paciente con el email ${datos.email}`)
    }
    return aPacienteDTO(await this.pacientes.guardar({
      nombreCompleto: datos.nombreCompleto.trim(), documento,
      telefono: datos.telefono.trim(), email, direccion: datos.direccion.trim(),
    }))
  }
}