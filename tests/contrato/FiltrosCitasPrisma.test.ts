import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import type { FiltrosCitas } from '../../src/dominio/puertos/index.js'
import { CitaDAOPrisma } from '../../src/infraestructura/persistencia/CitaDAOPrisma.js'
import { crearPrisma } from '../../src/infraestructura/persistencia/prisma.js'

describe.skipIf(process.env['CITAS_MYSQL_TEST'] !== 'true')('Filtros de citas en MySQL', () => {
  it('aplica filtros individuales y combinados sobre registros reales y revierte los datos', async () => {
    expect(process.env['DATABASE_NAME']).toMatch(/^clinica_db_(node|java)_test$/)
    const prisma = crearPrisma()
    const marca = randomUUID().slice(0, 8)
    const revertir = new Error('Rollback de prueba')

    try {
      await expect(prisma.$transaction(async tx => {
        const doctorUno = await tx.doctor.create({ data: {
          nombreCompleto: `Doctor filtros ${marca} A`, especialidad: 'General',
          registroMedico: `RF-${marca}-A`, email: `filtros-${marca}-a@prueba.local`,
        } })
        const doctorDos = await tx.doctor.create({ data: {
          nombreCompleto: `Doctor filtros ${marca} B`, especialidad: 'General',
          registroMedico: `RF-${marca}-B`, email: `filtros-${marca}-b@prueba.local`,
        } })
        const paciente = await tx.paciente.create({ data: {
          nombreCompleto: `Paciente filtros ${marca}`, documento: `PF-${marca}`,
          telefono: '3001234567', direccion: 'Calle de prueba',
          email: `paciente-filtros-${marca}@prueba.local`,
        } })
        const procedimiento = await tx.procedimiento.create({ data: {
          nombre: `Procedimiento filtros ${marca}`, precio: 100, duracionMinutos: 30,
        } })

        const datos = [
          ['uno-programada-dia', doctorUno.id, 'PROGRAMADA', '2098-05-12T00:00:00Z'],
          ['uno-completada-dia', doctorUno.id, 'COMPLETADA', '2098-05-12T23:59:59Z'],
          ['dos-programada-dia', doctorDos.id, 'PROGRAMADA', '2098-05-12T10:00:00Z'],
          ['uno-programada-siguiente', doctorUno.id, 'PROGRAMADA', '2098-05-13T00:00:00Z'],
          ['dos-cancelada-siguiente', doctorDos.id, 'CANCELADA', '2098-05-13T12:00:00Z'],
        ] as const
        const etiquetasPorId = new Map<number, string>()

        for (const [etiqueta, doctorId, estado, fechaHora] of datos) {
          const cita = await tx.cita.create({ data: {
            doctorId, estado, fechaHora: new Date(fechaHora),
            pacienteId: paciente.id, procedimientoId: procedimiento.id,
          } })
          etiquetasPorId.set(cita.id, etiqueta)
        }

        const dao = new CitaDAOPrisma(tx)
        const casos: Array<[string | undefined, FiltrosCitas, string[]]> = [
          ['2098-05-12', {}, ['uno-programada-dia', 'dos-programada-dia', 'uno-completada-dia']],
          [undefined, { doctorId: doctorUno.id }, ['uno-programada-dia', 'uno-completada-dia', 'uno-programada-siguiente']],
          [undefined, { estado: 'CANCELADA' }, ['dos-cancelada-siguiente']],
          ['2098-05-12', { doctorId: doctorUno.id }, ['uno-programada-dia', 'uno-completada-dia']],
          [undefined, { doctorId: doctorUno.id, estado: 'PROGRAMADA' }, ['uno-programada-dia', 'uno-programada-siguiente']],
          ['2098-05-12', { estado: 'PROGRAMADA' }, ['uno-programada-dia', 'dos-programada-dia']],
          ['2098-05-12', { doctorId: doctorUno.id, estado: 'PROGRAMADA' }, ['uno-programada-dia']],
        ]

        for (const [fecha, filtros, esperadas] of casos) {
          const encontradas = (await dao.listarPorFecha(fecha, filtros))
            .filter(cita => etiquetasPorId.has(cita.id))
            .map(cita => etiquetasPorId.get(cita.id))
          expect(encontradas).toEqual(esperadas)
        }

        const idInasistencia = [...etiquetasPorId.entries()]
          .find(([, etiqueta]) => etiqueta === 'uno-programada-dia')?.[0]
        expect(idInasistencia).toBeDefined()
        const actualizada = await dao.actualizarEstado(idInasistencia!, 'NO_ASISTIO')
        expect(actualizada.estado).toBe('NO_ASISTIO')
        const inasistencias = (await dao.listarPorFecha('2098-05-12', { estado: 'NO_ASISTIO' }))
          .filter(cita => etiquetasPorId.has(cita.id))
          .map(cita => etiquetasPorId.get(cita.id))
        expect(inasistencias).toEqual(['uno-programada-dia'])

        const [citaConRelaciones] = await dao.listarPorFecha('2098-05-12', {
          doctorId: doctorUno.id,
          estado: 'NO_ASISTIO',
        })
        expect(citaConRelaciones).toMatchObject({
          doctor: { id: doctorUno.id, nombreCompleto: doctorUno.nombreCompleto },
          paciente: { id: paciente.id, nombreCompleto: paciente.nombreCompleto },
          procedimiento: { id: procedimiento.id, nombre: procedimiento.nombre },
        })

        throw revertir
      }, { timeout: 15000 })).rejects.toBe(revertir)

      expect(await prisma.doctor.findUnique({ where: { email: `filtros-${marca}-a@prueba.local` } })).toBeNull()
      expect(await prisma.paciente.findUnique({ where: { email: `paciente-filtros-${marca}@prueba.local` } })).toBeNull()
    } finally {
      await prisma.$disconnect()
    }
  }, 20000)
})
