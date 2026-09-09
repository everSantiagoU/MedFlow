# MedFlow

MedFlow es una aplicacion web para la gestion de un consultorio medico. El proyecto combina React y Vite con un backend Node.js, TypeScript, Express y Prisma, organizado con la misma arquitectura hexagonal de HelpDesk UAM.

## Estructura

```text
MedFlow/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── referencia/schema-baseline.sql
├── src/
│   ├── dominio/
│   │   ├── modelo/
│   │   └── puertos/index.ts
│   ├── aplicacion/
│   │   ├── casos-uso/
│   │   └── dto/
│   ├── infraestructura/
│   │   ├── http/
│   │   ├── persistencia/
│   │   ├── seguridad/
│   │   └── ui/
│   └── main.ts
├── tests/
│   ├── unidad/
│   ├── dobles/
│   └── contrato/
├── .env.example
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── vitest.config.ts
```

La dependencia entre capas es `infraestructura -> aplicacion -> dominio`. Las entidades de dominio no dependen de Prisma y `src/main.ts` es el unico punto que compone adaptadores, casos de uso y servidor. React vive en `infraestructura/ui` porque es el adaptador de entrada visual de la aplicacion.

Java, Spring, Maven, JPA y H2 fueron retirados despues de comprobar la paridad del backend Node con el backend anterior.

## Tecnologias

- Node.js 20.12 o superior
- TypeScript con ESM y modo estricto
- Express 5
- Prisma 7 y `@prisma/adapter-mariadb`
- MySQL existente, sin migraciones Prisma
- JWT y bcrypt
- Vitest y Supertest
- React 19 y Vite 8

## Instalacion

Se requiere npm, Node.js 20.12 o superior, MySQL 8 o superior en `localhost:3306` y la base existente `clinica_db`.

```bash
cp .env.example .env
npm install
```

Variables principales:

```text
DATABASE_URL=mysql://usuario:password@localhost:3306/clinica_db
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=medflow_app
DATABASE_PASSWORD=...
DATABASE_NAME=clinica_db
PORT=3000
FRONTEND_URL=http://localhost:5173
TZ=America/Bogota
JWT_SECRET=...
JWT_EXPIRATION_MS=86400000
```

El usuario MySQL necesita `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre `clinica_db`, pero no permisos para alterar el esquema. La aplicacion no crea ni modifica tablas: no use `prisma migrate` ni `prisma db push`.

## Ejecucion

Backend en `http://localhost:3000/api/v1`:

```bash
npm run dev:backend
```

Frontend en `http://localhost:5173`:

```bash
npm run dev
```

El frontend usa por defecto `http://localhost:3000/api/v1`. Puede cambiarse con `VITE_API_URL`.

## Prisma

`prisma/schema.prisma` mapea las tablas y columnas existentes con `@map` y `@@map`. Prisma se usa solo como cliente de datos.

Para volver a inspeccionar una base clonada:

```bash
DATABASE_URL='mysql://usuario:password@localhost:3306/clinica_db_node_test' npm run db:pull
```

El seed es explicito e idempotente:

```bash
DATABASE_NAME=clinica_db_node_test \
DATABASE_URL='mysql://usuario:password@localhost:3306/clinica_db_node_test' \
npm run db:seed
```

Por seguridad, el comando rechaza `clinica_db`. Para cargarla deliberadamente se debe definir `ALLOW_MAIN_DATABASE_SEED=true` en esa ejecucion.

## API

Rutas publicas:

- `POST /api/v1/auth/login`
- `GET /api/v1/salud`
- `GET /api/v1/docs`
- `GET /api/v1/openapi.json`

El CRUD de doctores, pacientes y procedimientos, junto con citas, calendario e historias clinicas, requiere JWT. Los errores usan siempre:

```json
{
  "mensaje": "Texto del error",
  "errores": []
}
```

Las fechas se intercambian como `YYYY-MM-DDTHH:mm:ss`, sin `Z`, en hora de Bogota.

## Comandos

```bash
npm test
npm run cov
npm run arquitectura
npm run lint
npm run build:all
npm run check
```

`dist/backend` contiene la compilacion Node y `dist/frontend` la compilacion Vite. Ambos directorios, igual que `node_modules`, `coverage`, `.env` y el cliente generado de Prisma, estan excluidos de Git.

## Credenciales de demostracion

El seed conserva estos usuarios, todos con la contrasena `Medflow123*`:

```text
admin@medflow.com
doctor.prueba@medflow.com
paciente.prueba@medflow.com
```
