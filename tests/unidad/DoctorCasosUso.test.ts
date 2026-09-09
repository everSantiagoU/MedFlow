import { describe, expect, it } from 'vitest'
import { RegistrarDoctor } from '../../src/aplicacion/casos-uso/RegistrarDoctor.js'
import { ActualizarDoctor } from '../../src/aplicacion/casos-uso/ActualizarDoctor.js'
import { EliminarDoctor } from '../../src/aplicacion/casos-uso/EliminarDoctor.js'
import { ObtenerDoctor } from '../../src/aplicacion/casos-uso/ObtenerDoctor.js'
import { ListarDoctores } from '../../src/aplicacion/casos-uso/ListarDoctores.js'
import { Conflicto, RecursoNoEncontrado } from '../../src/aplicacion/errores.js'
import { DoctorDAOEnMemoria } from '../dobles/DoctorDAOEnMemoria.js'

const datos = {
  "nombreCompleto": " Ana Perez ",
  "especialidad": " General ",
  "registroMedico": " RM-100 ",
  "email": " ANA@CORREO.COM "
}
const normalizado = {
  "nombreCompleto": "Ana Perez",
  "especialidad": "General",
  "registroMedico": "RM-100",
  "email": "ana@correo.com"
}

function armar() {
  const dao = new DoctorDAOEnMemoria()
  const obtener = new ObtenerDoctor(dao)
  return {
    dao, obtener,
    registrar: new RegistrarDoctor(dao),
    actualizar: new ActualizarDoctor(dao, obtener),
    eliminar: new EliminarDoctor(dao, obtener),
    listar: new ListarDoctores(dao),
  }
}

describe('Doctor: casos de uso', () => {
  it('normaliza los campos y conserva la solicitud original', async () => {
    const { registrar, dao } = armar()
    const entrada = Object.freeze({ ...datos })
    const creado = await registrar.ejecutar(entrada)
    expect(creado).toEqual({ id: 1, ...normalizado })
    expect(await dao.porId(creado.id)).toEqual(creado)
    expect(entrada).toEqual(datos)
  })

  it.each([
    { registroMedico: datos.registroMedico.toLowerCase(), email: 'otro@correo.com' },
    { registroMedico: 'OTRO-200', email: datos.email },
  ])('rechaza duplicados al registrar: %j', async cambios => {
    const { registrar, dao } = armar()
    await registrar.ejecutar(datos)
    await expect(registrar.ejecutar({ ...datos, ...cambios })).rejects.toBeInstanceOf(Conflicto)
    expect(dao.filas).toHaveLength(1)
  })

  it('permite editar los valores propios y conserva el ID', async () => {
    const { registrar, actualizar, dao } = armar()
    const creado = await registrar.ejecutar(datos)
    const actualizado = await actualizar.ejecutar(creado.id, { ...datos, nombreCompleto: ' Ana Actualizada ' })
    expect(actualizado).toEqual({ ...creado, nombreCompleto: 'Ana Actualizada' })
    expect(dao.filas).toHaveLength(1)
  })

  it.each([
    { registroMedico: datos.registroMedico.toLowerCase(), email: 'otro@correo.com' },
    { registroMedico: 'OTRO-200', email: datos.email },
  ])('rechaza duplicados al editar sin alterar el registro: %j', async cambios => {
    const { registrar, actualizar, dao } = armar()
    await registrar.ejecutar(datos)
    const otro = await registrar.ejecutar({ ...datos, registroMedico: 'OTRO-200', email: 'otro@correo.com' })
    await expect(actualizar.ejecutar(otro.id, { ...otro, ...cambios })).rejects.toBeInstanceOf(Conflicto)
    expect(await dao.porId(otro.id)).toEqual(otro)
  })

  it('lista por nombre y normaliza el filtro de busqueda', async () => {
    const { registrar, listar } = armar()
    const ana = await registrar.ejecutar(datos)
    const beatriz = await registrar.ejecutar({ ...datos, nombreCompleto: 'Beatriz', registroMedico: 'OTRO-200', email: 'otro@correo.com' })
    expect(await listar.ejecutar()).toEqual([ana, beatriz])
    expect(await listar.ejecutar('  ')).toEqual([ana, beatriz])
    expect(await listar.ejecutar(' ANA ')).toEqual([ana])
    expect(await listar.ejecutar('inexistente')).toEqual([])
  })

  it.each(Object.values(normalizado))('busca por cada campo publicado: %s', async filtro => {
    const { registrar, listar } = armar()
    const creado = await registrar.ejecutar(datos)
    expect(await listar.ejecutar(filtro)).toEqual([creado])
  })

  it('obtiene y elimina; rechaza operaciones sobre IDs ausentes', async () => {
    const { registrar, obtener, actualizar, eliminar, dao } = armar()
    const creado = await registrar.ejecutar(datos)
    expect(await obtener.ejecutar(creado.id)).toEqual(creado)
    await eliminar.ejecutar(creado.id)
    await expect(obtener.ejecutar(creado.id)).rejects.toBeInstanceOf(RecursoNoEncontrado)
    await expect(actualizar.ejecutar(creado.id, datos)).rejects.toBeInstanceOf(RecursoNoEncontrado)
    await expect(eliminar.ejecutar(creado.id)).rejects.toBeInstanceOf(RecursoNoEncontrado)
    expect(dao.filas).toEqual([])
  })

  it('el doble no borra registros ajenos ni reutiliza IDs eliminados', async () => {
    const { registrar, dao } = armar()
    const creado = await registrar.ejecutar(datos)
    await expect(dao.eliminar(999)).rejects.toBeInstanceOf(RecursoNoEncontrado)
    expect(await dao.porId(creado.id)).toEqual(creado)
    await dao.eliminar(creado.id)
    const otro = await registrar.ejecutar(datos)
    expect(otro.id).toBeGreaterThan(creado.id)
  })
})
