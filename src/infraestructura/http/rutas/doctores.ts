import { Router } from 'express'
import type { DependenciasHttp } from './tipos.js'
import { validarDoctor, validarId } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasDoctores(deps: DependenciasHttp): Router {
  const rutas = Router()
  rutas.get('/', manejar(async (req, res) => {
    const busqueda = typeof req.query['busqueda'] === 'string' ? req.query['busqueda'] : undefined
    res.json(await deps.listarDoctores.ejecutar(busqueda))
  }))
  rutas.get('/:id', manejar(async (req, res) => res.json(await deps.obtenerDoctor.ejecutar(validarId(req.params['id'] ?? '')))))
  rutas.post('/', manejar(async (req, res) => res.status(201).json(await deps.registrarDoctor.ejecutar(validarDoctor(req.body)))))
  rutas.put('/:id', manejar(async (req, res) => {
    const doctor = await deps.actualizarDoctor.ejecutar(validarId(req.params['id'] ?? ''), validarDoctor(req.body))
    res.json({ mensaje: 'Doctor actualizado correctamente', doctor })
  }))
  rutas.delete('/:id', manejar(async (req, res) => {
    await deps.eliminarDoctor.ejecutar(validarId(req.params['id'] ?? ''))
    res.status(204).send()
  }))
  return rutas
}
