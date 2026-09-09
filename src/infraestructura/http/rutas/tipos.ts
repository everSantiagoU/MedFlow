import type { ActualizarCita } from '../../../aplicacion/casos-uso/ActualizarCita.js'
import type { ActualizarDoctor } from '../../../aplicacion/casos-uso/ActualizarDoctor.js'
import type { ActualizarHistoriaClinica } from '../../../aplicacion/casos-uso/ActualizarHistoriaClinica.js'
import type { ActualizarPaciente } from '../../../aplicacion/casos-uso/ActualizarPaciente.js'
import type { ActualizarProcedimiento } from '../../../aplicacion/casos-uso/ActualizarProcedimiento.js'
import type { CancelarCita } from '../../../aplicacion/casos-uso/CancelarCita.js'
import type { ConsultarCalendario } from '../../../aplicacion/casos-uso/ConsultarCalendario.js'
import type { EliminarDoctor } from '../../../aplicacion/casos-uso/EliminarDoctor.js'
import type { EliminarPaciente } from '../../../aplicacion/casos-uso/EliminarPaciente.js'
import type { EliminarProcedimiento } from '../../../aplicacion/casos-uso/EliminarProcedimiento.js'
import type { IniciarSesion } from '../../../aplicacion/casos-uso/IniciarSesion.js'
import type { ListarCitas } from '../../../aplicacion/casos-uso/ListarCitas.js'
import type { ListarDoctores } from '../../../aplicacion/casos-uso/ListarDoctores.js'
import type { ListarHistoriasClinicas } from '../../../aplicacion/casos-uso/ListarHistoriasClinicas.js'
import type { ListarHistoriasPorPaciente } from '../../../aplicacion/casos-uso/ListarHistoriasPorPaciente.js'
import type { ListarPacientes } from '../../../aplicacion/casos-uso/ListarPacientes.js'
import type { ListarProcedimientos } from '../../../aplicacion/casos-uso/ListarProcedimientos.js'
import type { ObtenerCita } from '../../../aplicacion/casos-uso/ObtenerCita.js'
import type { ObtenerDoctor } from '../../../aplicacion/casos-uso/ObtenerDoctor.js'
import type { ObtenerHistoriaClinica } from '../../../aplicacion/casos-uso/ObtenerHistoriaClinica.js'
import type { ObtenerPaciente } from '../../../aplicacion/casos-uso/ObtenerPaciente.js'
import type { ObtenerProcedimiento } from '../../../aplicacion/casos-uso/ObtenerProcedimiento.js'
import type { RegistrarCita } from '../../../aplicacion/casos-uso/RegistrarCita.js'
import type { RegistrarDoctor } from '../../../aplicacion/casos-uso/RegistrarDoctor.js'
import type { RegistrarEventoCalendario } from '../../../aplicacion/casos-uso/RegistrarEventoCalendario.js'
import type { RegistrarHistoriaClinica } from '../../../aplicacion/casos-uso/RegistrarHistoriaClinica.js'
import type { RegistrarPaciente } from '../../../aplicacion/casos-uso/RegistrarPaciente.js'
import type { RegistrarProcedimiento } from '../../../aplicacion/casos-uso/RegistrarProcedimiento.js'
import type { ServicioTokens } from '../../../dominio/puertos/index.js'

export interface DependenciasHttp {
  tokens: ServicioTokens
  iniciarSesion: IniciarSesion
  listarDoctores: ListarDoctores; obtenerDoctor: ObtenerDoctor; registrarDoctor: RegistrarDoctor; actualizarDoctor: ActualizarDoctor; eliminarDoctor: EliminarDoctor
  listarPacientes: ListarPacientes; obtenerPaciente: ObtenerPaciente; registrarPaciente: RegistrarPaciente; actualizarPaciente: ActualizarPaciente; eliminarPaciente: EliminarPaciente
  listarProcedimientos: ListarProcedimientos; obtenerProcedimiento: ObtenerProcedimiento; registrarProcedimiento: RegistrarProcedimiento; actualizarProcedimiento: ActualizarProcedimiento; eliminarProcedimiento: EliminarProcedimiento
  listarCitas: ListarCitas; obtenerCita: ObtenerCita; registrarCita: RegistrarCita; actualizarCita: ActualizarCita; cancelarCita: CancelarCita
  consultarCalendario: ConsultarCalendario; registrarEventoCalendario: RegistrarEventoCalendario
  listarHistorias: ListarHistoriasClinicas; obtenerHistoria: ObtenerHistoriaClinica; listarHistoriasPorPaciente: ListarHistoriasPorPaciente; registrarHistoria: RegistrarHistoriaClinica; actualizarHistoria: ActualizarHistoriaClinica
}
