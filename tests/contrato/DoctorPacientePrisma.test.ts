import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { crearPrisma } from '../../src/infraestructura/persistencia/prisma.js'
import { DoctorDAOPrisma } from '../../src/infraestructura/persistencia/DoctorDAOPrisma.js'
import { PacienteDAOPrisma } from '../../src/infraestructura/persistencia/PacienteDAOPrisma.js'

describe.skipIf(process.env['ENTIDADES_MYSQL_TEST'] !== 'true')('Doctor y Paciente en MySQL', () => {
  it('comprueba CRUD, unicidad y relaciones en un clon con rollback', async () => {
    expect(process.env['DATABASE_NAME']).toMatch(/^clinica_db_(node|java)_test$/)
    const prisma = crearPrisma()
    const marca = randomUUID().slice(0, 8)
    const revertir = new Error('Rollback de prueba')
    const emailDoctor = `doctor-${marca}@prueba.local`
    const emailPaciente = `paciente-${marca}@prueba.local`
    try {
      await expect(prisma.$transaction(async tx => {
        const doctores = new DoctorDAOPrisma(tx)
        const pacientes = new PacienteDAOPrisma(tx)
        const datosDoctor = { nombreCompleto: `Doctor ${marca}`, especialidad: 'General', registroMedico: `RM-${marca}`, email: emailDoctor }
        const datosPaciente = { nombreCompleto: `Paciente ${marca}`, documento: `CC-${marca}`, telefono: '3001234567', direccion: `Calle ${marca}`, email: emailPaciente }
        const doctor = await doctores.guardar(datosDoctor)
        const paciente = await pacientes.guardar(datosPaciente)
        expect(await doctores.porId(doctor.id)).toEqual(doctor)
        expect(await pacientes.porId(paciente.id)).toEqual(paciente)
        expect(await doctores.existeEmail(emailDoctor.toUpperCase())).toBe(true)
        expect(await pacientes.existeEmail(emailPaciente.toUpperCase())).toBe(true)
        expect(await doctores.existeRegistroMedico(doctor.registroMedico.toLowerCase())).toBe(true)
        expect(await pacientes.existeDocumento(paciente.documento.toLowerCase())).toBe(true)
        expect(await doctores.existeEmail(emailDoctor, doctor.id)).toBe(false)
        expect(await pacientes.existeEmail(emailPaciente, paciente.id)).toBe(false)
        expect(await doctores.existeRegistroMedico(doctor.registroMedico, doctor.id)).toBe(false)
        expect(await pacientes.existeDocumento(paciente.documento, paciente.id)).toBe(false)
        expect(await doctores.listar(marca.toUpperCase())).toContainEqual(doctor)
        expect(await pacientes.listar(marca.toUpperCase())).toContainEqual(paciente)
        expect((await doctores.guardar({ ...doctor, especialidad: 'Pediatria' })).especialidad).toBe('Pediatria')
        expect((await pacientes.guardar({ ...paciente, telefono: '301' })).telefono).toBe('301')
        await expect(doctores.guardar({ ...datosDoctor, registroMedico: `OTRO-${marca}` })).rejects.toMatchObject({ code: 'P2002' })
        await expect(doctores.guardar({ ...datosDoctor, email: `otro-${emailDoctor}` })).rejects.toMatchObject({ code: 'P2002' })
        await expect(pacientes.guardar({ ...datosPaciente, documento: `OTRO-${marca}` })).rejects.toMatchObject({ code: 'P2002' })
        await expect(pacientes.guardar({ ...datosPaciente, email: `otro-${emailPaciente}` })).rejects.toMatchObject({ code: 'P2002' })
        const procedimiento = await tx.procedimiento.create({ data: { nombre: marca, precio: 100, duracionMinutos: 30 } })
        const cita = await tx.cita.create({ data: {
          doctorId: doctor.id, pacienteId: paciente.id, procedimientoId: procedimiento.id,
          fechaHora: new Date('2035-01-01T10:00:00Z'), estado: 'PROGRAMADA',
        } })
        await expect(doctores.eliminar(doctor.id)).rejects.toMatchObject({ code: 'P2003' })
        await expect(pacientes.eliminar(paciente.id)).rejects.toMatchObject({ code: 'P2003' })
        await tx.cita.delete({ where: { id: cita.id } })
        await doctores.eliminar(doctor.id)
        await pacientes.eliminar(paciente.id)
        expect(await doctores.porId(doctor.id)).toBeNull()
        expect(await pacientes.porId(paciente.id)).toBeNull()
        throw revertir
      }, { timeout: 15000 })).rejects.toBe(revertir)
      expect(await prisma.doctor.findUnique({ where: { email: emailDoctor } })).toBeNull()
      expect(await prisma.paciente.findUnique({ where: { email: emailPaciente } })).toBeNull()
    } finally {
      await prisma.$disconnect()
    }
  }, 20000)
})
