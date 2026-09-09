import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { crearServidor } from '../../src/infraestructura/http/servidor.js'
import { armarAplicacion } from '../dobles/armarAplicacion.js'

const escenarios = [
  {
    nombre: 'Doctor', ruta: 'doctores',
    datos: { nombreCompleto: ' Beatriz ', especialidad: ' General ', registroMedico: ' RM-200 ', email: ' BEATRIZ@CORREO.COM ' },
    unico: 'registroMedico', duplicado: ' rm-001 ', correoExistente: ' LAURA@MEDFLOW.COM ',
  },
  {
    nombre: 'Paciente', ruta: 'pacientes',
    datos: { nombreCompleto: ' Beatriz ', documento: ' CC-200 ', telefono: ' 3001234567 ', direccion: ' Calle 20 ', email: ' BEATRIZ@CORREO.COM ' },
    unico: 'documento', duplicado: ' cc-1 ', correoExistente: ' ANA@CORREO.COM ',
  },
] as const

describe.each(escenarios)('$nombre: contrato HTTP', escenario => {
  let app: ReturnType<typeof crearServidor>
  let armado: Awaited<ReturnType<typeof armarAplicacion>>
  let auth: string
  const url = `/api/v1/${escenario.ruta}`

  beforeEach(async () => {
    armado = await armarAplicacion()
    app = crearServidor(armado.deps)
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'admin@medflow.com', password: 'Medflow123*' }).expect(200)
    auth = `Bearer ${login.body.token}`
  })

  it.each(['get', 'post', 'put', 'delete'] as const)('requiere JWT valido en %s', async metodo => {
    const destino = metodo === 'put' || metodo === 'delete' ? `${url}/1` : url
    await request(app)[metodo](destino).send(escenario.datos).expect(401)
    await request(app)[metodo](destino).set('Authorization', 'Bearer invalido').send(escenario.datos).expect(401)
  })

  it('completa CRUD y conserva el cuerpo de actualizacion propio de cada entidad', async () => {
    const creado = await request(app).post(url).set('Authorization', auth).send(escenario.datos).expect(201)
    const esperado = {
      ...Object.fromEntries(Object.entries(escenario.datos).map(([campo, valor]) =>
        [campo, campo === 'email' ? valor.trim().toLowerCase() : valor.trim()])),
      id: creado.body.id,
    }
    expect(creado.body).toEqual(esperado)
    await request(app).get(`${url}/${creado.body.id}`).set('Authorization', auth).expect(200, esperado)
    await request(app).get(url).query({ busqueda: ' BEATRIZ ' }).set('Authorization', auth).expect(200, [esperado])
    await request(app).get(url).set('Authorization', auth).expect(200)
    const actualizado = await request(app).put(`${url}/${creado.body.id}`).set('Authorization', auth)
      .send({ ...escenario.datos, nombreCompleto: ' Beatriz Actualizada ' }).expect(200)
    const entidad = { ...esperado, nombreCompleto: 'Beatriz Actualizada' }
    expect(actualizado.body).toEqual(escenario.nombre === 'Doctor'
      ? { mensaje: 'Doctor actualizado correctamente', doctor: entidad }
      : entidad)
    const eliminado = await request(app).delete(`${url}/${creado.body.id}`).set('Authorization', auth).expect(204)
    expect(eliminado.text).toBe('')
    await request(app).get(`${url}/${creado.body.id}`).set('Authorization', auth).expect(404)
  })

  it.each(['identificador', 'email'])('rechaza duplicados de %s en POST y PUT', async campo => {
    const cambio = campo === 'email' ? { email: escenario.correoExistente } : { [escenario.unico]: escenario.duplicado }
    const duplicado = await request(app).post(url).set('Authorization', auth).send({ ...escenario.datos, ...cambio }).expect(409)
    expect(duplicado.body).toEqual({ mensaje: expect.any(String), errores: [] })
    const creado = await request(app).post(url).set('Authorization', auth).send(escenario.datos).expect(201)
    await request(app).put(`${url}/${creado.body.id}`).set('Authorization', auth).send({ ...escenario.datos, ...cambio }).expect(409)
    await request(app).get(`${url}/${creado.body.id}`).set('Authorization', auth).expect(200, creado.body)
  })

  it.each(['get', 'put', 'delete'] as const)('valida ID y recurso ausente en %s', async metodo => {
    for (const id of ['abc', '9007199254740993', '2147483648']) {
      const invalido = await request(app)[metodo](`${url}/${id}`).set('Authorization', auth).send(escenario.datos).expect(400)
      expect(invalido.body.errores.length).toBeGreaterThan(0)
    }
    await request(app)[metodo](`${url}/999`).set('Authorization', auth).send(escenario.datos).expect(404, {
      mensaje: `${escenario.nombre} no encontrado con id 999`, errores: [],
    })
  })

  it.each(['post', 'put'] as const)('valida datos en %s', async metodo => {
    for (const datos of [{}, { ...escenario.datos, nombreCompleto: ' ' }, { ...escenario.datos, email: 'correo invalido' }, { ...escenario.datos, email: 123 }, { ...escenario.datos, nombreCompleto: 'x'.repeat(151) }]) {
      const respuesta = await request(app)[metodo](metodo === 'post' ? url : `${url}/1`)
        .set('Authorization', auth).send(datos).expect(400)
      expect(respuesta.body).toMatchObject({ mensaje: 'La solicitud contiene errores de validacion', errores: expect.any(Array) })
    }
  })

  it('conserva 409 para errores unicos y relaciones de Prisma', async () => {
    const dao = armado.almacenes[escenario.ruta]
    vi.spyOn(dao, 'guardar').mockRejectedValueOnce({ code: 'P2002' })
    await request(app).post(url).set('Authorization', auth).send(escenario.datos)
      .expect(409, { mensaje: 'Ya existe un registro con esos datos', errores: [] })
    vi.spyOn(dao, 'eliminar').mockRejectedValueOnce({ code: 'P2003' })
    await request(app).delete(`${url}/1`).set('Authorization', auth)
      .expect(409, { mensaje: 'No se puede completar la operacion porque existen registros relacionados', errores: [] })
    await request(app).get(`${url}/1`).set('Authorization', auth).expect(200)
  })
})

describe('consultas inyectadas en citas e historias', () => {
  it('comparte ObtenerDoctor y ObtenerPaciente al crear y actualizar citas', async () => {
    const { deps } = await armarAplicacion()
    const doctor = vi.spyOn(deps.obtenerDoctor, 'buscarEntidad')
    const paciente = vi.spyOn(deps.obtenerPaciente, 'buscarEntidad')
    const datos = { doctorId: 1, pacienteId: 1, procedimientoId: 1, fechaHora: new Date('2030-05-12T10:00:00Z') }
    const cita = await deps.registrarCita.ejecutar(datos)
    await deps.actualizarCita.ejecutar(cita.id, { ...datos, fechaHora: new Date('2030-05-12T11:00:00Z') })
    expect(doctor).toHaveBeenCalledTimes(2)
    expect(paciente).toHaveBeenCalledTimes(2)
    await expect(deps.registrarCita.ejecutar({ ...datos, pacienteId: 999 })).rejects.toThrow('Paciente no encontrado')
    await expect(deps.registrarCita.ejecutar({ ...datos, doctorId: 999 })).rejects.toThrow('Doctor no encontrado')
    expect(await deps.listarHistoriasPorPaciente.ejecutar(1)).toEqual([])
    await expect(deps.listarHistoriasPorPaciente.ejecutar(999)).rejects.toThrow('Paciente no encontrado')
  })
})
