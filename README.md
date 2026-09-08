# MedFlow

MedFlow es una aplicacion web para la gestion integral de un consultorio medico.
El MVP actual cubre autenticacion, panel de control, pacientes, citas,
calendario medico e historia clinica cronologica asociada a cada paciente.

## Arquitectura

Todo el codigo fuente vive bajo una sola raiz `src/`, organizada con una
estructura hexagonal inspirada en el proyecto de referencia:

```text
src/
├── MedflowApplication.java
├── dominio/
│   ├── modelo/
│   ├── puertos/
│   └── excepciones/
├── aplicacion/
│   ├── casosuso/
│   └── dto/
└── infraestructura/
    ├── http/
    ├── persistencia/
    ├── seguridad/
    ├── ui/
    └── recursos/

tests/
├── aplicacion/
├── arquitectura/
├── infraestructura/
└── resources/
```

La regla principal es:

```text
infraestructura -> aplicacion -> dominio
```

`dominio` declara el modelo medico, errores de negocio y puertos como
`DoctorDAO`, `PacienteDAO`, `CitaDAO`, `ServicioAutenticacion` y
`ServicioTokens`. `aplicacion` contiene los casos de uso. `infraestructura`
contiene los adaptadores concretos: REST, Spring Data JPA, Spring Security, JWT,
recursos de Spring y la interfaz React.

La regla arquitectonica se verifica con:

```bash
./mvnw -Dtest=com.uam.medflow.arquitectura.ArquitecturaHexagonalTest test
```

## Tecnologias

- React 19 + Vite 8
- Java 25 + Spring Boot 4
- Spring Security + JWT con `jjwt`
- Spring Data JPA
- MySQL en ejecucion local
- H2 en memoria para pruebas
- Maven Wrapper
- ESLint

## Requisitos

- Node.js compatible con Vite 8
- npm
- Java 25
- MySQL local para ejecutar la API contra datos reales
- Git

La configuracion principal de Spring esta en:

```text
src/infraestructura/recursos/application.properties
```

## Configuracion Local

Instala dependencias JavaScript desde la raiz:

```bash
npm install
```

Revisa las credenciales de MySQL en `src/infraestructura/recursos/application.properties`.
Por defecto espera:

```text
Host: localhost
Puerto: 3306
Base: clinica_db
Usuario: root
Password: root
```

Para ambientes compartidos configura un secreto JWT real:

```bash
export JWT_SECRET="un-secreto-largo-y-seguro"
export JWT_EXPIRATION_MS=86400000
```

## Ejecucion

Backend:

```bash
./mvnw spring-boot:run
```

API local:

```text
http://localhost:8080/api/v1
```

Frontend:

```bash
npm run dev
```

UI local:

```text
http://localhost:5173
```

Si necesitas apuntar la UI a otra API:

```bash
VITE_API_URL=http://localhost:8080/api/v1 npm run dev
```

## Pruebas y Build

Backend:

```bash
./mvnw test
```

Frontend:

```bash
npm run lint
npm run build
```

## API

La referencia principal de endpoints, schemas y respuestas esta en:

```text
docs/open-api.yml
```

Modulos implementados:

- Auth
- Pacientes
- Doctores
- Procedimientos
- Citas
- Historias clinicas
- Calendario medico

## Credenciales De Prueba

Los datos semilla incluyen usuarios con la misma contrasena:

```text
Contrasena: Medflow123*
```

Usuarios principales:

```text
admin@medflow.com
doctor.prueba@medflow.com
paciente.prueba@medflow.com
```

Credencial recomendada para validar la experiencia medica:

```text
Correo: doctor.prueba@medflow.com
Contrasena: Medflow123*
```

## Documentacion

- `docs/arquitectura-hexagonal-medflow.md`: estructura hexagonal del proyecto.
- `docs/backend-validation-thunder-client.md`: validacion manual del backend.
- `docs/open-api.yml`: contrato OpenAPI.
- `medflowDocuments/`: mockups, diagramas y documentos academicos del proyecto.

## Reglas Implementadas

- Pacientes no pueden repetir documento ni email.
- Doctores no pueden repetir registro medico ni email.
- Procedimientos no pueden repetir nombre.
- Las citas deben programarse en fecha futura.
- Un doctor no puede tener dos citas a la misma fecha y hora.
- Un paciente no puede tener dos citas a la misma fecha y hora.
- Estados validos de cita: `PROGRAMADA`, `COMPLETADA`, `CANCELADA`.
- Una cita solo puede tener una historia clinica.
- No se permite crear historia clinica para una cita cancelada.
- Al crear una historia clinica, la cita queda marcada como `COMPLETADA`.
- El calendario medico combina citas y eventos.
- Los eventos deben terminar despues de iniciar y no deben cruzarse con citas o eventos activos del doctor.

## Checklist Antes De Entregar

- `./mvnw test` pasa.
- `npm run lint` pasa.
- `npm run build` pasa.
- Backend inicia sin errores.
- Frontend inicia sin errores.
- Login funciona con `doctor.prueba@medflow.com`.
- CRUD de pacientes funciona.
- Gestion de citas funciona.
- Calendario carga citas y eventos.
- Historia clinica carga desde el panel de pacientes.
- No hay secretos reales versionados.
- No hay artefactos generados pendientes de commit.
