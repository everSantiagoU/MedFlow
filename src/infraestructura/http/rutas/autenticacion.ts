import { Router } from 'express'
import type { IniciarSesion } from '../../../aplicacion/casos-uso/IniciarSesion.js'
import { validarLogin } from '../validacion.js'
import { manejar } from './soporte.js'

export function rutasAutenticacion(iniciarSesion: IniciarSesion): Router {
  const rutas = Router()
  rutas.post('/login', manejar(async (req, res) => {
    const datos = validarLogin(req.body)
    res.json(await iniciarSesion.ejecutar(datos.email, datos.password))
  }))
  return rutas
}
