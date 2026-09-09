import { Router } from 'express'
import type { DependenciasHttp } from './tipos.js'
import { validarId, validarProcedimiento } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasProcedimientos(deps: DependenciasHttp): Router {
  const rutas = Router()
  rutas.get('/', manejar(async (req, res) => {
    const busqueda = typeof req.query['busqueda'] === 'string' ? req.query['busqueda'] : undefined
    res.json(await deps.listarProcedimientos.ejecutar(busqueda))
  }))
  rutas.get('/:id', manejar(async (req, res) => res.json(await deps.obtenerProcedimiento.ejecutar(validarId(req.params['id'] ?? '')))))
  rutas.post('/', manejar(async (req, res) => res.status(201).json(await deps.registrarProcedimiento.ejecutar(validarProcedimiento(req.body)))))
  rutas.put('/:id', manejar(async (req, res) => res.json(await deps.actualizarProcedimiento.ejecutar(validarId(req.params['id'] ?? ''), validarProcedimiento(req.body)))))
  rutas.delete('/:id', manejar(async (req, res) => {
    await deps.eliminarProcedimiento.ejecutar(validarId(req.params['id'] ?? ''))
    res.status(204).send()
  }))
  return rutas
}
