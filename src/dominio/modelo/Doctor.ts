export interface Doctor {
  id: number
  nombreCompleto: string
  especialidad: string
  registroMedico: string
  email: string
}

export type DoctorNuevo = Omit<Doctor, 'id'>
