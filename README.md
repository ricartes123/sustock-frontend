# SuStock — Frontend

Interfaz web del sistema de gestión de inventario **SuStock**. Construida con Angular 21 usando componentes standalone, Tailwind CSS v4 y soporte multilenguaje (español / inglés). Consume la API REST del backend y gestiona productos, ventas, movimientos de stock y clientes en tiempo real.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 | Framework frontend |
| TypeScript | 5.9 | Lenguaje |
| Tailwind CSS | 4 | Estilos utilitarios |
| @ngx-translate | 17 | Internacionalización (i18n) |
| lucide-angular | 0.575 | Iconografía |
| @ngxpert/hot-toast | 6 | Notificaciones toast |
| RxJS | 7.8 | Programación reactiva |
| Vitest | 4 | Tests unitarios |
| Angular CLI | 21 | Toolchain |

---

## Prerequisitos

- **Node.js** ≥ 22 ([descargar](https://nodejs.org))
- **npm** ≥ 10
- El **backend de SuStock** corriendo (local en `:3000` o vía Docker)

---

## Configuración de entornos

El proyecto usa archivos de entorno en `src/environments/` para configurar la URL de la API según el contexto de ejecución:

| Archivo | Configuración Angular | `apiUrl` |
|---|---|---|
| `environment.development.ts` | `development` (por defecto en `ng serve`) | `http://localhost:3000` |
| `environment.ts` | `production` | `https://api'` |
| `environment.docker.ts` | `docker` | `/api` (proxy nginx) |

No se requiere ningún archivo `.env` para el frontend. La configuración se inyecta en tiempo de compilación a través de `fileReplacements` en `angular.json`.

---

## Cómo correr localmente (sin Docker)

### 1. Instalar dependencias

```bash
cd sustock-frontend
npm install
```

### 2. Verificar que el backend esté corriendo

La configuración de desarrollo apunta a `http://localhost:3000`. Asegurarse de tener el backend iniciado antes de levantar el frontend.

### 3. Iniciar el servidor de desarrollo

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200` con hot-reload activado.

---

## Cómo correr con Docker

La forma recomendada es levantar el proyecto completo desde la raíz del monorepo:

```bash
cd ..                         # ir a la raíz SuStock/
cp .env.example .env          # configurar variables
docker compose up --build
```

En Docker, el frontend se sirve mediante **nginx** en el puerto `${FRONTEND_PORT:-80}`. Nginx actúa como proxy inverso: las peticiones a `/api/*` se redirigen automáticamente a `http://backend:3000/*`, por lo que no se requiere ninguna configuración de CORS adicional.

Para reconstruir solo el frontend:

```bash
docker compose up --build frontend
```

---

## Estructura de carpetas

```
sustock-frontend/
├── public/
│   └── assets/
│       └── i18n/
│           ├── es.json        # Traducciones en español
│           └── en.json        # Traducciones en inglés
├── src/
│   ├── environments/
│   │   ├── environment.ts              # Producción
│   │   ├── environment.development.ts  # Desarrollo local
│   │   └── environment.docker.ts       # Contenedor Docker
│   └── app/
│       ├── app.routes.ts      # Rutas lazy-loaded de la aplicación
│       ├── app.config.ts      # Providers: HTTP, interceptors, i18n, locale
│       ├── app.ts             # Componente raíz
│       ├── core/
│       │   ├── guards/        # AuthGuard (protección de rutas)
│       │   ├── interceptors/  # JwtInterceptor (token + x-workspace-id)
│       │   ├── services/      # AuthService, WorkspaceContextService, LanguageService
│       │   └── models/        # Interfaces TypeScript que reflejan los modelos del backend
│       ├── features/          # Funcionalidades lazy-loaded por ruta
│       │   ├── auth/          # Página de login y registro
│       │   ├── dashboard/     # Panel de métricas y acciones rápidas
│       │   ├── product/       # Catálogo, historial y carga rápida de stock
│       │   ├── movement/      # Lista y creación de movimientos
│       │   ├── sales/         # Lista, detalle y anulación de ventas
│       │   ├── clients/       # Gestión de clientes y detalles de compras
│       │   └── workspace/     # Configuración del espacio de trabajo
│       ├── layout/
│       │   ├── dashboard-layout/  # Layout principal autenticado
│       │   ├── navbar/            # Barra superior con perfil y logout
│       │   └── sidebar/           # Navegación lateral con selector de idioma
│       └── shared/
│           ├── components/    # Button, Modal, Badge, Table, SearchInput, EmptyState, DataWarning
│           ├── directives/
│           ├── pipes/
│           └── utils/
├── Dockerfile                 # Build multi-stage (node build → nginx:alpine)
└── nginx.conf                 # SPA fallback + proxy /api → backend
```

---

## Flujo de autenticación

1. El usuario se registra o inicia sesión en `/login`
2. El backend devuelve un **JWT** que se almacena como signal en `AuthService`
3. `JwtInterceptor` agrega automáticamente `Authorization: Bearer <token>` y `x-workspace-id: <id>` a cada request saliente
4. `AuthGuard` protege todas las rutas bajo el layout autenticado; redirige a `/login` si no hay token

---

## Internacionalización (i18n)

Los textos de la aplicación se cargan desde `public/assets/i18n/`. Para agregar un nuevo idioma:

1. Crear `public/assets/i18n/<codigo>.json` con las mismas claves que `es.json`
2. Registrar el idioma en `LanguageService`
3. Agregar la opción en el selector del sidebar

El idioma por defecto es español (`es`). El usuario puede cambiarlo desde el sidebar y la preferencia se persiste en `localStorage`.

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo en `localhost:4200` |
| `npm run build` | Compila para producción en `dist/` |
| `npm run watch` | Compila en modo watch (development) |
| `npm run test` | Ejecuta los tests con Vitest |
| `npm run lint` | Corre ESLint |
| `npm run lint:fix` | Corre ESLint con autofix |
