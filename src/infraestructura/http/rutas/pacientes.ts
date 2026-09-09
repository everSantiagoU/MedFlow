import { Router } from 'express'
import type { DependenciasHttp } from './tipos.js'
import { validarId, validarPaciente } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasPacientes(deps: DependenciasHttp): Router {
  const rutas = Router()
  rutas.get('/', manejar(async (req, res) => {
    const busqueda = typeof req.query['busqueda'] === 'string' ? req.query['busqueda'] : undefined
    res.json(await deps.listarPacientes.ejecutar(busqueda))
  }))
  rutas.get('/:id', manejar(async (req, res) => res.json(await deps.obtenerPaciente.ejecutar(validarId(req.params['id'] ?? '')))))
  rutas.post('/', manejar(async (req, res) => res.status(201).json(await deps.registrarPaciente.ejecutar(validarPaciente(req.body)))))
  rutas.put('/:id', manejar(async (req, res) => res.json(await deps.actualizarPaciente.ejecutar(validarId(req.params['id'] ?? ''), validarPaciente(req.body)))))
  rutas.delete('/:id', manejar(async (req, res) => {
    await deps.eliminarPaciente.ejecutar(validarId(req.params['id'] ?? ''))
    res.status(204).send()
  }))
  return rutas
}
