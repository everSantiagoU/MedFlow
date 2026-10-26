import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { crearServidor } from '../../src/infraestructura/http/servidor.js'
import { armarAplicacion } from '../dobles/armarAplicacion.js'

describe('registro de inasistencia a citas', () => {
  let app: ReturnType<typeof crearServidor>
  let token: string

  beforeEach(async () => {
    const { deps, almacenes } = await armarAplicacion()
    for (const [estado, fechaHora] of [
      ['PROGRAMADA', '2020-05-12T09:00:00Z'],
      ['PROGRAMADA', '2099-05-12T10:00:00Z'],
      ['COMPLETADA', '2020-05-12T11:00:00Z'],
      ['CANCELADA', '2020-05-12T12:00:00Z'],
      ['NO_ASISTIO', '2020-05-12T13:00:00Z'],
    ] as const) {
      await almacenes.citas.guardar({
        pacienteId: 1,
        doctorId: 1,
        procedimientoId: 1,
        estado,
        fechaHora: new Date(fechaHora),
      })
    }
    app = crearServidor(deps)
    token = deps.tokens.emitir({ email: 'admin@medflow.com', rol: 'ADMIN' })
  })

  it('marca una cita programada vencida y la refleja en listados, filtros y calendario', async () => {
    const actualizada = await request(app)
      .patch('/api/v1/citas/1/inasistencia')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(actualizada.body).toMatchObject({ id: 1, estado: 'NO_ASISTIO' })

    const filtradas = await request(app)
      .get('/api/v1/citas?estado=NO_ASISTIO')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(filtradas.body.map((cita: { id: number }) => cita.id)).toEqual([1, 5])

    const agenda = await request(app)
      .get('/api/v1/calendario?doctorId=1&desde=2020-05-12T00:00:00&hasta=2020-05-13T00:00:00')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(agenda.body.find((item: { citaId: number }) => item.citaId === 1)).toMatchObject({
      tipo: 'CITA',
      estado: 'NO_ASISTIO',
    })
  })

  it.each([
    [2, 'todavía no ha pasado'],
    [3, 'Solo una cita programada'],
    [4, 'Solo una cita programada'],
    [5, 'Solo una cita programada'],
  ])('rechaza la transición inválida de la cita %i', async (id, mensaje) => {
    const respuesta = await request(app)
      .patch(`/api/v1/citas/${id}/inasistencia`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409)
    expect(respuesta.body.mensaje).toContain(mensaje)
  })

  it('valida autenticación, identificador y existencia de la cita', async () => {
    await request(app).patch('/api/v1/citas/1/inasistencia').expect(401)
    await request(app).patch('/api/v1/citas/abc/inasistencia').set('Authorization', `Bearer ${token}`).expect(400)
    await request(app).patch('/api/v1/citas/999/inasistencia').set('Authorization', `Bearer ${token}`).expect(404)
  })

  it('impide asignar NO_ASISTIO mediante creación o edición general', async () => {
    const datos = {
      pacienteId: 1,
      doctorId: 1,
      procedimientoId: 1,
      fechaHora: '2099-06-01T10:00:00',
      estado: 'NO_ASISTIO',
    }
    const creacion = await request(app)
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send(datos)
      .expect(409)
    expect(creacion.body.mensaje).toContain('registro de inasistencia')

    const edicion = await request(app)
      .put('/api/v1/citas/2')
      .set('Authorization', `Bearer ${token}`)
      .send(datos)
      .expect(409)
    expect(edicion.body.mensaje).toContain('registro de inasistencia')
  })
})
