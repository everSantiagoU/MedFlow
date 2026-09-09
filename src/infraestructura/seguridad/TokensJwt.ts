import jwt from 'jsonwebtoken'
import { esRol } from '../../dominio/modelo/Usuario.js'
import type { CredencialDTO, ServicioTokens } from '../../dominio/puertos/index.js'

function claveJwt(secreto: string): Buffer {
  let base64: Buffer
  try { base64 = Buffer.from(secreto, 'base64') } catch { base64 = Buffer.alloc(0) }
  const normalizado = secreto.replace(/=+$/, '')
  const pareceBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(secreto) && base64.toString('base64').replace(/=+$/, '') === normalizado
  const clave = pareceBase64 ? base64 : Buffer.from(secreto, 'utf8')
  if (clave.length < 32) throw new Error('La clave JWT debe tener al menos 32 bytes')
  return clave
}

export class TokensJwt implements ServicioTokens {
  private readonly clave: Buffer
  constructor(secreto: string, private readonly expiracionMs = 86_400_000) {
    this.clave = claveJwt(secreto)
  }
  emitir({ email, rol }: CredencialDTO): string {
    return jwt.sign({ rol }, this.clave, {
      algorithm: 'HS256', subject: email, expiresIn: Math.floor(this.expiracionMs / 1000),
    })
  }
  verificar(token: string): CredencialDTO | null {
    try {
      const carga = jwt.verify(token, this.clave, { algorithms: ['HS256', 'HS384'] })
      if (typeof carga === 'string' || !carga.sub || !esRol(carga['rol'])) return null
      return { email: carga.sub, rol: carga['rol'] }
    } catch { return null }
  }
}
