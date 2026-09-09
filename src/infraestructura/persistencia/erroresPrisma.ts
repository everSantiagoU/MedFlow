import { Conflicto } from '../../aplicacion/errores.js'

export function traducirErrorPrisma(error: unknown): Error | null {
  const codigo = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : ''
  if (codigo === 'P2002') return new Conflicto('Ya existe un registro con esos datos')
  if (codigo === 'P2003') return new Conflicto('No se puede completar la operacion porque existen registros relacionados')
  if (codigo === 'P2025') return new Conflicto('El registro solicitado ya no existe')
  return null
}
