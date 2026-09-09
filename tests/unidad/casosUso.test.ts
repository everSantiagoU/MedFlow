import { describe, expect, it } from 'vitest'
import { Conflicto, CredencialesInvalidas, RecursoNoEncontrado } from '../../src/aplicacion/errores.js'
import { parsearFechaLocal } from '../../src/aplicacion/fechas.js'
import { armarAplicacion } from '../dobles/armarAplicacion.js'

const futura = (hora = 10) => parsearFechaLocal(`2030-05-12T${String(hora).padStart(2, '0')}:00:00`)!

describe('autenticacion y entidades CRUD', () => {
  it('inicia sesion y conserva email y rol en el JWT', async () => {
    const { deps } = await armarAplicacion()
    const sesion = await deps.iniciarSesion.ejecutar('admin@medflow.com', 'Medflow123*')
    expect(sesion).toMatchObject({ usuarioId: 1, email: 'admin@medflow.com', rol: 'ADMIN' })
    expect(deps.tokens.verificar(sesion.token)).toEqual({ email: 'admin@medflow.com', rol: 'ADMIN' })
  })

  it('usa el mismo error para usuario ausente y clave incorrecta', async () => {
    const { deps } = await armarAplicacion()
    await expect(deps.iniciarSesion.ejecutar('nadie@medflow.com', 'x')).rejects.toBeInstanceOf(CredencialesInvalidas)
    await expect(deps.iniciarSesion.ejecutar('admin@medflow.com', 'x')).rejects.toBeInstanceOf(CredencialesInvalidas)
  })

  it('normaliza Doctor y rechaza registro medico o correo duplicados', async () => {
    const { deps } = await armarAplicacion()
    const datos = { nombreCompleto: ' Dr. Juan Ruiz ', especialidad: ' Pediatria ', registroMedico: ' RM-002 ', email: ' JUAN@MEDFLOW.COM ' }
    const doctor = await deps.registrarDoctor.ejecutar(datos)
    expect(doctor).toMatchObject({ nombreCompleto: 'Dr. Juan Ruiz', email: 'juan@medflow.com' })
    await expect(deps.registrarDoctor.ejecutar({ ...datos, email: 'otro@medflow.com' })).rejects.toBeInstanceOf(Conflicto)
    await expect(deps.registrarDoctor.ejecutar({ ...datos, registroMedico: 'RM-003' })).rejects.toBeInstanceOf(Conflicto)
  })

  it('crea, busca, actualiza y elimina Paciente y Procedimiento', async () => {
    const { deps } = await armarAplicacion()
    const paciente = await deps.registrarPaciente.ejecutar({ nombreCompleto: ' Carlos ', documento: ' CC-2 ', telefono: ' 300 ', email: ' CARLOS@MAIL.COM ', direccion: ' Calle 2 ' })
    expect((await deps.listarPacientes.ejecutar('carlos'))[0]?.email).toBe('carlos@mail.com')
    expect((await deps.actualizarPaciente.ejecutar(paciente.id, { ...paciente, telefono: '301' })).telefono).toBe('301')
    await deps.eliminarPaciente.ejecutar(paciente.id)
    await expect(deps.obtenerPaciente.ejecutar(paciente.id)).rejects.toBeInstanceOf(RecursoNoEncontrado)

    const procedimiento = await deps.registrarProcedimiento.ejecutar({ nombre: 'Radiografia', precio: 90000, duracionMinutos: 20 })
    expect((await deps.actualizarProcedimiento.ejecutar(procedimiento.id, { ...procedimiento, precio: 95000 })).precio).toBe(95000)
    await expect(deps.registrarProcedimiento.ejecutar({ nombre: 'RADIOGRAFIA', precio: 1, duracionMinutos: 1 })).rejects.toBeInstanceOf(Conflicto)
  })
})

describe('citas, calendario e historia clinica', () => {
  it('crea una cita con estado normalizado y detecta cruces de doctor y paciente', async () => {
    const { deps } = await armarAplicacion()
    const datos = { pacienteId: 1, doctorId: 1, procedimientoId: 1, fechaHora: futura(), estado: ' programada ' }
    expect((await deps.registrarCita.ejecutar(datos)).estado).toBe('PROGRAMADA')
    await expect(deps.registrarCita.ejecutar(datos)).rejects.toThrow('El doctor ya tiene una cita programada')
    expect((await deps.cancelarCita.ejecutar(1)).estado).toBe('CANCELADA')
    await expect(deps.registrarCita.ejecutar({ ...datos, estado: 'desconocida' })).rejects.toThrow('El estado de la cita no es valido')
  })

  it('combina eventos y citas ordenados y bloquea cruces por duracion', async () => {
    const { deps } = await armarAplicacion()
    await deps.registrarCita.ejecutar({ pacienteId: 1, doctorId: 1, procedimientoId: 1, fechaHora: futura(10) })
    await expect(deps.registrarEventoCalendario.ejecutar({ doctorId: 1, titulo: 'Reunion', inicio: futura(10), fin: futura(11) })).rejects.toThrow('cita programada')
    await deps.registrarEventoCalendario.ejecutar({ doctorId: 1, titulo: 'Reunion', inicio: futura(12), fin: futura(13) })
    const calendario = await deps.consultarCalendario.ejecutar(1, futura(9), futura(14))
    expect(calendario.map(e => e.tipo)).toEqual(['CITA', 'EVENTO'])
  })

  it('registra historia y completa la cita dentro del puerto transaccional', async () => {
    const { deps, almacenes } = await armarAplicacion()
    await deps.registrarCita.ejecutar({ pacienteId: 1, doctorId: 1, procedimientoId: 1, fechaHora: futura() })
    const historia = await deps.registrarHistoria.ejecutar({ citaId: 1, diagnostico: ' Faringitis ', observaciones: ' Dolor ', datosRelevantes: ' Sin alergias ' })
    expect(historia).toMatchObject({ citaEstado: 'COMPLETADA', diagnostico: 'Faringitis' })
    expect(almacenes.historias.transacciones).toBe(1)
    await expect(deps.registrarHistoria.ejecutar({ citaId: 1, diagnostico: 'x', observaciones: 'x', datosRelevantes: 'x' })).rejects.toThrow('ya tiene una historia')
  })
})
