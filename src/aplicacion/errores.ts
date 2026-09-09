export class ErrorAplicacion extends Error {
  constructor(
    message: string,
    readonly estadoHttp: number,
    readonly errores: string[] = [],
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class RecursoNoEncontrado extends ErrorAplicacion {
  constructor(message: string) {
    super(message, 404)
  }
}

export class Conflicto extends ErrorAplicacion {
  constructor(message: string) {
    super(message, 409)
  }
}

export class CredencialesInvalidas extends ErrorAplicacion {
  constructor(message = 'Credenciales invalidas') {
    super(message, 401)
  }
}

export class SolicitudInvalida extends ErrorAplicacion {
  constructor(errores: string[], message = 'La solicitud contiene errores de validacion') {
    super(message, 400, errores)
  }
}
