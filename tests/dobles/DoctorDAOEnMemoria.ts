import type { Doctor, DoctorNuevo } from '../../src/dominio/modelo/Doctor.js'
import type { DoctorDAO } from '../../src/dominio/puertos/index.js'
import { RecursoNoEncontrado } from '../../src/aplicacion/errores.js'

const contiene = (valor: string, termino: string) => valor.toLowerCase().includes(termino.toLowerCase())

export class DoctorDAOEnMemoria implements DoctorDAO {
  readonly filas: Doctor[] = []
  private siguienteId = 1
  async porId(id: number) {
    const fila = this.filas.find(f => f.id === id)
    return fila ? { ...fila } : null
  }
  async guardar(valor: DoctorNuevo | Doctor) {
    const fila = 'id' in valor ? { ...valor } : { ...valor, id: this.siguienteId++ }
    const indice = this.filas.findIndex(f => f.id === fila.id)
    if ('id' in valor && indice < 0) throw new RecursoNoEncontrado(`Doctor no encontrado con id ${valor.id}`)
    if (indice >= 0) this.filas[indice] = fila; else this.filas.push(fila)
    return { ...fila }
  }
  async eliminar(id: number) {
    const indice = this.filas.findIndex(f => f.id === id)
    if (indice < 0) throw new RecursoNoEncontrado(`Doctor no encontrado con id ${id}`)
    this.filas.splice(indice, 1)
  }
  async existeRegistroMedico(valor: string, exceptoId?: number) { return this.filas.some(f => f.id !== exceptoId && f.registroMedico.toLowerCase() === valor.toLowerCase()) }
  async existeEmail(valor: string, exceptoId?: number) { return this.filas.some(f => f.id !== exceptoId && f.email.toLowerCase() === valor.toLowerCase()) }
  async listar(busqueda?: string) {
    return this.filas.filter(f => !busqueda || [f.nombreCompleto, f.especialidad, f.registroMedico, f.email].some(v => contiene(v, busqueda))).sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)).map(f => ({ ...f }))
  }
}
