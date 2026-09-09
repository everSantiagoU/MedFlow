const error = {
  type: 'object',
  properties: { mensaje: { type: 'string' }, errores: { type: 'array', items: { type: 'string' } } },
  required: ['mensaje', 'errores'],
}

const crud = (nombre: string) => ({
  get: { tags: [nombre], summary: `Listar ${nombre.toLowerCase()}`, security: [{ bearerAuth: [] }], responses: { 200: { description: 'Listado' }, 401: { description: 'Token ausente o invalido' } } },
  post: { tags: [nombre], summary: `Registrar ${nombre.toLowerCase()}`, security: [{ bearerAuth: [] }], responses: { 201: { description: 'Creado' }, 400: { description: 'Datos invalidos' }, 409: { description: 'Conflicto' } } },
})

const detalleCrud = (nombre: string, eliminar = true) => ({
  get: { tags: [nombre], summary: 'Obtener por id', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Encontrado' }, 404: { description: 'No encontrado' } } },
  put: { tags: [nombre], summary: 'Actualizar', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Actualizado' }, 400: { description: 'Datos invalidos' }, 404: { description: 'No encontrado' }, 409: { description: 'Conflicto' } } },
  ...(eliminar ? { delete: { tags: [nombre], summary: 'Eliminar', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Eliminado' }, 404: { description: 'No encontrado' }, 409: { description: 'Tiene registros relacionados' } } } } : {}),
})

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'MedFlow API', version: '1.0.0',
    description: 'API Node.js compatible con los contratos HTTP del backend Spring de MedFlow.',
  },
  servers: [{ url: '/api/v1', description: 'Servidor actual' }],
  tags: ['Salud', 'Autenticacion', 'Doctores', 'Pacientes', 'Procedimientos', 'Citas', 'Calendario', 'Historias clinicas'].map(name => ({ name })),
  paths: {
    '/salud': { get: { tags: ['Salud'], summary: 'Comprobar el servicio', responses: { 200: { description: 'Servicio disponible', content: { 'application/json': { example: { estado: 'ok' } } } } } } },
    '/auth/login': { post: { tags: ['Autenticacion'], summary: 'Iniciar sesion', responses: { 200: { description: 'JWT y usuario autenticado' }, 400: { description: 'Datos invalidos' }, 401: { description: 'Credenciales invalidas' } } } },
    '/doctores': crud('Doctores'), '/doctores/{id}': detalleCrud('Doctores'),
    '/pacientes': crud('Pacientes'), '/pacientes/{id}': detalleCrud('Pacientes'),
    '/procedimientos': crud('Procedimientos'), '/procedimientos/{id}': detalleCrud('Procedimientos'),
    '/citas': crud('Citas'),
    '/citas/{id}': detalleCrud('Citas', false),
    '/citas/{id}/cancelar': { patch: { tags: ['Citas'], summary: 'Cancelar cita', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Cita cancelada' }, 404: { description: 'No encontrada' } } } },
    '/calendario': { get: { tags: ['Calendario'], summary: 'Consultar agenda de un doctor por rango', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Citas y eventos ordenados' } } } },
    '/calendario/eventos': { post: { tags: ['Calendario'], summary: 'Registrar evento', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Evento creado' }, 409: { description: 'Cruce de agenda' } } } },
    '/historias-clinicas': crud('Historias clinicas'),
    '/historias-clinicas/{id}': detalleCrud('Historias clinicas', false),
    '/historias-clinicas/paciente/{pacienteId}': { get: { tags: ['Historias clinicas'], summary: 'Listar por paciente', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Historias del paciente' }, 404: { description: 'Paciente no encontrado' } } } },
  },
  components: {
    schemas: { Error: error },
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
}
