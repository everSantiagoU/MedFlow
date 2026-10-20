import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { crearServidor } from '../../src/infraestructura/http/servidor.js'
import { armarAplicacion } from '../dobles/armarAplicacion.js'
import { CitaDAOPrisma } from '../../src/infraestructura/persistencia/CitaDAOPrisma.js'
import type { ClientePrisma } from '../../src/infraestructura/persistencia/prisma.js'

describe('ACT-019: filtros de citas', () => {
  let app: ReturnType<typeof crearServidor>
  let token: string
  beforeEach(async () => {
    const { deps, almacenes } = await armarAplicacion()
    await almacenes.doctores.guardar({ nombreCompleto: 'Dr. Segundo', especialidad: 'General', registroMedico: 'RM-2', email: 'segundo@example.com' })
    for (const [doctorId, estado, fecha] of [
      [1, 'PROGRAMADA', '2030-05-12T00:00:00'],
      [1, 'COMPLETADA', '2030-05-12T23:59:59'],
      [2, 'PROGRAMADA', '2030-05-12T10:00:00'],
      [1, 'PROGRAMADA', '2030-05-13T00:00:00'],
      [2, 'CANCELADA', '2030-05-13T12:00:00'],
    ] as const) {
      await almacenes.citas.guardar({ pacienteId: 1, procedimientoId: 1, doctorId, estado, fechaHora: new Date(fecha + 'Z') })
    }
    app = crearServidor(deps)
    token = deps.tokens.emitir({ email: 'admin@medflow.com', rol: 'ADMIN' })
  })

  it.each([
    ['', [1, 3, 2, 4, 5]],
    ['fecha=2030-05-12', [1, 3, 2]],
    ['doctorId=1', [1, 2, 4]],
    ['estado=CANCELADA', [5]],
    ['fecha=2030-05-12&doctorId=1', [1, 2]],
    ['doctorId=1&estado=PROGRAMADA', [1, 4]],
    ['fecha=2030-05-12&estado=PROGRAMADA', [1, 3]],
    ['fecha=2030-05-12&doctorId=1&estado=PROGRAMADA', [1]],
    ['doctorId=999', []],
    ['fecha=2030-05-12&estado=CANCELADA', []],
  ])('combina filtros y conserva el orden: %s', async (query, ids) => {
    const res = await request(app).get('/api/v1/citas?' + query).set('Authorization', 'Bearer ' + token).expect(200)
    expect(res.body.map((c: { id: number }) => c.id)).toEqual(ids)
  })

  it.each(['fecha=2030-02-30', 'doctorId=0', 'doctorId=-1', 'doctorId=1.5', 'doctorId=abc', 'doctorId=2147483648', 'doctorId=1&doctorId=2', 'estado=TODOS', 'estado=', 'estado=PROGRAMADA&estado=CANCELADA'])('rechaza %s', async query => {
    const res = await request(app).get('/api/v1/citas?' + query).set('Authorization', 'Bearer ' + token).expect(400)
    expect(res.body.errores.length).toBeGreaterThan(0)
  })

  it('permite filtrar el estado NO_ASISTIO incorporado en main', async () => {
    const creado = await request(app).post('/api/v1/citas').set('Authorization', 'Bearer ' + token).send({
      pacienteId: 1, doctorId: 1, procedimientoId: 1, fechaHora: '2035-06-01T10:00:00', estado: 'NO_ASISTIO',
    }).expect(201)
    const res = await request(app).get('/api/v1/citas?doctorId=1&fecha=2035-06-01&estado=NO_ASISTIO').set('Authorization', 'Bearer ' + token).expect(200)
    expect(res.body.map((c: { id: number }) => c.id)).toEqual([creado.body.id])
  })

  it('mantiene la autenticación para consultas filtradas', async () => {
    await request(app).get('/api/v1/citas?doctorId=1').expect(401)
  })

  it('envía los tres filtros a Prisma con límites de día local y fin exclusivo', async () => {
    const findMany = vi.fn().mockResolvedValue([])
    const dao = new CitaDAOPrisma({ cita: { findMany } } as unknown as ClientePrisma)
    await dao.listarPorFecha('2030-05-12', { doctorId: 2, estado: 'PROGRAMADA' })
    expect(findMany).toHaveBeenCalledWith({
      where: { doctorId: 2, estado: 'PROGRAMADA', fechaHora: { gte: new Date('2030-05-12T00:00:00Z'), lt: new Date('2030-05-13T00:00:00Z') } },
      include: { paciente: true, doctor: true, procedimiento: true },
      orderBy: { fechaHora: 'asc' },
    })
  })
})
