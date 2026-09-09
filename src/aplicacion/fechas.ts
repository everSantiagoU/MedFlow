const FECHA_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/

export function parsearFechaLocal(valor: string): Date | null {
  const partes = FECHA_LOCAL.exec(valor)
  if (!partes) return null
  const [, anio, mes, dia, hora, minuto, segundo, fraccion = ''] = partes
  const fecha = new Date(Date.UTC(
    Number(anio),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
    Number(segundo),
    Number(fraccion.padEnd(3, '0').slice(0, 3)),
  ))
  if (
    fecha.getUTCFullYear() !== Number(anio) ||
    fecha.getUTCMonth() !== Number(mes) - 1 ||
    fecha.getUTCDate() !== Number(dia) ||
    fecha.getUTCHours() !== Number(hora) ||
    fecha.getUTCMinutes() !== Number(minuto) ||
    fecha.getUTCSeconds() !== Number(segundo)
  ) return null
  return fecha
}

const dos = (valor: number) => String(valor).padStart(2, '0')

export function formatearFechaLocal(fecha: Date, microsegundos = fecha.getUTCMilliseconds() * 1000): string {
  const base = `${fecha.getUTCFullYear()}-${dos(fecha.getUTCMonth() + 1)}-${dos(fecha.getUTCDate())}` +
    `T${dos(fecha.getUTCHours())}:${dos(fecha.getUTCMinutes())}:${dos(fecha.getUTCSeconds())}`
  if (!microsegundos) return base
  return `${base}.${String(microsegundos).padStart(6, '0').replace(/0+$/, '')}`
}

export function ahoraLocal(): Date {
  const ahora = new Date()
  return new Date(Date.UTC(
    ahora.getFullYear(), ahora.getMonth(), ahora.getDate(),
    ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), ahora.getMilliseconds(),
  ))
}

export function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60_000)
}

export function restarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() - dias * 86_400_000)
}
