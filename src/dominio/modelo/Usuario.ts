export const ROLES = ['ADMIN', 'MEDICO', 'PACIENTE'] as const
export type Rol = (typeof ROLES)[number]

export interface Usuario {
  id: number
  email: string
  password: string
  rol: Rol
}

export const esRol = (valor: unknown): valor is Rol =>
  typeof valor === 'string' && ROLES.includes(valor as Rol)
