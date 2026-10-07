// Esquemas agrupados por módulo: solicitud, entidad de respuesta y respuestas especiales.
export type Esquema = Record<string, unknown>
export const referencia = (nombre: string): Esquema => ({ $ref: `#/components/schemas/${nombre}` })
const texto = (description: string, example: string, maxLength?: number): Esquema => ({
  type: 'string', description, example, ...(maxLength ? { minLength: 1, maxLength } : {}),
})
const entero = (description: string, example = 1): Esquema => ({ type: 'integer', format: 'int32', description, example })
const objeto = (description: string, properties: Record<string, Esquema>, required = Object.keys(properties)): Esquema => ({
  type: 'object', description, required, properties,
})
const id = { ...entero('Identificador generado por el servidor.'), readOnly: true }
const fecha = (description: string, example = '2030-05-12T10:00:00'): Esquema => ({
  type: 'string', description: `${description} Fecha y hora local sin Z ni desplazamiento UTC; admite de 1 a 6 decimales opcionales.`,
  pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,6})?$', example,
})
const email = texto('Correo electrónico; se guarda en minúsculas y debe ser único dentro de esta entidad.', 'persona@example.com', 120)
email.format = 'email'
const doctor = {
  nombreCompleto: texto('Nombre completo del profesional.', 'Dra. Ana Torres', 150),
  especialidad: texto('Especialidad médica.', 'Dermatología', 100),
  registroMedico: texto('Registro profesional único.', 'RM-1001', 80),
  email: { ...email, example: 'ana.torres@example.com' },
}
const paciente = {
  nombreCompleto: texto('Nombre completo del paciente.', 'Laura Gómez', 150),
  documento: texto('Documento de identidad único.', '1020304050', 30),
  telefono: texto('Teléfono de contacto, representado como texto.', '3001234567', 30),
  email: { ...email, example: 'laura.gomez@example.com' },
  direccion: texto('Dirección de contacto.', 'Calle 10 # 20-30', 200),
}
const procedimiento = {
  nombre: texto('Nombre único del procedimiento.', 'Consulta dermatológica', 120),
  precio: { type: 'number', minimum: 0, exclusiveMinimum: true, description: 'Precio mayor que cero; la API no incluye un campo de moneda.', example: 150000 },
  duracionMinutos: { ...entero('Duración positiva en minutos; determina el fin de una cita en el calendario.', 30), minimum: 1 },
}
const relacionesCita = {
  pacienteId: entero('ID de un paciente existente.'),
  doctorId: entero('ID de un doctor existente.'),
  procedimientoId: entero('ID de un procedimiento existente.'),
}
const nombresCita = {
  pacienteNombre: texto('Nombre del paciente relacionado.', 'Laura Gómez'),
  doctorNombre: texto('Nombre del doctor relacionado.', 'Dra. Ana Torres'),
  doctorEspecialidad: texto('Especialidad del doctor relacionado.', 'Dermatología'),
  procedimientoNombre: texto('Nombre del procedimiento relacionado.', 'Consulta dermatológica'),
}
const estado = { type: 'string', enum: ['PROGRAMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'], description: 'Estado de la cita.', example: 'PROGRAMADA' }
const historia = {
  citaId: entero('Cita asociada. Solo se permite una historia por cita; no se puede cambiar al actualizar.'),
  diagnostico: texto('Diagnóstico registrado por el profesional.', 'Dermatitis de contacto', 5000),
  observaciones: texto('Observaciones de la atención.', 'Control en dos semanas.', 5000),
  datosRelevantes: texto('Antecedentes y otros datos relevantes para la atención.', 'Refiere sensibilidad a productos cosméticos.', 5000),
}
const nullable = (schema: Esquema): Esquema => ({ ...schema, nullable: true })

export const schemas = {
  SaludRespuesta: objeto('Disponibilidad del servicio HTTP; no comprueba la conexión a la base de datos.', {
    estado: { type: 'string', enum: ['ok'], example: 'ok' },
  }),
  AutenticacionSolicitud: objeto('Credenciales de un usuario existente. No crea usuarios ni doctores.', {
    email: { type: 'string', format: 'email', description: 'Correo del usuario.', example: 'usuario@example.com' },
    password: { type: 'string', format: 'password', minLength: 1, writeOnly: true, description: 'Contraseña del usuario.', example: 'TuClaveDeAcceso' },
  }),
  AutenticacionRespuesta: objeto('Identidad pública del usuario y JWT. El usuario de acceso es independiente de Doctor y Paciente.', {
    token: texto('JWT para Authorization: Bearer <token>. Pegar solo el token en Authorize.', 'eyJhbGciOiJIUzI1NiJ9...'),
    usuarioId: entero('Identificador del usuario autenticado.'),
    email: { type: 'string', format: 'email', example: 'usuario@example.com', description: 'Correo del usuario autenticado.' },
    rol: texto('Rol almacenado para el usuario. Las rutas actuales exigen sesión, sin separar permisos por rol.', 'ADMIN'),
  }),
  DoctorSolicitud: objeto('Datos completos para crear o actualizar un doctor. Se recortan espacios y se normaliza el email.', doctor),
  Doctor: objeto('Profesional que atiende citas y tiene eventos de calendario. Puede estar relacionado con varias historias clínicas.', { id, ...doctor }),
  DoctorActualizacionRespuesta: objeto('Respuesta exclusiva de PUT /doctores/{id}.', {
    mensaje: texto('Confirmación de la actualización.', 'Doctor actualizado correctamente'), doctor: referencia('Doctor'),
  }),
  PacienteSolicitud: objeto('Datos completos para crear o actualizar un paciente. Se recortan espacios y se normaliza el email.', paciente),
  Paciente: objeto('Persona atendida. Puede tener varias citas e historias clínicas.', { id, ...paciente }),
  ProcedimientoSolicitud: objeto('Datos completos del servicio médico para crear o actualizar.', procedimiento),
  Procedimiento: objeto('Catálogo de servicios con precio y duración. Un procedimiento puede utilizarse en varias citas.', { id, ...procedimiento }),
  CitaSolicitud: objeto('Asocia paciente, doctor y procedimiento. La fecha debe ser futura también al actualizar mediante PUT.', {
    ...relacionesCita,
    fechaHora: fecha('Inicio futuro de la cita.'),
    estado: { type: 'string', nullable: true, maxLength: 50, default: 'PROGRAMADA', example: 'PROGRAMADA', description: 'Acepta PROGRAMADA, COMPLETADA, CANCELADA o NO_ASISTIO, sin distinguir mayúsculas y recortando espacios. Omitido, nulo o vacío se convierte en PROGRAMADA. Otro valor produce 409.' },
  }, ['pacienteId', 'doctorId', 'procedimientoId', 'fechaHora']),
  Cita: objeto('Cita con identificadores y datos descriptivos de sus relaciones. Puede tener como máximo una historia clínica.', {
    id, fechaHora: fecha('Inicio de la cita.'), estado, ...relacionesCita, ...nombresCita,
    procedimientoDuracionMinutos: entero('Duración del procedimiento en minutos.', 30),
  }),
  EventoCalendarioSolicitud: objeto('Bloque de agenda de un doctor sin paciente ni procedimiento. Inicio y fin deben ser futuros; fin debe ser posterior a inicio.', {
    doctorId: entero('ID de un doctor existente.'),
    titulo: texto('Nombre del evento.', 'Reunión médica', 150),
    descripcion: { type: 'string', nullable: true, maxLength: 5000, description: 'Detalle opcional; si se omite se almacena null.', example: 'Revisión de casos del equipo.' },
    inicio: fecha('Inicio del evento.', '2030-05-12T14:00:00'),
    fin: fecha('Fin del evento.', '2030-05-12T15:00:00'),
  }, ['doctorId', 'titulo', 'inicio', 'fin']),
  EventoCalendario: objeto('Representación unificada de la agenda. CITA contiene paciente, procedimiento y citaId; eventoId es null. EVENTO contiene eventoId; paciente, procedimiento, citaId y estado son null. El id puede repetirse entre tipos: identificar cada elemento por tipo e id.', {
    id,
    tipo: { type: 'string', enum: ['CITA', 'EVENTO'], description: 'Origen del elemento de agenda.', example: 'EVENTO' },
    titulo: texto('Título del evento o combinación de procedimiento y paciente para una cita.', 'Reunión médica'),
    descripcion: nullable(texto('Detalle del evento; null para una cita.', 'Revisión de casos del equipo.')),
    inicio: fecha('Inicio del elemento.', '2030-05-12T14:00:00'),
    fin: fecha('Fin del evento; en citas se calcula con la duración del procedimiento.', '2030-05-12T15:00:00'),
    estado: { ...nullable(estado), example: null },
    doctorId: relacionesCita.doctorId, doctorNombre: nombresCita.doctorNombre,
    pacienteId: { ...nullable(relacionesCita.pacienteId), example: null },
    pacienteNombre: { ...nullable(nombresCita.pacienteNombre), example: null },
    citaId: { ...nullable(entero('ID de la cita si tipo es CITA.')), example: null },
    eventoId: nullable(entero('ID del evento si tipo es EVENTO.')),
    procedimientoId: { ...nullable(relacionesCita.procedimientoId), example: null },
    procedimientoNombre: { ...nullable(nombresCita.procedimientoNombre), example: null },
  }),
  HistoriaClinicaSolicitud: objeto('Contenido clínico asociado a una cita. El servidor obtiene paciente y doctor desde la cita y asigna fechaRegistro.', historia),
  HistoriaClinica: objeto('Registro clínico de una cita. Su creación cambia la cita a COMPLETADA en la misma transacción. La fecha de registro y las relaciones se conservan al editar.', {
    id, fechaRegistro: { ...fecha('Fecha de creación asignada por el servidor.', '2030-05-12T10:30:00.123456'), readOnly: true },
    ...historia, citaFechaHora: fecha('Fecha de la cita asociada.'), citaEstado: { ...estado, example: 'COMPLETADA' },
    ...relacionesCita, ...nombresCita,
  }),
  Error: objeto('Formato común de errores: mensaje general y lista de detalles de validación, que puede estar vacía.', {
    mensaje: texto('Descripción del error.', 'La solicitud contiene errores de validacion'),
    errores: { type: 'array', description: 'Detalles por campo; vacío en errores sin detalles.', items: { type: 'string' }, example: ['nombreCompleto: El nombre completo es obligatorio'] },
  }),
}
