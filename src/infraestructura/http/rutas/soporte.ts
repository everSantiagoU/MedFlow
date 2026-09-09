import type { RequestHandler } from 'express'
import type { ServicioTokens } from '../../../dominio/puertos/index.js'

export const manejar = (accion: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(accion(req, res, next)).catch(next)
}

export function exigirSesion(tokens: ServicioTokens): RequestHandler {
  return (req, res, next) => {
    const cabecera = req.headers.authorization ?? ''
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : ''
    const credencial = tokens.verificar(token)
    if (!credencial) {
      res.status(401).json({ mensaje: 'Autenticacion requerida o token invalido', errores: [] })
      return
    }
    res.locals['credencial'] = credencial
    next()
  }
}
