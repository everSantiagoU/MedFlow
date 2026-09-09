import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generado/client.js'

process.env['TZ'] ??= 'America/Bogota'

const requerido = (nombre: string, alternativo?: string): string => {
  const valor = process.env[nombre] ?? alternativo
  if (!valor) throw new Error(`Falta ${nombre} (copia .env.example a .env)`)
  return valor
}

export function crearPrisma(): PrismaClient {
  const adapter = new PrismaMariaDb({
    host: requerido('DATABASE_HOST', 'localhost'),
    port: Number(process.env['DATABASE_PORT'] ?? 3306),
    user: requerido('DATABASE_USER'),
    password: requerido('DATABASE_PASSWORD'),
    database: requerido('DATABASE_NAME'),
    connectionLimit: Number(process.env['DATABASE_CONNECTION_LIMIT'] ?? 10),
    timezone: '-05:00',
    allowPublicKeyRetrieval: true,
  })
  return new PrismaClient({ adapter })
}

export type ClientePrisma = PrismaClient
