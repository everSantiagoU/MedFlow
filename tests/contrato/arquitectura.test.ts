import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function archivos(directorio: string): string[] {
  return readdirSync(directorio).flatMap(nombre => {
    const ruta = join(directorio, nombre)
    return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta]
  })
}

describe('arquitectura hexagonal', () => {
  it('dominio y aplicacion no importan infraestructura ni Prisma', () => {
    const rutas = [...archivos('src/dominio'), ...archivos('src/aplicacion')]
    for (const ruta of rutas) {
      const contenido = readFileSync(ruta, 'utf8')
      expect(contenido, ruta).not.toMatch(/infraestructura|@prisma/)
    }
  })

  it.each(['Doctor', 'Paciente'])('compone %s y sus adaptadores en main.ts', entidad => {
    for (const constructor of [`${entidad}DAOPrisma`, `Obtener${entidad}`]) {
      const consumidores = archivos('src').filter(ruta => readFileSync(ruta, 'utf8').includes(`new ${constructor}`))
      expect(consumidores).toEqual(['src/main.ts'])
    }
  })

  it('los errores de aplicacion no contienen codigos HTTP', () => {
    expect(readFileSync('src/aplicacion/errores.ts', 'utf8')).not.toMatch(/estadoHttp|\b(?:400|401|404|409|500)\b/)
  })
})
