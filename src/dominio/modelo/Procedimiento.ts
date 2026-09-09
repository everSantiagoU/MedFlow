export interface Procedimiento {
  id: number
  nombre: string
  precio: number
  duracionMinutos: number
}

export type ProcedimientoNuevo = Omit<Procedimiento, 'id'>
