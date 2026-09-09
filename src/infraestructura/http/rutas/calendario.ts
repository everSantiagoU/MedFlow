import { Router } from 'express'
import { SolicitudInvalida } from '../../../aplicacion/errores.js'
import { parsearFechaLocal } from '../../../aplicacion/fechas.js'
import type { DependenciasHttp } from './tipos.js'
import { validarEvento } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasCalendario(deps: DependenciasHttp): Router {
  const rutas = Router()
  rutas.get('/', manejar(async (req, res) => {
    const errores: string[] = []
    const doctorTexto = req.query['doctorId']
    const doctorValido = typeof doctorTexto === 'string' && /^-?\d+$/.test(doctorTexto)
    const doctorId = doctorValido ? Number(doctorTexto) : 0
    if (!doctorValido) errores.push('doctorId: es obligatorio')
    const desde = typeof req.query['desde'] === 'string' ? parsearFechaLocal(req.query['desde']) : null
    const hasta = typeof req.query['hasta'] === 'string' ? parsearFechaLocal(req.query['hasta']) : null
    if (!desde) errores.push('desde: debe tener formato YYYY-MM-DDTHH:mm:ss')
    if (!hasta) errores.push('hasta: debe tener formato YYYY-MM-DDTHH:mm:ss')
    if (errores.length) throw new SolicitudInvalida(errores)
    res.json(await deps.consultarCalendario.ejecutar(doctorId, desde!, hasta!))
  }))
  rutas.post('/eventos', manejar(async (req, res) => {
    res.status(201).json(await deps.registrarEventoCalendario.ejecutar(validarEvento(req.body)))
  }))
  return rutas
}
