import bcrypt from 'bcryptjs'
import type { ServicioClaves } from '../../dominio/puertos/index.js'

export class ClavesBcrypt implements ServicioClaves {
  coincide(clave: string, hash: string): Promise<boolean> {
    return bcrypt.compare(clave, hash)
  }
}
