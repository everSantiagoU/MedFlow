import { referencia, schemas } from './openapiSchemas.js'
import type { Esquema } from './openapiSchemas.js'

const json = (schema: Esquema) => ({ 'application/json': { schema } })
const respuesta = (description: string, schema: Esquema) => ({ description, content: json(schema) })
const cuerpo = (nombre: string) => ({ required: true, description: 'Enviar un objeto JSON con los campos indicados.', content: json(referencia(nombre)) })
const lista = (nombre: string) => ({ type: 'array', items: referencia(nombre) })
const error = (description: string) => respuesta(description, referencia('Error'))
const erroresComunes = { 401: error('Sesión requerida: token ausente, inválido o expirado.'), 500: error('Error interno del servidor.') }
const invalido = error('JSON, campos o parámetros inválidos. Consultar errores para conocer los detalles.')
const noEncontrado = error('No existe el recurso solicitado o una de las entidades relacionadas.')
const parametroId = (name = 'id') => ({
  name, in: 'path', required: true, description: `Identificador entero de ${name === 'pacienteId' ? 'paciente' : 'recurso'}.`,
  schema: { type: 'integer', format: 'int32' }, example: 1,
})
const busqueda = (description: string) => [{ name: 'busqueda', in: 'query', required: false, description, schema: { type: 'string' }, example: 'Laura' }]

interface Modulo {
  tag: string
  entidad: string
  singular: string
  crear: string
  actualizar?: string
  conflicto: string
  filtros?: ReturnType<typeof busqueda>
  listado?: string
  eliminar?: boolean
  relaciones?: boolean
}
const coleccion = (m: Modulo) => ({
  get: {
    tags: [m.tag], operationId: `listar${m.entidad}`, summary: `Listar ${m.tag.toLowerCase()}`,
    description: m.listado ?? 'Devuelve todos los registros en un arreglo JSON, sin paginación. Si no hay resultados devuelve [].',
    ...(m.filtros ? { parameters: m.filtros } : {}),
    responses: { 200: respuesta('Listado de registros; puede estar vacío.', lista(m.entidad)), 400: invalido, ...erroresComunes },
  },
  post: {
    tags: [m.tag], operationId: `registrar${m.entidad}`, summary: `Registrar ${m.singular}`, description: m.crear,
    requestBody: cuerpo(`${m.entidad}Solicitud`),
    responses: { 201: respuesta('Registro creado.', referencia(m.entidad)), 400: invalido, ...(m.relaciones ? { 404: noEncontrado } : {}), 409: error(m.conflicto), ...erroresComunes },
  },
})
const detalle = (m: Modulo) => ({
  parameters: [parametroId()],
  get: {
    tags: [m.tag], operationId: `obtener${m.entidad}`, summary: `Obtener ${m.singular}`,
    description: `Consulta ${m.singular} por su identificador.`,
    responses: { 200: respuesta('Registro encontrado.', referencia(m.entidad)), 400: invalido, 404: noEncontrado, ...erroresComunes },
  },
  put: {
    tags: [m.tag], operationId: `actualizar${m.entidad}`, summary: `Actualizar ${m.singular}`,
    description: `Enviar todos los campos obligatorios; PUT no es una actualización parcial. ${m.actualizar ?? m.crear}`,
    requestBody: cuerpo(`${m.entidad}Solicitud`),
    responses: { 200: respuesta('Registro actualizado.', referencia(m.entidad === 'Doctor' ? 'DoctorActualizacionRespuesta' : m.entidad)), 400: invalido, 404: noEncontrado, 409: error(m.conflicto), ...erroresComunes },
  },
  ...(m.eliminar ? { delete: {
    tags: [m.tag], operationId: `eliminar${m.entidad}`, summary: `Eliminar ${m.singular}`,
    description: 'Elimina el registro si las relaciones de la base de datos lo permiten. Un registro referenciado puede producir 409.',
    responses: { 204: { description: 'Registro eliminado. Respuesta sin cuerpo.' }, 400: invalido, 404: noEncontrado, 409: error('El registro tiene relaciones que impiden eliminarlo.'), ...erroresComunes },
  } } : {}),
})
const doctores: Modulo = {
  tag: 'Doctores', entidad: 'Doctor', singular: 'doctor', eliminar: true,
  crear: 'Registra los datos profesionales. Registro médico y email deben ser únicos. Se recortan espacios y el email se convierte a minúsculas.',
  actualizar: 'Conserva el ID y valida la unicidad del registro médico y email excluyendo al propio doctor. Devuelve { mensaje, doctor }.',
  conflicto: 'Registro médico o email ya utilizado por otro doctor.',
  filtros: busqueda('Coincidencia parcial en nombre, especialidad, registro médico o email. Se recortan espacios; vacío lista todos.'),
  listado: 'Lista doctores por nombre ascendente, con búsqueda opcional y sin paginación.',
}
const pacientes: Modulo = {
  tag: 'Pacientes', entidad: 'Paciente', singular: 'paciente', eliminar: true,
  crear: 'Registra los datos de contacto e identificación. Documento y email deben ser únicos. Se recortan espacios y se normaliza el email a minúsculas.',
  conflicto: 'Documento o email ya utilizado por otro paciente.',
  filtros: busqueda('Coincidencia parcial en nombre, documento, teléfono, email o dirección. Se recortan espacios; vacío lista todos.'),
  listado: 'Lista pacientes por nombre ascendente, con búsqueda opcional y sin paginación.',
}
const procedimientos: Modulo = {
  tag: 'Procedimientos', entidad: 'Procedimiento', singular: 'procedimiento', eliminar: true,
  crear: 'Mantiene el catálogo de servicios. El nombre debe ser único, el precio mayor que cero y la duración un número entero positivo.',
  conflicto: 'Ya existe un procedimiento con ese nombre.',
  filtros: busqueda('Coincidencia parcial en el nombre del procedimiento.'),
  listado: 'Lista procedimientos por nombre ascendente, con búsqueda opcional y sin paginación.',
}
const citas: Modulo = {
  tag: 'Citas', entidad: 'Cita', singular: 'cita', relaciones: true,
  crear: 'Requiere paciente, doctor y procedimiento existentes, y fecha futura. El estado omitido, nulo o vacío se convierte en PROGRAMADA. Se rechaza otra cita no cancelada del mismo doctor o paciente con exactamente la misma fecha y hora. Esta operación no verifica solapamientos por duración ni eventos del calendario.',
  conflicto: 'Estado no permitido o cita existente del mismo doctor o paciente a la misma fecha y hora.',
  listado: 'Lista citas por fecha y hora ascendente, incluyendo canceladas, sin paginación. El filtro fecha selecciona un día local completo; si se omite devuelve todas.',
}
const historias: Modulo = {
  tag: 'Historias clínicas', entidad: 'HistoriaClinica', singular: 'historia clínica', relaciones: true,
  crear: 'Requiere una cita existente y no cancelada, sin historia previa. Obtiene paciente y doctor desde la cita, asigna fechaRegistro y cambia la cita a COMPLETADA en la misma transacción.',
  actualizar: 'Permite editar diagnóstico, observaciones y datos relevantes. Debe enviarse el citaId original: no se puede cambiar la cita, el paciente, el doctor ni la fecha de registro.',
  conflicto: 'Al crear: cita cancelada o con historia previa. Al actualizar: intento de cambiar la cita asociada.',
}

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'MedFlow API', version: '1.0.0',
    description: `MedFlow gestiona la operación de un consultorio: profesionales, pacientes, catálogo de procedimientos, citas, agenda e historias clínicas. El backend está desarrollado en Node.js y TypeScript con Express, arquitectura hexagonal y persistencia mediante Prisma.

## Primeros pasos
1. Iniciar sesión en **POST /auth/login** con un usuario existente.
2. Copiar el campo **token** de la respuesta y pegarlo en **Authorize**, sin escribir el prefijo Bearer. Swagger lo añade automáticamente.
3. Registrar o consultar doctores, pacientes y procedimientos para obtener sus IDs.
4. Crear una cita con esos IDs y una fecha futura. Los IDs y las fechas de los ejemplos son ilustrativos: deben ajustarse a los datos del entorno.
5. Consultar la agenda y registrar la historia clínica de la cita; al crear la historia, la cita pasa a COMPLETADA.

## Entidades y relaciones
| Entidad | Responsabilidad y relaciones |
| --- | --- |
| Usuario | Identidad de acceso con email y rol; el login devuelve su ID y un JWT. No equivale a un Doctor ni a un Paciente. |
| Doctor | Profesional con registro médico y email únicos. Tiene múltiples citas, eventos e historias clínicas. |
| Paciente | Persona atendida con documento y email únicos. Tiene múltiples citas e historias clínicas. |
| Procedimiento | Servicio con nombre único, precio y duración en minutos. Se utiliza en múltiples citas. |
| Cita | Une un paciente, un doctor y un procedimiento en una fecha y hora. Estados: PROGRAMADA, COMPLETADA y CANCELADA. |
| EventoCalendario | Bloque de agenda de un doctor, sin paciente ni procedimiento. La consulta de calendario lo combina con las citas. |
| HistoriaClinica | Registro de diagnóstico, observaciones y datos relevantes; pertenece a una cita, con un máximo de una historia por cita. |

## Convenciones del contrato
- Ruta base: **/api/v1**. Cuerpos y respuestas de datos en **application/json**.
- Fechas y horas locales en **YYYY-MM-DDTHH:mm:ss**, con fracción opcional de hasta seis dígitos, **sin Z ni zona horaria**. La validación de fechas futuras usa la hora local del servidor.
- Los listados son arreglos sin paginación; si no hay resultados devuelven **[]**.
- **PUT** exige todos los campos obligatorios del esquema de solicitud. Los IDs de respuesta son generados por el servidor.
- Citas e historias no tienen endpoint DELETE. Para cancelar una cita se usa **PATCH /citas/{id}/cancelar**, sin cuerpo.
- Salud, login y documentación son públicos. Los endpoints de negocio requieren JWT; actualmente no aplican permisos diferenciados por rol.
- Los errores usan **{ mensaje, errores }**: 400 indica validación; 401, autenticación; 404, recurso inexistente; 409, conflicto de negocio; 500, error interno.

## Organización de los esquemas
Los esquemas se agrupan en el orden de los módulos: salud, autenticación, doctores, pacientes, procedimientos, citas, calendario, historias clínicas y errores. **Solicitud** describe los cuerpos de entrada; el nombre de la entidad describe su respuesta. **DoctorActualizacionRespuesta** documenta el envoltorio especial de la actualización de doctores. **EventoCalendario** describe la respuesta unificada de la agenda.

La especificación completa está disponible en [OpenAPI JSON](/api/v1/openapi.json).`,
  },
  servers: [{ url: '/api/v1', description: 'Backend del servidor actual' }],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Salud', description: 'Comprobación pública de disponibilidad HTTP.' },
    { name: 'Autenticación', description: 'Acceso de usuarios mediante JWT. No ofrece registro de usuarios.' },
    { name: 'Doctores', description: 'Profesionales, especialidades, registro médico y datos de contacto.' },
    { name: 'Pacientes', description: 'Identificación y contacto de las personas atendidas.' },
    { name: 'Procedimientos', description: 'Catálogo de servicios médicos, precios y duración.' },
    { name: 'Citas', description: 'Programación y estado de la atención; relación entre doctor, paciente y procedimiento.' },
    { name: 'Calendario', description: 'Agenda por doctor que combina citas y eventos, ordenada por inicio.' },
    { name: 'Historias clínicas', description: 'Registro clínico por cita y consulta de antecedentes por paciente.' },
  ],
  paths: {
    '/salud': { get: {
      tags: ['Salud'], operationId: 'consultarSalud', summary: 'Comprobar el servicio', security: [],
      description: 'Comprueba que el servidor HTTP responde. No valida la base de datos ni requiere token.',
      responses: { 200: respuesta('Servicio HTTP disponible.', referencia('SaludRespuesta')) },
    } },
    '/auth/login': { post: {
      tags: ['Autenticación'], operationId: 'iniciarSesion', summary: 'Iniciar sesión', security: [],
      description: 'Valida email y contraseña de un usuario existente. Devuelve token, usuarioId, email y rol. Utiliza el JWT en Authorization: Bearer <token> para las rutas protegidas.',
      requestBody: cuerpo('AutenticacionSolicitud'),
      responses: { 200: respuesta('Sesión iniciada.', referencia('AutenticacionRespuesta')), 400: invalido, 401: error('Email o contraseña incorrectos.'), 500: erroresComunes[500] },
    } },
    '/doctores': coleccion(doctores), '/doctores/{id}': detalle(doctores),
    '/pacientes': coleccion(pacientes), '/pacientes/{id}': detalle(pacientes),
    '/procedimientos': coleccion(procedimientos), '/procedimientos/{id}': detalle(procedimientos),
    '/citas': { ...coleccion(citas), get: { ...coleccion(citas).get, parameters: [{
      name: 'fecha', in: 'query', required: false, description: 'Día local a consultar (YYYY-MM-DD).', schema: { type: 'string', format: 'date' }, example: '2030-05-12',
    }] } },
    '/citas/{id}': detalle(citas),
    '/citas/{id}/cancelar': { parameters: [parametroId()], patch: {
      tags: ['Citas'], operationId: 'cancelarCita', summary: 'Cancelar cita',
      description: 'Cambia el estado a CANCELADA y conserva el registro. No requiere cuerpo ni fecha futura. Repetir la operación mantiene el estado cancelado.',
      responses: { 200: respuesta('Cita cancelada.', referencia('Cita')), 400: invalido, 404: noEncontrado, ...erroresComunes },
    } },
    '/calendario': { get: {
      tags: ['Calendario'], operationId: 'consultarCalendario', summary: 'Consultar agenda de un doctor por rango',
      description: 'Devuelve citas cuyo inicio está en [desde, hasta), incluidas las canceladas, y eventos que se solapan con ese intervalo. Ordena ambos tipos por inicio. El doctor debe existir y hasta debe ser posterior a desde.',
      parameters: [
        { name: 'doctorId', in: 'query', required: true, description: 'Doctor cuya agenda se consulta.', schema: { type: 'integer' }, example: 1 },
        ...['desde', 'hasta'].map((name, i) => ({ name, in: 'query', required: true, description: `${name === 'desde' ? 'Inicio' : 'Fin'} del rango; fecha y hora local sin zona horaria.`, schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,6})?$' }, example: i === 0 ? '2030-05-12T00:00:00' : '2030-05-13T00:00:00' })),
      ],
      responses: { 200: respuesta('Citas y eventos ordenados; [] si no hay resultados.', lista('EventoCalendario')), 400: invalido, 404: noEncontrado, 409: error('hasta debe ser posterior a desde.'), ...erroresComunes },
    } },
    '/calendario/eventos': { post: {
      tags: ['Calendario'], operationId: 'registrarEventoCalendario', summary: 'Registrar evento de agenda',
      description: 'Crea un evento para un doctor existente. Inicio y fin deben ser futuros y fin posterior a inicio. Rechaza solapamientos con otros eventos y con citas no canceladas; para estas considera la duración del procedimiento y consulta inicios desde el día anterior al evento hasta su fin.',
      requestBody: cuerpo('EventoCalendarioSolicitud'),
      responses: { 201: respuesta('Evento creado con tipo EVENTO.', referencia('EventoCalendario')), 400: invalido, 404: noEncontrado, 409: error('Rango inválido o solapamiento con la agenda del doctor.'), ...erroresComunes },
    } },
    '/historias-clinicas': coleccion(historias), '/historias-clinicas/{id}': detalle(historias),
    '/historias-clinicas/paciente/{pacienteId}': { parameters: [parametroId('pacienteId')], get: {
      tags: ['Historias clínicas'], operationId: 'listarHistoriasPorPaciente', summary: 'Consultar historias de un paciente',
      description: 'Consulta las historias vinculadas al paciente. Si el paciente existe y no tiene historias devuelve []; si no existe devuelve 404.',
      responses: { 200: respuesta('Historias del paciente.', lista('HistoriaClinica')), 400: invalido, 404: noEncontrado, ...erroresComunes },
    } },
  },
  components: {
    schemas,
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Obtén el JWT con POST /auth/login y pega solo su valor, sin el prefijo Bearer.' } },
  },
}
