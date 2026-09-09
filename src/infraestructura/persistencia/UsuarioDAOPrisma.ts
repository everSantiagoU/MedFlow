import type { Rol, Usuario } from '../../dominio/modelo/Usuario.js'
import type { UsuarioDAO } from '../../dominio/puertos/index.js'
import type { ClientePrisma } from './prisma.js'

export class UsuarioDAOPrisma implements UsuarioDAO {
  constructor(private readonly prisma: ClientePrisma) {}
  async porEmail(email: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findFirst({ where: { email } })
    return fila ? { ...fila, rol: fila.rol as Rol } : null
  }
}
