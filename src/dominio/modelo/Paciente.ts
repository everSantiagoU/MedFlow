export interface Paciente {
  id: number
  nombreCompleto: string
  documento: string
  telefono: string
  email: string
  direccion: string
}

export type PacienteNuevo = Omit<Paciente, 'id'>
