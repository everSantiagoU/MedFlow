import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { crearServidor } from '../../src/infraestructura/http/servidor.js'
import { armarAplicacion } from '../dobles/armarAplicacion.js'

describe('contrato HTTP /api/v1', () => {
  let app: ReturnType<typeof crearServidor>
  let token: string

  beforeEach(async () => {
    const armado = await armarAplicacion()
    app = crearServidor(armado.deps)
    token = (await request(app).post('/api/v1/auth/login').send({ email: 'admin@medflow.com', password: 'Medflow123*' })).body.token as string
  })

  it('expone salud y OpenAPI sin autenticacion', async () => {
    await request(app).get('/api/v1/salud').expect(200, { estado: 'ok' })
    const spec = await request(app).get('/api/v1/openapi.json').expect(200)
    expect(spec.body.paths['/historias-clinicas/paciente/{pacienteId}']).toBeDefined()
  })

  it('protege todos los endpoints de negocio', async () => {
    await request(app).get('/api/v1/doctores').expect(401, { mensaje: 'Autenticacion requerida o token invalido', errores: [] })
    await request(app).get('/api/v1/doctores').set('Authorization', `Bearer ${token}`).expect(200)
  })

  it('conserva codigos, respuesta especial de Doctor y formato de error', async () => {
    const creado = await request(app).post('/api/v1/doctores').set('Authorization', `Bearer ${token}`).send({
      nombreCompleto: 'Dr. Juan', especialidad: 'Pediatria', registroMedico: 'RM-2', email: 'JUAN@MEDFLOW.COM',
    }).expect(201)
    const actualizado = await request(app).put(`/api/v1/doctores/${creado.body.id}`).set('Authorization', `Bearer ${token}`).send({
      ...creado.body, nombreCompleto: 'Dr. Juan Actualizado',
    }).expect(200)
    expect(actualizado.body).toMatchObject({ mensaje: 'Doctor actualizado correctamente', doctor: { email: 'juan@medflow.com' } })
    await request(app).delete(`/api/v1/doctores/${creado.body.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    const invalido = await request(app).post('/api/v1/pacientes').set('Authorization', `Bearer ${token}`).send({}).expect(400)
    expect(invalido.body).toEqual(expect.objectContaining({ mensaje: 'La solicitud contiene errores de validacion', errores: expect.any(Array) }))
  })

  it('mantiene fechas locales sin Z', async () => {
    const respuesta = await request(app).post('/api/v1/citas').set('Authorization', `Bearer ${token}`).send({
      pacienteId: 1, doctorId: 1, procedimientoId: 1, fechaHora: '2030-05-12T10:00:00', estado: '',
    }).expect(201)
    expect(respuesta.body.fechaHora).toBe('2030-05-12T10:00:00')
    expect(respuesta.body.estado).toBe('PROGRAMADA')
  })
})
