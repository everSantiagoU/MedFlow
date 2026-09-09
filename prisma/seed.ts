import { crearPrisma } from '../src/infraestructura/persistencia/prisma.js'

const nombreBase = process.env['DATABASE_NAME'] ?? new URL(process.env['DATABASE_URL'] ?? 'mysql://localhost/sin_base').pathname.slice(1)
if (nombreBase === 'clinica_db' && process.env['ALLOW_MAIN_DATABASE_SEED'] !== 'true') {
  throw new Error('Seed rechazado para clinica_db. Use un clon o defina ALLOW_MAIN_DATABASE_SEED=true de forma expresa.')
}

const prisma = crearPrisma()
const PASSWORD = '$2a$10$ZCFgcMlM2IkM2buNWkBQC.H935KwcS6BGcd68CoRpgHJqGsUYINwm'
const fecha = (anio: number, mes: number, dia: number, hora: number, minuto = 0) =>
  new Date(Date.UTC(anio, mes - 1, dia, hora, minuto))

async function ejecutar() {
  for (const usuario of [
    { email: 'admin@medflow.com', password: PASSWORD, rol: 'ADMIN' as const },
    { email: 'doctor.prueba@medflow.com', password: PASSWORD, rol: 'MEDICO' as const },
    { email: 'paciente.prueba@medflow.com', password: PASSWORD, rol: 'PACIENTE' as const },
  ]) await prisma.usuario.upsert({ where: { email: usuario.email }, update: {}, create: usuario })

  const doctoresDatos = [
    { especialidad: 'Medicina General', nombreCompleto: 'Dra. Laura Gomez', registroMedico: 'RM-001', email: 'laura.gomez@medflow.com' },
    { especialidad: 'Dermatologia', nombreCompleto: 'Dr. Andres Ruiz', registroMedico: 'RM-002', email: 'andres.ruiz@medflow.com' },
  ]
  for (const doctor of doctoresDatos) {
    if (!(await prisma.doctor.findFirst({ where: { OR: [{ email: doctor.email }, { registroMedico: doctor.registroMedico }] } }))) {
      await prisma.doctor.create({ data: doctor })
    }
  }

  const pacientesDatos = [
    { documento: 'CC-1001001001', nombreCompleto: 'Ana Perez', telefono: '3001234567', direccion: 'Calle 10 # 20-30, Bogota', email: 'ana.perez@correo.com' },
    { documento: 'CC-1001001002', nombreCompleto: 'Carlos Ramirez', telefono: '3001234568', direccion: 'Carrera 15 # 45-20, Bogota', email: 'carlos.ramirez@correo.com' },
    { documento: 'CC-1001001003', nombreCompleto: 'Maria Torres', telefono: '3001234569', direccion: 'Avenida 68 # 90-15, Bogota', email: 'maria.torres@correo.com' },
  ]
  for (const paciente of pacientesDatos) {
    if (!(await prisma.paciente.findFirst({ where: { OR: [{ email: paciente.email }, { documento: paciente.documento }] } }))) {
      await prisma.paciente.create({ data: paciente })
    }
  }

  for (const procedimiento of [
    { nombre: 'Consulta General', precio: 120000, duracionMinutos: 30 },
    { nombre: 'Control Dermatologico', precio: 180000, duracionMinutos: 45 },
    { nombre: 'Valoracion Prioritaria', precio: 150000, duracionMinutos: 20 },
  ]) if (!(await prisma.procedimiento.findFirst({ where: { nombre: procedimiento.nombre } }))) {
    await prisma.procedimiento.create({ data: procedimiento })
  }

  const laura = await prisma.doctor.findUniqueOrThrow({ where: { email: 'laura.gomez@medflow.com' } })
  const andres = await prisma.doctor.findUniqueOrThrow({ where: { email: 'andres.ruiz@medflow.com' } })
  const ana = await prisma.paciente.findUniqueOrThrow({ where: { email: 'ana.perez@correo.com' } })
  const carlos = await prisma.paciente.findUniqueOrThrow({ where: { email: 'carlos.ramirez@correo.com' } })
  const maria = await prisma.paciente.findUniqueOrThrow({ where: { email: 'maria.torres@correo.com' } })
  const consulta = await prisma.procedimiento.findFirstOrThrow({ where: { nombre: 'Consulta General' } })
  const dermatologia = await prisma.procedimiento.findFirstOrThrow({ where: { nombre: 'Control Dermatologico' } })
  const prioritaria = await prisma.procedimiento.findFirstOrThrow({ where: { nombre: 'Valoracion Prioritaria' } })

  const citas = [
    { estado: 'COMPLETADA', fechaHora: fecha(2026, 5, 10, 9), doctorId: laura.id, pacienteId: ana.id, procedimientoId: consulta.id },
    { estado: 'PROGRAMADA', fechaHora: fecha(2026, 5, 12, 9), doctorId: laura.id, pacienteId: carlos.id, procedimientoId: consulta.id },
    { estado: 'PROGRAMADA', fechaHora: fecha(2026, 5, 12, 11), doctorId: andres.id, pacienteId: maria.id, procedimientoId: dermatologia.id },
    { estado: 'CANCELADA', fechaHora: fecha(2026, 5, 13, 8, 30), doctorId: laura.id, pacienteId: maria.id, procedimientoId: prioritaria.id },
  ]
  for (const cita of citas) if (!(await prisma.cita.findFirst({ where: { doctorId: cita.doctorId, fechaHora: cita.fechaHora } }))) {
    await prisma.cita.create({ data: cita })
  }

  const eventos = [
    { descripcion: 'Revision de agenda semanal', inicio: fecha(2026, 5, 12, 8), fin: fecha(2026, 5, 12, 8, 30), titulo: 'Reunion administrativa', doctorId: laura.id },
    { descripcion: 'Capacitacion en manejo de historias clinicas', inicio: fecha(2026, 5, 12, 15), fin: fecha(2026, 5, 12, 16), titulo: 'Capacitacion interna', doctorId: andres.id },
  ]
  for (const evento of eventos) if (!(await prisma.eventoCalendario.findFirst({ where: { doctorId: evento.doctorId, inicio: evento.inicio } }))) {
    await prisma.eventoCalendario.create({ data: evento })
  }

  const citaAna = await prisma.cita.findFirstOrThrow({ where: { doctorId: laura.id, pacienteId: ana.id, fechaHora: fecha(2026, 5, 10, 9) } })
  if (!(await prisma.historiaClinica.findUnique({ where: { citaId: citaAna.id } }))) {
    await prisma.historiaClinica.create({ data: {
      fechaRegistro: fecha(2026, 5, 10, 9, 30), observaciones: 'Dolor de garganta de dos dias de evolucion',
      citaId: citaAna.id, doctorId: laura.id, pacienteId: ana.id,
      datosRelevantes: 'Sin alergias reportadas', diagnostico: 'Faringitis aguda',
    } })
  }
}

ejecutar()
  .then(() => console.log(`Seed idempotente completado en ${nombreBase}`))
  .finally(() => prisma.$disconnect())
