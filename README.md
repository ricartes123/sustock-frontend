# SuStock — Frontend

Interfaz web del sistema de gestión de inventario **SuStock**: un SaaS multi-tenant donde cada negocio administra su catálogo, stock, ventas, clientes y equipo desde un dashboard. Construida con Angular 21 *zoneless*, componentes standalone, signals y Tailwind CSS v4.

**Demo en vivo:** https://sustock.vercel.app — usuario `demo@sustock.com`, contraseña `demo1234`

> La API corre en el plan gratuito de Render, que se suspende tras 15 minutos sin uso: la primera carga puede tardar ~50 segundos.

Backend: [ricartes123/sustock-backend](https://github.com/ricartes123/sustock-backend)

---

## Funcionalidades

- **Dashboard:** ventas del día, valor del stock a precio de venta y de costo, productos más vendidos, alertas de stock bajo y gráfico de ventas.
- **Productos:** CRUD, búsqueda, filtros por estado y stock bajo, archivado y restauración, historial por producto, carga rápida de stock e importación desde Excel/CSV.
- **Movimientos:** entradas, salidas y ajustes de stock con historial.
- **Ventas:** carga con descuentos por ítem, asignación a cliente, anulación con reposición de stock y filtro por fechas.
- **Clientes:** gestión y detalle de compras.
- **Espacio de trabajo:** moneda y tema claro/oscuro. La API ya soporta equipos con roles (OWNER / ADMIN / STAFF); la pantalla de gestión del equipo está pendiente.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 | Framework (zoneless, standalone, signals) |
| TypeScript | 5.9 | Lenguaje |
| Tailwind CSS | 4 | Estilos utilitarios |
| ng2-charts / Chart.js | — | Gráficos del dashboard |
| lucide-angular | 0.575 | Iconografía |
| @ngxpert/hot-toast | 6 | Notificaciones toast |
| RxJS | 7.8 | Programación reactiva |
| Vitest | 4 | Tests unitarios |

---

## Prerequisitos

- **Node.js** ≥ 22 ([descargar](https://nodejs.org))
- **npm** ≥ 10
- El **backend de SuStock** corriendo en `http://127.0.0.1:3000` (ver su README)

---

## Cómo correr localmente

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

No se necesita ningún `.env`. La app llama siempre a `/api`:

| Entorno | Quién resuelve `/api` | Destino |
|---|---|---|
| Desarrollo (`ng serve`) | Proxy de Angular (`proxy.conf.json`) | `http://127.0.0.1:3000` |
| Producción | Rewrite de Vercel (`vercel.json`) | API en Render |

Como el navegador ve todo en el mismo origen, la cookie de sesión funciona sin configurar CORS. El proxy apunta a `127.0.0.1` y no a `localhost` a propósito: en Windows `localhost` resuelve primero a IPv6, y otro proceso escuchando en `[::]:3000` capturaría las peticiones.

---

## Flujo de autenticación

1. El usuario se registra o inicia sesión en `/login`. El backend responde con una cookie httpOnly `access_token`: el token nunca es accesible desde JavaScript.
2. Al arrancar, `initializeSession` (registrado con `provideAppInitializer`) consulta `/auth/me` y los espacios de trabajo antes de la primera navegación, así la sesión se restaura al recargar la página.
3. `apiInterceptor` agrega `withCredentials` y el header `x-workspace-id` a las peticiones a `/api`. Ante un `401`, cierra la sesión y redirige a `/login`.
4. `authGuard` protege las rutas del layout autenticado.

`AuthService` solo guarda el perfil del usuario en un signal.

---

## Decisiones técnicas

- **Zoneless:** no hay Zone.js. Todo estado que cambia en callbacks asíncronos (HTTP, timers) vive en signals para que la vista se actualice.
- **Formularios reactivos:** `ReactiveFormsModule` con `NonNullableFormBuilder`. Los CRUD se abren en modales.
- **Dinero en centavos:** los cálculos de montos en el cliente se hacen en enteros (`Math.round(x * 100)`); el backend es la fuente de verdad. Los importes se muestran con `CurrencyPipe` en la moneda del workspace y 2 decimales.
- **Búsquedas:** se usa `switchMap` para descartar respuestas viejas al escribir.
- **Rutas lazy:** cada feature se carga con `loadComponent`, y los gráficos solo se cargan en el dashboard.

---

## Estructura de carpetas

```
sustock-frontend/
├── proxy.conf.json            # Proxy de desarrollo /api → 127.0.0.1:3000
├── vercel.json                # Rewrite /api → Render + fallback de SPA
└── src/
    ├── environments/
    │   ├── environment.ts              # Build de producción
    │   └── environment.development.ts  # ng serve
    └── app/
        ├── app.config.ts      # Providers: HTTP + apiInterceptor, inicializador de sesión
        ├── app.routes.ts      # Rutas lazy-loaded
        ├── core/
        │   ├── initializers/  # Restauración de sesión y workspaces
        │   ├── guards/        # authGuard
        │   ├── interceptors/  # apiInterceptor (cookie, x-workspace-id, 401)
        │   ├── services/      # AuthService, WorkspaceContextService, ThemeService
        │   └── models/        # Interfaces que reflejan los modelos del backend
        ├── features/
        │   ├── auth/          # Login y registro
        │   ├── dashboard/     # Métricas y gráficos
        │   ├── product/       # Catálogo, formulario e importación
        │   ├── movement/      # Lista y carga de movimientos
        │   ├── sales/         # Lista, carga, detalle y anulación de ventas
        │   ├── clients/       # Clientes y detalle de compras
        │   └── workspace/     # Configuración del espacio de trabajo
        ├── layout/            # Layout autenticado, navbar y sidebar
        └── shared/
            └── components/    # Button, Modal, Badge, Table, Pagination, SearchInput, EmptyState, DataWarning
```

---

## Tests

```bash
npm run test
```

Los tests (Vitest) cubren el flujo de sesión: `authGuard`, `apiInterceptor` y `WorkspaceContextService`.

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `localhost:4200` con proxy a la API |
| `npm run build` | Compila para producción en `dist/` |
| `npm run watch` | Compila en modo watch (development) |
| `npm run test` | Ejecuta los tests con Vitest |
| `npm run lint` | Corre ESLint |
| `npm run lint:fix` | Corre ESLint con autofix |
