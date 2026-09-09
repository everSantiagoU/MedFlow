import type { DoctorDAO } from '../../dominio/puertos/index.js'
import { aDoctorDTO } from '../conversores.js'
import { Conflicto } from '../errores.js'
import { ObtenerDoctor } from './ObtenerDoctor.js'
import type { DatosDoctor } from './tipos.js'

export class ActualizarDoctor {
  private readonly obtener: ObtenerDoctor
  constructor(private readonly doctores: DoctorDAO) {
    this.obtener = new ObtenerDoctor(doctores)
  }
  async ejecutar(id: number, datos: DatosDoctor) {
    const doctor = await this.obtener.buscarEntidad(id)
    const registroMedico = datos.registroMedico.trim()
    const email = datos.email.trim().toLowerCase()
    if (await this.doctores.existeRegistroMedico(registroMedico, id)) {
      throw new Conflicto(`Ya existe un doctor con el registro medico ${registroMedico}`)
    }
    if (await this.doctores.existeEmail(email, id)) throw new Conflicto(`El correo ${email} ya esta en uso`)
    return aDoctorDTO(await this.doctores.guardar({
      ...doctor,
      nombreCompleto: datos.nombreCompleto.trim(),
      especialidad: datos.especialidad.trim(),
      registroMedico,
      email,
    }))
  }
}
