import type { DatosDoctor } from './tipos.js'

export function normalizarDoctor(datos: DatosDoctor): DatosDoctor {
  return {
    nombreCompleto: datos.nombreCompleto.trim(),
    especialidad: datos.especialidad.trim(),
    registroMedico: datos.registroMedico.trim(),
    email: datos.email.trim().toLowerCase(),
  }
}
