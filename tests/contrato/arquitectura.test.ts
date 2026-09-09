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

  it('main.ts es el unico punto de composicion de adaptadores concretos', () => {
    const consumidores = archivos('src').filter(ruta => readFileSync(ruta, 'utf8').includes('new DoctorDAOPrisma'))
    expect(consumidores).toEqual(['src/main.ts'])
  })
})
