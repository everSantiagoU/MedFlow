import { defineConfig, env } from 'prisma/config'

try {
  process.loadEnvFile()
} catch {
  // CI puede suministrar las variables directamente.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') },
})
