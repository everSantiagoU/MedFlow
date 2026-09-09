import { Router } from 'express'
import type { DependenciasHttp } from './tipos.js'
import { validarHistoria, validarId } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasHistoriasClinicas(deps: DependenciasHttp): Router {
  const rutas = Router()
  rutas.get('/', manejar(async (_req, res) => res.json(await deps.listarHistorias.ejecutar())))
  rutas.get('/paciente/:pacienteId', manejar(async (req, res) => res.json(
    await deps.listarHistoriasPorPaciente.ejecutar(validarId(req.params['pacienteId'] ?? '')),
  )))
  rutas.get('/:id', manejar(async (req, res) => res.json(await deps.obtenerHistoria.ejecutar(validarId(req.params['id'] ?? '')))))
  rutas.post('/', manejar(async (req, res) => res.status(201).json(await deps.registrarHistoria.ejecutar(validarHistoria(req.body)))))
  rutas.put('/:id', manejar(async (req, res) => res.json(await deps.actualizarHistoria.ejecutar(validarId(req.params['id'] ?? ''), validarHistoria(req.body)))))
  return rutas
}
