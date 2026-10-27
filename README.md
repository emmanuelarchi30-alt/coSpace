# CoSpace — Plataforma Fullstack de Reserva de Espacios de Coworking

CoSpace es una plataforma web fullstack desarrollada con **Next.js 16 (App Router)**, **TypeScript** y **Prisma ORM** conectada a **PostgreSQL en Supabase**. Permite a los usuarios explorar espacios de trabajo (escritorios compartidos, salas de juntas y cabinas insonorizadas), reservarlos por horas completas, gestionar y cancelar sus reservas, y a los administradores gestionar el catálogo completo.

La interfaz está diseñada con un estilo **Liquid Glass (cristal líquido translúcido)** con efectos visuales avanzados, componentes interactivos de alto rendimiento (`<ParticleText />` y `<FolderFloat />` con física 2D via Matter.js), internacionalización (ES / EN), optimización de imágenes (`next/image`), renderizado híbrido (SSG, SSR, CSR), autenticación robusta por cookies HTTP-only con rotación de refresh tokens y protección mediante `proxy.ts`.

---

## 1. Descripción del Proyecto

- **Arquitectura**: Fullstack sobre Next.js 16 App Router con Route Handlers propios (sin APIs externas).
- **Roles y Accesos**:
  - **Usuario**: Registro, inicio de sesión, visualización de catálogo activo, detalle de espacios, reservas por horas (1 a 4h), panel personal de reservas y cancelación (hasta 2h antes del inicio).
  - **Administrador**: Todo lo anterior más creación, edición y activación/desactivación de espacios (con validación de reservas futuras activas). Creado exclusivamente vía Seed.
- **Seguridad**: Passwords hasheadas con `bcryptjs`, Access Tokens (15 min) y Refresh Tokens (7 días) enviados en cookies `httpOnly`, `secure` y `sameSite`. Los tokens nunca se exponen en `localStorage` ni en el cuerpo de la respuesta. El refresh token se almacena hasheado (SHA-256) en la base de datos para revocación inmediata al cerrar sesión.
- **Reglas de Negocio en Backend**:
  1. Duración de reservas entre 1 y 4 horas completas (en punto, ej: 10:00 a 12:00).
  2. Horario hábil permitido de 7:00 a 21:00 (mismo día calendario).
  3. No se permite reservar en el pasado ni con más de 30 días de anticipación.
  4. Prevención de solapamiento de horarios en un mismo espacio.
  5. Prevención de solapamiento de horarios para un mismo usuario (incluso en espacios diferentes).
  6. Límite de máximo 3 reservas futuras confirmadas por usuario.
  7. No se puede reservar un espacio desactivado.
  8. El precio total lo calcula estrictamente el servidor (`horas × precioPorHora`).
  9. Solo el titular o un Administrador puede cancelar una reserva.
  10. Usuarios estándar pueden cancelar hasta 2 horas antes del inicio de la reserva.
  11. Cancelar cambia el estado a `CANCELLED`; el registro no se elimina.
  12. Los espacios no se eliminan físicamente; se desactivan (`isActive: false`) y desaparecen del catálogo público.
  13. No se puede desactivar un espacio que tenga reservas futuras confirmadas.
  14. Aislamiento estricto: ningún usuario puede ver ni modificar reservas de otros usuarios.

---

## 2. Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu sistema:

- **Node.js**: Versión `v20.x` o superior (Recomendado: `v22.x`).
- **NPM**: Versión `10.x` o superior.
- **Docker & Docker Compose**: (Opcional para ejecución contenerizada).
- **Conexión a Internet**: Para conectar con la base de datos PostgreSQL alojada en Supabase y cargar imágenes de Unsplash.

---

## 3. Variables de Entorno

El proyecto incluye un archivo `.env.example`. Copia este archivo a `.env`:

```bash
cp .env.example .env
```

### Explicación detallada de cada variable:

| Variable | Descripción | Valor de Ejemplo / Cómo obtenerlo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL hacia el Pooler de Supabase (modo transacción, puerto 6543). | Obtenida en el dashboard de Supabase: *Project Settings -> Database -> Connection string -> URI (Transaction mode)*. |
| `DIRECT_URL` | Cadena de conexión directa hacia PostgreSQL (puerto 5432) usada para migraciones DDL de Prisma. | *Project Settings -> Database -> Connection string -> Session mode (Port 5432)*. |
| `JWT_ACCESS_SECRET` | Llave secreta criptográfica para firmar los Access Tokens (15m). | Generar con `openssl rand -base64 32` en terminal. |
| `JWT_REFRESH_SECRET` | Llave secreta criptográfica para firmar los Refresh Tokens (7d). | Generar con `openssl rand -base64 32` en terminal. |
| `ACCESS_TOKEN_EXPIRES_IN` | Tiempo de vida del Access Token. | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Tiempo de vida del Refresh Token. | `7d` |
| `NEXT_PUBLIC_APP_URL` | URL base pública de la aplicación. | `http://localhost:3000` |

### Valores listos para ejecutar la evaluación:

```env
DATABASE_URL="postgresql://postgres.ucpivpflbgfqzjlqkxhz:coSpace3012%40@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.ucpivpflbgfqzjlqkxhz:coSpace3012%40@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify"
JWT_ACCESS_SECRET="cospace_super_secret_access_jwt_key_2026_secure_random_string_987654"
JWT_REFRESH_SECRET="cospace_super_secret_refresh_jwt_key_2026_secure_random_string_123456"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 4. Ejecución en Desarrollo (Paso a Paso)

Sigue estos comandos exactos y en orden desde la terminal:

### a. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd cospace
npm install
```

### b. Configurar variables de entorno
```bash
cp .env.example .env
# Asegúrate de verificar los valores indicados en la sección anterior
```

### c. Sincronizar esquema y migraciones con Supabase
```bash
npx prisma db push
# O para aplicar migraciones versionadas:
# npx prisma migrate deploy
```

### d. Ejecutar el Seed de la Base de Datos
Crea el usuario administrador, usuario de prueba y catálogo inicial de espacios:
```bash
npm run seed
```

### e. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000).

---

## 5. Credenciales del Administrador y Usuario Demo

Generadas automáticamente por el script de Seed (`prisma/seed.ts`):

### Administrador (Rol `ADMIN`):
- **Correo Electrónico**: `admin@cospace.com`
- **Contraseña**: `AdminPassword123!`
- **Permisos**: Acceso a `/admin`, crear espacios, editar espacios, activar/desactivar espacios, cancelar cualquier reserva.

### Usuario Estándar (Rol `USER`):
- **Correo Electrónico**: `demo@cospace.com`
- **Contraseña**: `UserPassword123!`
- **Permisos**: Ver catálogo activo, reservar espacios (1 a 4h), ver reservas propias en `/dashboard`, cancelar reservas propias con 2h de anticipación.

*(Nota: En la pantalla de Login `/login` existen botones rápidos para autorellenar estas credenciales con un solo clic).*

---

## 6. Ejecución con Docker y Docker Compose

### Opción A: Usando Docker Compose (Recomendada)
```bash
# Construye la imagen y levanta el contenedor con las variables del .env
docker compose up --build -d

# Ver registros de ejecución
docker compose logs -f

# Detener el contenedor
docker compose down
```

### Opción B: Usando Dockerfile directamente
```bash
# 1. Construir la imagen de producción
docker build -t cospace-app .

# 2. Correr el contenedor pasando el archivo de entorno
docker run -d --name cospace-container -p 3000:3000 --env-file .env cospace-app
```

---

## 7. Scripts Disponibles en `package.json`

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `npm run dev` | Inicia el servidor de desarrollo de Next.js 16 con Turbopack. |
| `build` | `npm run build` | Compila la aplicación en modo producción, valida tipos TypeScript y genera páginas estáticas. |
| `start` | `npm start` | Inicia el servidor en producción una vez compilado. |
| `lint` | `npm run lint` | Ejecuta ESLint para validar código limpio y mejores prácticas. |
| `seed` | `npm run seed` | Ejecuta el script `prisma/seed.ts` para poblar usuarios y espacios. |
| `test` | `npm test` | Ejecuta la suite de pruebas unitarias automatizadas para todas las reglas de negocio. |

---

## 8. Estructura de Carpetas del Proyecto

```text
cospace/
├── .env                          # Variables de entorno locales
├── .env.example                  # Plantilla de variables de entorno requeridas
├── Dockerfile                    # Configuración multi-stage de producción
├── docker-compose.yml            # Orquestación de contenedores
├── eslint.config.mjs             # Configuración estricta de ESLint 9
├── next.config.ts                # Configuración de Next.js 16 (remotes de next/image)
├── package.json                  # Dependencias y scripts del proyecto
├── tsconfig.json                 # Configuración estricta de TypeScript (sin any)
├── prisma/
│   ├── schema.prisma             # Modelos relacionales (User, Space, Reservation) y Enums
│   ├── seed.ts                   # Script de inicialización de datos (Admin y espacios)
│   └── migrations/
│       └── 0_init/               # Migración base SQL
├── src/
│   ├── proxy.ts                  # Proxy middleware de Next.js 16 (Protección de rutas)
│   ├── app/
│   │   ├── (public)/             # Route Group público (con Navbar y Footer)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Home (Estrategia SSG - Static Site Generation)
│   │   │   └── spaces/
│   │   │       ├── page.tsx      # Catálogo de espacios (Estrategia SSR)
│   │   │       └── [id]/page.tsx # Detalle de espacio y reserva (Estrategia SSR)
│   │   ├── (auth)/               # Route Group de autenticación (diseño centrado y limpio)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx    # Inicio de sesión con rate limiting
│   │   │   └── register/page.tsx # Registro público de usuarios (rol USER)
│   │   ├── (private)/            # Route Group privado protegido por proxy
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/page.tsx# Mis Reservas (Estrategia CSR - Client-Side Rendering)
│   │   ├── (admin)/              # Route Group de administración protegido por proxy
│   │   │   ├── layout.tsx
│   │   │   └── admin/page.tsx    # Panel de control de espacios
│   │   ├── api/                  # Route Handlers de Next.js (Backend)
│   │   │   ├── auth/             # /register, /login, /refresh, /logout, /me
│   │   │   ├── spaces/           # / (GET, POST), /[id] (GET, PUT, PATCH)
│   │   │   └── reservations/     # / (GET, POST), /[id]/cancel (PATCH)
│   │   ├── layout.tsx            # Root Layout con I18nProvider y fuentes
│   │   └── globals.css           # Estilos globales y clases utilitarias Liquid Glass
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ParticleText.tsx  # Título interactivo con física de partículas en Canvas
│   │   │   ├── FolderFloat.tsx   # Fichero interactivo con física 2D en Matter.js
│   │   │   ├── ClientLocalClock.tsx # Componente de hidratación segura con hora local
│   │   │   └── LanguageSelector.tsx # Selector interactivo ES / EN
│   │   ├── shared/
│   │   │   ├── Navbar.tsx        # Barra de navegación con estado de sesión y menú
│   │   │   ├── Footer.tsx        # Pie de página translúcido
│   │   │   └── SpaceCard.tsx     # Tarjeta de espacio con next/image
│   │   └── forms/
│   │       ├── BookingForm.tsx   # Formulario de reserva con validaciones de negocio
│   │       └── SpaceForm.tsx     # Modal de creación y edición para administradores
│   ├── lib/
│   │   ├── prisma.ts             # Cliente Singleton de Prisma
│   │   ├── auth.ts               # Lógica JWT, cookies seguras y hashing de refresh token
│   │   ├── rateLimit.ts          # Limitador de tasa en memoria para login (Extra)
│   │   ├── businessRules.ts      # Funciones puras de validación de reglas de negocio
│   │   └── i18n/                 # Diccionarios de traducción y hook useI18n
│   └── tests/
│       └── businessRules.test.ts # Suite de 14 pruebas unitarias de reglas de negocio
```

---

## 9. Pruebas Unitarias de Reglas de Negocio (Puntos Extra)

Para verificar el cumplimiento estricto de todas las reglas de negocio, ejecuta:

```bash
npm test
```

La suite valida:
- Validación de reservas de 1 a 4 horas completas (rechazo de minutos intermedios).
- Validación de rango de operación de 7:00 a 21:00.
- Rechazo de reservas pasadas y de más de 30 días en el futuro.
- Rechazo de reservas sobre espacios desactivados.
- Cálculo de precio en servidor (`horas × precioPorHora`).
- Regla de cancelación: usuario solo hasta 2h antes; admin en cualquier momento.
- Rechazo de cancelación no autorizada por terceros.

---

## 10. Despliegue en Vercel y Supabase

- **Base de Datos**: PostgreSQL alojada en [Supabase](https://supabase.com).
- **Frontend y Route Handlers**: Desplegables en [Vercel](https://vercel.com) importando el repositorio de GitHub y configurando las variables de entorno de la sección 3.
- **URL de la aplicación**: `https://cospace.vercel.app` (o el dominio asignado en Vercel).
