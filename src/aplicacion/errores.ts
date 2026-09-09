export class ErrorAplicacion extends Error {
  constructor(
    message: string,
    readonly errores: string[] = [],
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class RecursoNoEncontrado extends ErrorAplicacion {
  constructor(message: string) {
    super(message)
  }
}

export class Conflicto extends ErrorAplicacion {
  constructor(message: string) {
    super(message)
  }
}

export class CredencialesInvalidas extends ErrorAplicacion {
  constructor(message = 'Credenciales invalidas') {
    super(message)
  }
}

export class SolicitudInvalida extends ErrorAplicacion {
  constructor(errores: string[], message = 'La solicitud contiene errores de validacion') {
    super(message, errores)
  }
}
