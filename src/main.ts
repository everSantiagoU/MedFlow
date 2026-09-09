import { ActualizarCita } from './aplicacion/casos-uso/ActualizarCita.js'
import { ActualizarDoctor } from './aplicacion/casos-uso/ActualizarDoctor.js'
import { ActualizarHistoriaClinica } from './aplicacion/casos-uso/ActualizarHistoriaClinica.js'
import { ActualizarPaciente } from './aplicacion/casos-uso/ActualizarPaciente.js'
import { ActualizarProcedimiento } from './aplicacion/casos-uso/ActualizarProcedimiento.js'
import { CancelarCita } from './aplicacion/casos-uso/CancelarCita.js'
import { ConsultarCalendario } from './aplicacion/casos-uso/ConsultarCalendario.js'
import { EliminarDoctor } from './aplicacion/casos-uso/EliminarDoctor.js'
import { EliminarPaciente } from './aplicacion/casos-uso/EliminarPaciente.js'
import { EliminarProcedimiento } from './aplicacion/casos-uso/EliminarProcedimiento.js'
import { IniciarSesion } from './aplicacion/casos-uso/IniciarSesion.js'
import { ListarCitas } from './aplicacion/casos-uso/ListarCitas.js'
import { ListarDoctores } from './aplicacion/casos-uso/ListarDoctores.js'
import { ListarHistoriasClinicas } from './aplicacion/casos-uso/ListarHistoriasClinicas.js'
import { ListarHistoriasPorPaciente } from './aplicacion/casos-uso/ListarHistoriasPorPaciente.js'
import { ListarPacientes } from './aplicacion/casos-uso/ListarPacientes.js'
import { ListarProcedimientos } from './aplicacion/casos-uso/ListarProcedimientos.js'
import { ObtenerCita } from './aplicacion/casos-uso/ObtenerCita.js'
import { ObtenerDoctor } from './aplicacion/casos-uso/ObtenerDoctor.js'
import { ObtenerHistoriaClinica } from './aplicacion/casos-uso/ObtenerHistoriaClinica.js'
import { ObtenerPaciente } from './aplicacion/casos-uso/ObtenerPaciente.js'
import { ObtenerProcedimiento } from './aplicacion/casos-uso/ObtenerProcedimiento.js'
import { RegistrarCita } from './aplicacion/casos-uso/RegistrarCita.js'
import { RegistrarDoctor } from './aplicacion/casos-uso/RegistrarDoctor.js'
import { RegistrarEventoCalendario } from './aplicacion/casos-uso/RegistrarEventoCalendario.js'
import { RegistrarHistoriaClinica } from './aplicacion/casos-uso/RegistrarHistoriaClinica.js'
import { RegistrarPaciente } from './aplicacion/casos-uso/RegistrarPaciente.js'
import { RegistrarProcedimiento } from './aplicacion/casos-uso/RegistrarProcedimiento.js'
import { crearServidor } from './infraestructura/http/servidor.js'
import { CitaDAOPrisma } from './infraestructura/persistencia/CitaDAOPrisma.js'
import { DoctorDAOPrisma } from './infraestructura/persistencia/DoctorDAOPrisma.js'
import { EventoCalendarioDAOPrisma } from './infraestructura/persistencia/EventoCalendarioDAOPrisma.js'
import { HistoriaClinicaDAOPrisma } from './infraestructura/persistencia/HistoriaClinicaDAOPrisma.js'
import { PacienteDAOPrisma } from './infraestructura/persistencia/PacienteDAOPrisma.js'
import { ProcedimientoDAOPrisma } from './infraestructura/persistencia/ProcedimientoDAOPrisma.js'
import { crearPrisma } from './infraestructura/persistencia/prisma.js'
import { UsuarioDAOPrisma } from './infraestructura/persistencia/UsuarioDAOPrisma.js'
import { ClavesBcrypt } from './infraestructura/seguridad/ClavesBcrypt.js'
import { TokensJwt } from './infraestructura/seguridad/TokensJwt.js'

const requerido = (nombre: string, alternativo?: string) => {
  const valor = process.env[nombre] ?? alternativo
  if (!valor) throw new Error(`Falta ${nombre}`)
  return valor
}

const prisma = crearPrisma()
const usuarios = new UsuarioDAOPrisma(prisma)
const doctores = new DoctorDAOPrisma(prisma)
const pacientes = new PacienteDAOPrisma(prisma)
const procedimientos = new ProcedimientoDAOPrisma(prisma)
const citas = new CitaDAOPrisma(prisma)
const eventos = new EventoCalendarioDAOPrisma(prisma)
const historias = new HistoriaClinicaDAOPrisma(prisma)
const obtenerDoctor = new ObtenerDoctor(doctores)
const obtenerPaciente = new ObtenerPaciente(pacientes)
const tokens = new TokensJwt(requerido('JWT_SECRET', 'medflow-dev-secret-key-change-before-production-2026'), Number(process.env['JWT_EXPIRATION_MS'] ?? 86_400_000))

const deps = {
  tokens,
  iniciarSesion: new IniciarSesion(usuarios, new ClavesBcrypt(), tokens),
  listarDoctores: new ListarDoctores(doctores), obtenerDoctor, registrarDoctor: new RegistrarDoctor(doctores), actualizarDoctor: new ActualizarDoctor(doctores, obtenerDoctor), eliminarDoctor: new EliminarDoctor(doctores, obtenerDoctor),
  listarPacientes: new ListarPacientes(pacientes), obtenerPaciente, registrarPaciente: new RegistrarPaciente(pacientes), actualizarPaciente: new ActualizarPaciente(pacientes, obtenerPaciente), eliminarPaciente: new EliminarPaciente(pacientes, obtenerPaciente),
  listarProcedimientos: new ListarProcedimientos(procedimientos), obtenerProcedimiento: new ObtenerProcedimiento(procedimientos), registrarProcedimiento: new RegistrarProcedimiento(procedimientos), actualizarProcedimiento: new ActualizarProcedimiento(procedimientos), eliminarProcedimiento: new EliminarProcedimiento(procedimientos),
  listarCitas: new ListarCitas(citas), obtenerCita: new ObtenerCita(citas), registrarCita: new RegistrarCita(citas, obtenerPaciente, obtenerDoctor, procedimientos), actualizarCita: new ActualizarCita(citas, obtenerPaciente, obtenerDoctor, procedimientos), cancelarCita: new CancelarCita(citas),
  consultarCalendario: new ConsultarCalendario(eventos, citas, doctores), registrarEventoCalendario: new RegistrarEventoCalendario(eventos, citas, doctores),
  listarHistorias: new ListarHistoriasClinicas(historias), obtenerHistoria: new ObtenerHistoriaClinica(historias), listarHistoriasPorPaciente: new ListarHistoriasPorPaciente(historias, obtenerPaciente), registrarHistoria: new RegistrarHistoriaClinica(historias, citas), actualizarHistoria: new ActualizarHistoriaClinica(historias),
}

const puerto = Number(process.env['PORT'] ?? 3000)
const servidor = crearServidor(deps, process.env['FRONTEND_URL']).listen(puerto, () => {
  console.log(`MedFlow Node escuchando en http://localhost:${puerto}/api/v1`)
})

const cerrar = () => servidor.close(() => void prisma.$disconnect().finally(() => process.exit(0)))
process.on('SIGINT', cerrar)
process.on('SIGTERM', cerrar)
