# biblioteca — Sistema de gestión de biblioteca con CRUD de libros y autenticación JWT

> API REST en Node.js/Express + MySQL y frontend en Angular 19 para administrar el catálogo de libros de una biblioteca, con roles de usuario y administrador.

![Estado: activo](https://img.shields.io/badge/Estado-activo-green)
![Angular 19](https://img.shields.io/badge/Angular-19.2-DD0031?logo=angular&logoColor=white)
![Node.js + Express 5](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-bdbiblioteca_dssl_ga-4479A1?logo=mysql&logoColor=white)

Los visitantes pueden listar libros y filtrarlos por categoría sin autenticación. Los usuarios registrados inician sesión, consultan su perfil y crean o editan libros. Los administradores pueden, además, eliminar libros. El token JWT viaja en el header `Authorization: Bearer <token>` y se guarda en `localStorage` del frontend.

## Tabla de contenidos

- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación y uso](#instalación-y-uso)
- [Requisitos del sistema](#requisitos-del-sistema)
- [API principal](#api-principal)
- [Modelo de datos](#modelo-de-datos)
- [Formato de intercambio JSON](#formato-de-intercambio-json)
- [Convenciones](#convenciones)
- [Testing (verificación por capas)](#testing-verificación-por-capas)
- [Notas de deploy](#notas-de-deploy)
- [Persistencia y copias](#persistencia-y-copias)
- [Buenas prácticas de uso](#buenas-prácticas-de-uso)
- [Roadmap](#roadmap)
- [Cierre](#cierre)

## Descripción

El sistema nace de la necesidad de llevar un catálogo de libros de una biblioteca con control de quién puede modificar la información. No se trata de una tienda ni de un sistema de préstamos: solo gestiona el alta, consulta, edición y baja de libros, y el acceso de los usuarios por rol.

El backend vive en `biblioteca-crud/` y es una API Express que expone tres grupos de rutas bajo `/api`: `auth` (registro, login, perfil, verificación de token), `libros` (CRUD completo y búsqueda por categoría) y `categorías` (libros por categoría). La persistencia está en MySQL a través de un pool de `mysql2` definido en `config/database.js`, y el esquema con datos de prueba está en `bdbiblioteca_dssl_ga.sql` (tablas `usuarios`, `libros` y `categoria`).

El frontend vive en `biblioteca-front/` y está construido con Angular 19.2.0 (standalone components, rutas en `app.routes.ts`). Las peticiones HTTP pasan por `auth.interceptor.ts`, que inyecta el token Bearer, y por `error.interceptor.ts`. Los guards `auth.guard.ts` y `admin.guard.ts` protegen `/perfil`, `/libros/nuevo` y `/libros/editar/:id`. La navbar muestra un badge "Admin" solo cuando el rol es `admin` (`auth.service.ts`, `isAdmin()`).

Decisiones clave de diseño verificables en el código:
- Autenticación por sesiones con JWT en `localStorage`, expiración 24 h (`JWT_EXPIRES_IN`), sin refresh tokens ni tokens en cookies.
- Las contraseñas nunca se almacenan en texto plano: `bcrypt` las hashea en `controllers/authController.js` usando `BCRYPT_ROUNDS`.
- La lectura del catálogo es pública; crear, editar y eliminar requieren token, y eliminar exige además rol `admin` (`middleware/auth.middleware.js`, `verificarAdmin`).
- CORS está habilitado globalmente en `server.js` para que el frontend (puerto 4200) consuma la API (puerto 3000).

## Características principales

- **Autenticación JWT (Bearer, 24 h):** registro (`POST /api/auth/registro`), login (`POST /api/auth/login`), perfil (`GET /api/auth/perfil`) y verificación de token (`GET /api/auth/verificar`) en `routes/authRoutes.js` y `controllers/authController.js`.
- **Control de acceso por roles:** `verificarAdmin` en `middleware/auth.middleware.js` restringe `DELETE /api/libros/:id` al rol `admin`; la navbar del frontend muestra el badge "Admin" mediante `auth.service.isAdmin()`.
- **CRUD de libros:** crear, leer, actualizar y eliminar en `routes/libroRoutes.js` y `controllers/libroController.js`; lectura pública, escritura protegida por token.
- **Búsqueda por categoría:** `GET /api/libros/librosByCategoria/:id` y `GET /api/categorias/:id` en `controllers/libroController.js` y `controllers/categoriaController.js`.
- **Persistencia MySQL:** base de datos `bdbiblioteca_dssl_ga` con tablas `usuarios`, `libros` y `categoria`; script de esquema y datos semilla en `bdbiblioteca_dssl_ga.sql`.
- **Hash de contraseñas:** `bcrypt` con `BCRYPT_ROUNDS=10` en `controllers/authController.js`; el email es único en `usuarios`.
- **Interceptores Angular:** `auth.interceptor.ts` agrega `Authorization: Bearer <token>` a cada petición; `error.interceptor.ts` maneja errores HTTP.
- **Guards de ruta:** `auth.guard.ts` y `admin.guard.ts` protegen rutas en `app.routes.ts` según autenticación y rol.

## Stack tecnológico

| Capa | Tecnología | Función |
|------|------------|---------|
| Backend | Node.js | Entorno de ejecución del servidor |
| Backend | Express ^5.1.0 | API REST (`server.js`, `routes/`, `controllers/`) |
| Persistencia | mysql2 ^3.15.1 | Pool de conexiones a MySQL (`config/database.js`) |
| Base de datos | MySQL | Tablas `usuarios`, `libros`, `categoria` (`bdbiblioteca_dssl_ga.sql`) |
| Autenticación | jsonwebtoken ^9.0.3 | Tokens JWT firmados y verificados |
| Seguridad | bcryptjs ^3.0.3 | Hash de contraseñas en `authController.js` |
| CORS | cors ^2.8.5 | Acceso entre front (4200) y back (3000) |
| Variables de entorno | dotenv ^17.2.3 | Carga de `.env` en `server.js` |
| Validación | express-validator ^7.3.1 | Reglas de registro en `authRoutes.js` |
| Desarrollo backend | nodemon ^3.1.10 | Recarga automática del servidor |
| Frontend | Angular 19.2.0 | SPA standalone (`@angular/core`, `@angular/router`, ...) |
| Lenguaje frontend | TypeScript ~5.7.2 | Tipado del frontend |
| Estilos frontend | Bootstrap ^5.3.8 + Bootstrap Icons ^1.13.1 | Componentes de la UI |
| Reactividad frontend | RxJS ~7.8.0 | Servicios HTTP y estado de sesión |
| Pruebas frontend | Karma + Jasmine | `ng test` en `biblioteca-front/` |

## Arquitectura

```
biblioteca/                              # Repositorio raíz
├── bdbiblioteca_dssl_ga.sql             # Dump MySQL: esquema + datos semilla (usuarios, libros, categoria)
├── README.md
├── .gitignore                           # Ignora node_modules, dist, .env y salida de build
├── biblioteca-crud/                     # Backend Node.js/Express (puerto 3000)
│   ├── server.js                        # Punto de entrada: Express, CORS, rutas /api/*
│   ├── config/database.js               # Pool de conexiones MySQL (promisePool)
│   ├── routes/                          # authRoutes.js, libroRoutes.js, categoriaRoutes.js
│   ├── controllers/                     # authController.js, libroController.js, categoriaController.js
│   ├── middleware/                      # auth.middleware.js (verificarToken, verificarAdmin)
│   ├── .env                             # PORT, DB_*, JWT_SECRET, BCRYPT_ROUNDS (no se comitea)
│   └── package.json
└── biblioteca-front/                    # Frontend Angular 19 (puerto 4200 con ng serve)
    ├── src/app/app.component.ts         # Componente raíz (navbar + router-outlet)
    ├── src/app/app.routes.ts            # Rutas y guards (authGuard, admin.guard)
    ├── src/app/app.config.ts            # proveedores: router, HttpClient con interceptores
    ├── src/app/services/                # auth.service.ts, libro.service.ts, categoria.service.ts
    ├── src/app/auth/                    # login/, registro/, perfil/, interceptors/, guards/
    ├── src/app/components/              # navbar/, libro-list/, libro-form/, libro-modal/
    ├── src/app/models/                  # usuario.interface.ts, libro.interface.ts, categoria.interface.ts
    ├── src/environments/                # environment.ts (apiUrl: http://localhost:3000/api)
    └── package.json
```

Decisiones de arquitectura:
- **Auth y sesiones:** el frontend guarda token y usuario en `localStorage` (`auth.service.setSession`); el backend valida el JWT en cada petición protegida (`verificarToken`).
- **Estados:** `rol` de `usuarios` es `enum('admin','usuario')`; el admin es el único que puede borrar libros (`verificarAdmin`).
- **Persistencia:** los datos residen en MySQL local en desarrollo (`DB_HOST=localhost`, `DB_NAME=bdbiblioteca_dssl_ga`); el script SQL es la fuente de esquema y datos semilla.
- **Entornos:** en desarrollo tanto front como back corren en `localhost`; la URL de la API se configura en `src/environments/environment.ts`.

## Instalación y uso

Prerrequisitos: Node.js, npm y MySQL Server instalados.

1. Clona el repositorio.
2. Crea la base de datos: ejecuta el script `bdbiblioteca_dssl_ga.sql` en MySQL (crea `bdbiblioteca_dssl_ga`, las tablas y los datos semilla, incluidos los usuarios `admin@biblioteca.com` y `usuario@biblioteca.com`).
3. Backend: accede a `biblioteca-crud/`, copia el `.env` de ejemplo más abajo, instala dependencias y arranca:
   ```bash
   cd biblioteca-crud
   npm install
   node server.js        # o: npx nodemon server.js
   ```
   La API queda en `http://localhost:3000`.
4. Frontend: accede a `biblioteca-front/`, instala y arranca:
   ```bash
   cd biblioteca-front
   npm install
   ng serve
   ```
   Abre `http://localhost:4200`.

### .env de ejemplo (sin secretos reales)

Crea `biblioteca-crud/.env` con estos valores (ajusta los que correspondan a tu entorno):

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=bdbiblioteca_dssl_ga
JWT_SECRET=cambiar_por_un_secreto_largo_y_aleatorio
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

### Flujo básico de uso

1. Regístrate en `/registro` (o accede con los usuarios de la semilla: `admin@biblioteca.com` o `usuario@biblioteca.com`).
2. Inicia sesión en `/login`; el token JWT se guarda en `localStorage`.
3. Navega el catálogo de libros en `/libros` (visto público).
4. Si estás autenticado, crea o edita libros en `/libros/nuevo` o `/libros/editar/:id`.
5. Si eres administrador, elimina libros desde el listado.
6. Consulta tu perfil en `/perfil` o cierra sesión desde la barra de navegación.

## Requisitos del sistema

| Componente | Requisito mínimo |
|------------|------------------|
| Node.js | 18 o superior (requerido por Angular 19) |
| npm | Incluido con Node.js |
| MySQL Server | 8.0 o superior |
| Navegador | Chrome, Edge, Firefox o similar reciente |

## API principal

```http
# Autenticación
POST   /api/auth/registro        # Registro de usuario (nombre, email, password; rol opcional)
POST   /api/auth/login           # Login; devuelve token JWT (exp. 24 h)
GET    /api/auth/perfil          # Perfil del usuario autenticado [token requerido]
GET    /api/auth/verificar       # Valida el token vigente [token requerido]

# Libros
GET    /api/libros               # Listado de libros (público)
GET    /api/libros/:id           # Detalle de un libro (público)
POST   /api/libros               # Crear libro [token requerido]
PUT    /api/libros/:id           # Actualizar libro [token requerido]
DELETE /api/libros/:id           # Eliminar libro [token + admin requerido]
GET    /api/libros/librosByCategoria/:id  # Libros de una categoría (público)

# Categorías
GET    /api/categorias/:id       # Libros de la categoría (pósito)
```

Autenticación: header `Authorization: Bearer <token>`.

## Modelo de datos

Tabla `usuarios` (`bdbiblioteca_dssl_ga.sql`):
- `id` int PK, `nombre` varchar(100), `email` varchar(150) único, `password` varchar(255) (hash bcrypt), `rol` enum('admin','usuario'), `activo` tinyint, `fecha_registro`, `ultima_conexion`.

Tabla `libros`:
- `id` int PK, `titulo` varchar(45), `autor` varchar(45), `isbn` varchar(45), `editorial` varchar(45), `idcategoria` int FK → `categoria.idcategoria`.

Tabla `categoria`:
- `idcategoria` int PK, `nombre` varchar(45).

## Formato de intercambio JSON

Respuesta de login (`POST /api/auth/login`):
```json
{
  "success": true,
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbG...",
  "usuario": {
    "id": 4,
    "nombre": "Administrador",
    "email": "admin@biblioteca.com",
    "rol": "admin"
  }
}
```

Objeto libro (`GET /api/libros/:id`):
```json
{
  "success": true,
  "data": {
    "id": 9,
    "titulo": "Cien años de soledad",
    "autor": "Gabriel García Márquez",
    "isbn": "978-0307474728",
    "editorial": "Editorial Sudamericana",
    "idcategoria": 1
  }
}
```

## Convenciones

- Rutas bajo `/api/{auth|libros|categorias}`.
- Respuestas envueltas en `{ success, mensaje, data?, errores?, error? }`.
- Autenticación por Bearer JWT en header `Authorization`; expiración 24 h.
- Contraseñas hasheadas con bcrypt; email único por usuario.
- Rutas públicas: lectura de libros y categorías. Escritura y eliminación: protegidas.

## Testing (verificación por capas)

1. **Base de datos:** ejecuta `bdbiblioteca_dssl_ga.sql` en MySQL y confirma que existen las tablas `usuarios`, `libros` y `categoria` con datos semilla.
2. **Backend:** desde `biblioteca-crud/`, ejecuta `node server.js` y consulta `http://localhost:3000` (debe devolver el JSON de endpoints) y `POST /api/auth/login` con credenciales de la semilla (debe devolver un token).
3. **Frontend:** desde `biblioteca-front/`, ejecuta `ng serve` y abre `http://localhost:4200`; verifica que se cargue el listado de libros y que el login/registro funcionen contra la API.
4. **Pruebas unitarias del frontend:** `npm test` en `biblioteca-front/` ejecuta Karma + Jasmine (configurado en `angular.json` y `tsconfig.spec.json`).
5. **Backend:** `npm test` en `biblioteca-crud/` solo imprime un mensaje (no hay pruebas definidas en `test.js`).

## Notas de deploy

Gotchas reales numerados:
1. El archivo `biblioteca-crud/.env` contiene secretos (contraseña de BD y `JWT_SECRET`) y **no debe comitearse**; está incluido en `.gitignore`. Cada entorno debe crear su propio `.env`.
2. El frontend apunta a `http://localhost:3000/api` en `src/environments/environment.ts`; para producción cambia `apiUrl` por la URL real del backend.
3. `JWT_SECRET` en `.env` tiene un valor por defecto de ejemplo; cámbialo por un secreto largo y aleatorio antes de llevar el proyecto a producción.
4. CORS está abierto (`cors()` sin restricciones de origen) en `server.js`; restrínge los orígenes permitidos en producción.
5. El directorio `dist/` del frontend es salida de build (`ng build`) y está ignorado por `.gitignore`; no se comitea.
6. `node_modules/` de ambos proyectos está ignorado; instalar dependencias con `npm install` en cada uno tras clonar.

## Persistencia y copias

Los datos residen en MySQL (base de datos `bdbiblioteca_dssl_ga`). Para hacer copias de seguridad usa `mysqldump` sobre esa base de datos; el archivo `bdbiblioteca_dssl_ga.sql` es el esquema base con datos semilla y no sustituye una copia de los datos reales de producción.

## Buenas prácticas de uso

- No compartas el token JWT; se almacena en `localStorage` y caduca a las 24 h.
- Usa un email único por usuario (la tabla `usuarios` lo aplica con `UNIQUE KEY email`).
- La contraseña debe tener al menos 6 caracteres (validación en `authRoutes.js`).
- Asigna el rol `admin` solo a quien deba poder eliminar libros.

## Roadmap

- Despliegue a producción con `apiUrl` apuntando al backend real y HTTPS.
- Reemplazar `JWT_SECRET` por secreto fuerte y agregar refresh tokens.
- Módulo de préstamos y devoluciones de libros.
- Pruebas automatizadas en el backend (`test.js` está vacío).

---

Si este proyecto te resultó útil, considera darle una estrella en GitHub.
