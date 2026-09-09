import { ActualizarCita } from '../../src/aplicacion/casos-uso/ActualizarCita.js'
import { ActualizarDoctor } from '../../src/aplicacion/casos-uso/ActualizarDoctor.js'
import { ActualizarHistoriaClinica } from '../../src/aplicacion/casos-uso/ActualizarHistoriaClinica.js'
import { ActualizarPaciente } from '../../src/aplicacion/casos-uso/ActualizarPaciente.js'
import { ActualizarProcedimiento } from '../../src/aplicacion/casos-uso/ActualizarProcedimiento.js'
import { CancelarCita } from '../../src/aplicacion/casos-uso/CancelarCita.js'
import { ConsultarCalendario } from '../../src/aplicacion/casos-uso/ConsultarCalendario.js'
import { EliminarDoctor } from '../../src/aplicacion/casos-uso/EliminarDoctor.js'
import { EliminarPaciente } from '../../src/aplicacion/casos-uso/EliminarPaciente.js'
import { EliminarProcedimiento } from '../../src/aplicacion/casos-uso/EliminarProcedimiento.js'
import { IniciarSesion } from '../../src/aplicacion/casos-uso/IniciarSesion.js'
import { ListarCitas } from '../../src/aplicacion/casos-uso/ListarCitas.js'
import { ListarDoctores } from '../../src/aplicacion/casos-uso/ListarDoctores.js'
import { ListarHistoriasClinicas } from '../../src/aplicacion/casos-uso/ListarHistoriasClinicas.js'
import { ListarHistoriasPorPaciente } from '../../src/aplicacion/casos-uso/ListarHistoriasPorPaciente.js'
import { ListarPacientes } from '../../src/aplicacion/casos-uso/ListarPacientes.js'
import { ListarProcedimientos } from '../../src/aplicacion/casos-uso/ListarProcedimientos.js'
import { ObtenerCita } from '../../src/aplicacion/casos-uso/ObtenerCita.js'
import { ObtenerDoctor } from '../../src/aplicacion/casos-uso/ObtenerDoctor.js'
import { ObtenerHistoriaClinica } from '../../src/aplicacion/casos-uso/ObtenerHistoriaClinica.js'
import { ObtenerPaciente } from '../../src/aplicacion/casos-uso/ObtenerPaciente.js'
import { ObtenerProcedimiento } from '../../src/aplicacion/casos-uso/ObtenerProcedimiento.js'
import { RegistrarCita } from '../../src/aplicacion/casos-uso/RegistrarCita.js'
import { RegistrarDoctor } from '../../src/aplicacion/casos-uso/RegistrarDoctor.js'
import { RegistrarEventoCalendario } from '../../src/aplicacion/casos-uso/RegistrarEventoCalendario.js'
import { RegistrarHistoriaClinica } from '../../src/aplicacion/casos-uso/RegistrarHistoriaClinica.js'
import { RegistrarPaciente } from '../../src/aplicacion/casos-uso/RegistrarPaciente.js'
import { RegistrarProcedimiento } from '../../src/aplicacion/casos-uso/RegistrarProcedimiento.js'
import { TokensJwt } from '../../src/infraestructura/seguridad/TokensJwt.js'
import { CitaDAOEnMemoria, ClavesFalsas, DoctorDAOEnMemoria, EventoDAOEnMemoria, HistoriaDAOEnMemoria, PacienteDAOEnMemoria, ProcedimientoDAOEnMemoria, UsuarioDAOEnMemoria } from './DAOsEnMemoria.js'

export const SECRETO_PRUEBA = 'medflow-dev-secret-key-change-before-production-2026'

export async function armarAplicacion() {
  const usuarios = new UsuarioDAOEnMemoria()
  usuarios.agregar('admin@medflow.com', 'hash:Medflow123*')
  const doctores = new DoctorDAOEnMemoria()
  const pacientes = new PacienteDAOEnMemoria()
  const procedimientos = new ProcedimientoDAOEnMemoria()
  await doctores.guardar({ nombreCompleto: 'Dra. Laura Gomez', especialidad: 'Medicina General', registroMedico: 'RM-001', email: 'laura@medflow.com' })
  await pacientes.guardar({ nombreCompleto: 'Ana Perez', documento: 'CC-1', telefono: '3001234567', email: 'ana@correo.com', direccion: 'Calle 1' })
  await procedimientos.guardar({ nombre: 'Consulta General', precio: 120000, duracionMinutos: 30 })
  const citas = new CitaDAOEnMemoria(pacientes, doctores, procedimientos)
  const eventos = new EventoDAOEnMemoria(doctores)
  const historias = new HistoriaDAOEnMemoria(citas)
  const tokens = new TokensJwt(SECRETO_PRUEBA)

  return {
    almacenes: { usuarios, doctores, pacientes, procedimientos, citas, eventos, historias },
    deps: {
      tokens,
      iniciarSesion: new IniciarSesion(usuarios, new ClavesFalsas(), tokens),
      listarDoctores: new ListarDoctores(doctores), obtenerDoctor: new ObtenerDoctor(doctores), registrarDoctor: new RegistrarDoctor(doctores), actualizarDoctor: new ActualizarDoctor(doctores), eliminarDoctor: new EliminarDoctor(doctores),
      listarPacientes: new ListarPacientes(pacientes), obtenerPaciente: new ObtenerPaciente(pacientes), registrarPaciente: new RegistrarPaciente(pacientes), actualizarPaciente: new ActualizarPaciente(pacientes), eliminarPaciente: new EliminarPaciente(pacientes),
      listarProcedimientos: new ListarProcedimientos(procedimientos), obtenerProcedimiento: new ObtenerProcedimiento(procedimientos), registrarProcedimiento: new RegistrarProcedimiento(procedimientos), actualizarProcedimiento: new ActualizarProcedimiento(procedimientos), eliminarProcedimiento: new EliminarProcedimiento(procedimientos),
      listarCitas: new ListarCitas(citas), obtenerCita: new ObtenerCita(citas), registrarCita: new RegistrarCita(citas, pacientes, doctores, procedimientos), actualizarCita: new ActualizarCita(citas, pacientes, doctores, procedimientos), cancelarCita: new CancelarCita(citas),
      consultarCalendario: new ConsultarCalendario(eventos, citas, doctores), registrarEventoCalendario: new RegistrarEventoCalendario(eventos, citas, doctores),
      listarHistorias: new ListarHistoriasClinicas(historias), obtenerHistoria: new ObtenerHistoriaClinica(historias), listarHistoriasPorPaciente: new ListarHistoriasPorPaciente(historias, pacientes), registrarHistoria: new RegistrarHistoriaClinica(historias, citas), actualizarHistoria: new ActualizarHistoriaClinica(historias),
    },
  }
}
