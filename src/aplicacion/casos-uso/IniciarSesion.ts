import type { ServicioClaves, ServicioTokens, UsuarioDAO } from '../../dominio/puertos/index.js'
import { CredencialesInvalidas } from '../errores.js'

export class IniciarSesion {
  constructor(
    private readonly usuarios: UsuarioDAO,
    private readonly claves: ServicioClaves,
    private readonly tokens: ServicioTokens,
  ) {}

  async ejecutar(email: string, password: string) {
    const usuario = await this.usuarios.porEmail(email)
    if (!usuario || !(await this.claves.coincide(password, usuario.password))) {
      throw new CredencialesInvalidas()
    }
    return {
      token: this.tokens.emitir({ email: usuario.email, rol: usuario.rol }),
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    }
  }
}
