import express, { Router } from 'express'
import type { ErrorRequestHandler, Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import { ErrorAplicacion } from '../../aplicacion/errores.js'
import { traducirErrorPrisma } from '../persistencia/erroresPrisma.js'
import { openapi } from './openapi.js'
import { rutasAutenticacion } from './rutas/autenticacion.js'
import { rutasCalendario } from './rutas/calendario.js'
import { rutasCitas } from './rutas/citas.js'
import { rutasDoctores } from './rutas/doctores.js'
import { rutasHistoriasClinicas } from './rutas/historiasClinicas.js'
import { rutasPacientes } from './rutas/pacientes.js'
import { rutasProcedimientos } from './rutas/procedimientos.js'
import { exigirSesion } from './rutas/soporte.js'
import type { DependenciasHttp } from './rutas/tipos.js'

const errores: ErrorRequestHandler = (error, _req, res, _next) => {
  const conocido = error instanceof ErrorAplicacion ? error : traducirErrorPrisma(error)
  if (conocido instanceof ErrorAplicacion) {
    res.status(conocido.estadoHttp).json({ mensaje: conocido.message, errores: conocido.errores })
    return
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ mensaje: 'La solicitud contiene errores de validacion', errores: ['body: JSON invalido'] })
    return
  }
  console.error(error)
  res.status(500).json({ mensaje: 'Error interno del servidor', errores: [] })
}

export function crearServidor(deps: DependenciasHttp, frontendUrl = 'http://localhost:5173'): Express {
  const api = Router()
  api.get('/salud', (_req, res) => void res.json({ estado: 'ok' }))
  api.get('/openapi.json', (_req, res) => void res.json(openapi))
  api.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'MedFlow API' }))
  api.use('/auth', rutasAutenticacion(deps.iniciarSesion))
  api.use(exigirSesion(deps.tokens))
  api.use('/doctores', rutasDoctores(deps))
  api.use('/pacientes', rutasPacientes(deps))
  api.use('/procedimientos', rutasProcedimientos(deps))
  api.use('/citas', rutasCitas(deps))
  api.use('/calendario', rutasCalendario(deps))
  api.use('/historias-clinicas', rutasHistoriasClinicas(deps))

  const app = express()
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', frontendUrl)
    res.header('Vary', 'Origin')
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    if (req.method === 'OPTIONS') { res.sendStatus(200); return }
    next()
  })
  app.use(express.json())
  app.use('/api/v1', api)
  app.use((_req, res) => void res.status(404).json({ mensaje: 'Ruta no encontrada', errores: [] }))
  app.use(errores)
  return app
}
