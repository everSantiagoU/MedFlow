import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { aDoctorDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { normalizarDoctor } from './normalizarDoctor.js'
import type { DatosDoctor } from './tipos.js'

export class RegistrarDoctor {
  constructor(private readonly doctores: DoctorDAO) {}
  async ejecutar(datos: DatosDoctor) {
    const normalizado = normalizarDoctor(datos)
    const { registroMedico, email } = normalizado
    if (await this.doctores.existeRegistroMedico(registroMedico)) {
      throw new Conflicto(`Ya existe un doctor con el registro medico ${registroMedico}`)
    }
    if (await this.doctores.existeEmail(email)) throw new Conflicto(`El correo ${email} ya esta en uso`)
    return aDoctorDTO(await this.doctores.guardar(normalizado))
  }
}
