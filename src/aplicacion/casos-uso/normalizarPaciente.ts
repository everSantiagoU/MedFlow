import type { DatosPaciente } from './tipos.js'

export function normalizarPaciente(datos: DatosPaciente): DatosPaciente {
  return {
    nombreCompleto: datos.nombreCompleto.trim(),
    documento: datos.documento.trim(),
    telefono: datos.telefono.trim(),
    email: datos.email.trim().toLowerCase(),
    direccion: datos.direccion.trim(),
  }
}
