import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { aDoctorDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import type { ObtenerDoctor } from './ObtenerDoctor.js'
import { normalizarDoctor } from './normalizarDoctor.js'
import type { DatosDoctor } from './tipos.js'

export class ActualizarDoctor {
  constructor(
    private readonly doctores: DoctorDAO,
    private readonly obtener: ObtenerDoctor,
  ) {}
  async ejecutar(id: number, datos: DatosDoctor) {
    const doctor = await this.obtener.buscarEntidad(id)
    const normalizado = normalizarDoctor(datos)
    const { registroMedico, email } = normalizado
    if (await this.doctores.existeRegistroMedico(registroMedico, id)) {
      throw new Conflicto(`Ya existe un doctor con el registro medico ${registroMedico}`)
    }
    if (await this.doctores.existeEmail(email, id)) throw new Conflicto(`El correo ${email} ya esta en uso`)
    return aDoctorDTO(await this.doctores.guardar({ ...doctor, ...normalizado }))
  }
}
