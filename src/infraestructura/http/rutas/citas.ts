import { Router } from 'express'
import type { DependenciasHttp } from './tipos.js'
import { validarCita, validarFechaConsulta, validarId } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasCitas(deps: DependenciasHttp): Router {
  const rutas = Router()
  rutas.get('/', manejar(async (req, res) => res.json(await deps.listarCitas.ejecutar(validarFechaConsulta(req.query['fecha'])))))
  rutas.post('/', manejar(async (req, res) => res.status(201).json(await deps.registrarCita.ejecutar(validarCita(req.body)))))
  rutas.get('/:id', manejar(async (req, res) => res.json(await deps.obtenerCita.ejecutar(validarId(req.params['id'] ?? '')))))
  rutas.put('/:id', manejar(async (req, res) => res.json(await deps.actualizarCita.ejecutar(validarId(req.params['id'] ?? ''), validarCita(req.body)))))
  rutas.patch('/:id/cancelar', manejar(async (req, res) => res.json(await deps.cancelarCita.ejecutar(validarId(req.params['id'] ?? '')))))
  return rutas
}
