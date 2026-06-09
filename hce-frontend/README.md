# HCE Frontend — Sistema de Gestión de Historia Clínica Electrónica

Frontend del sistema HCE (Historia Clínica Electrónica) desarrollado como prueba técnica. Permite gestionar compras, ventas, inventario (kardex) y catálogo de productos de una farmacia o centro de salud.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura](#arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación y arranque](#instalación-y-arranque)
6. [Variables de entorno](#variables-de-entorno)
7. [Módulos del sistema](#módulos-del-sistema)
8. [Flujo de autenticación](#flujo-de-autenticación)
9. [Servicios y API](#servicios-y-api)
10. [Microfrontend (Module Federation)](#microfrontend-module-federation)
11. [Pruebas](#pruebas)
12. [Credenciales de prueba](#credenciales-de-prueba)

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14.2.29 | Framework React (Pages Router) |
| React | 18.x | UI |
| TypeScript | 5.x | Tipado estático |
| HeroUI | 2.x | Componentes de interfaz |
| Tailwind CSS | 3.x | Estilos utilitarios |
| Axios | 1.x | Peticiones HTTP |
| Framer Motion | 12.x | Animaciones |
| Zustand | 5.x | Estado global |
| @module-federation/nextjs-mf | 8.x | Arquitectura microfrontend |
| Jest + Testing Library | — | Pruebas unitarias |

---

## Arquitectura

### Patrón general

El proyecto sigue una arquitectura de **microfrontend** usando **Module Federation**. Actúa como aplicación `remote` que expone sus páginas y componentes para ser consumidos por un `host` externo.

```
┌─────────────────────────────────────────────┐
│              hce_frontend (remote)           │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Compras  │  │  Ventas  │  │  Kardex  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌──────────┐                               │
│  │Productos │   remoteEntry.js              │
│  └──────────┘   /_next/static/chunks/       │
└─────────────────────────────────────────────┘
         ↑ expone módulos vía
┌─────────────────────────────────────────────┐
│              Host externo (consumer)         │
└─────────────────────────────────────────────┘
```

### Flujo de datos

```
Página → Service → api.ts (axios) → Backend NestJS
                ↑
         JWT en localStorage
```

Cada módulo del sistema tiene su propio service en `lib/services/` que encapsula las llamadas HTTP. El archivo `lib/utils/api.ts` centraliza la configuración de axios, incluyendo el interceptor que inyecta el token JWT en cada petición.

---

## Estructura del proyecto

```
hce-frontend/
│
├── __tests__/                   # Pruebas unitarias
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── products.service.test.ts
│   │   ├── purchases.service.test.ts
│   │   ├── sales.service.test.ts
│   │   └── kardex.service.test.ts
│   └── utils/
│       └── formatters.test.ts
│
├── components/
│   ├── kardex/
│   │   └── MovementsModal.tsx   # Modal de movimientos de inventario
│   ├── layout/
│   │   ├── DashboardLayout.tsx  # Layout principal con nav y botón de regreso
│   │   └── NavigationMenu.tsx   # Barra de navegación
│   ├── purchases/
│   │   ├── ProductModal.tsx     # Modal crear/editar producto
│   │   └── PurchaseModal.tsx    # Modal registrar compra
│   └── sales/
│       └── SaleModal.tsx        # Modal registrar venta
│
├── lib/
│   ├── services/                # Capa de acceso a la API
│   │   ├── auth.service.ts
│   │   ├── kardex.service.ts
│   │   ├── products.service.ts
│   │   ├── purchases.service.ts
│   │   └── sales.service.ts
│   └── utils/
│       ├── api.ts               # Instancia axios + interceptores
│       └── formatters.ts        # Helpers de formato (moneda, fecha)
│
├── pages/
│   ├── _app.tsx                 # Provider global (HeroUI, SSR deshabilitado)
│   ├── _document.tsx
│   ├── index.tsx                # Dashboard home
│   ├── login.tsx
│   ├── register.tsx
│   └── dashboard/
│       ├── purchases.tsx        # Lista + modal nueva compra
│       ├── sales.tsx            # Lista + modal nueva venta
│       ├── kardex.tsx           # Inventario + movimientos
│       └── products.tsx         # Catálogo + crear/editar producto
│
├── styles/
│   └── globals.css
│
├── types/                       # Interfaces TypeScript
│   ├── auth.types.ts
│   ├── kardex.types.ts
│   ├── product.types.ts
│   ├── purchase.types.ts
│   └── sale.types.ts
│
├── jest.config.ts
├── jest.setup.ts
├── next.config.mjs              # Config Next.js + Module Federation
├── tailwind.config.ts
└── tsconfig.json
```

---

## Requisitos previos

- **Node.js** >= 18.17.0
- **npm** >= 9.x
- Backend NestJS corriendo en `http://localhost:3001`

---

## Instalación y arranque

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Crear archivo de entorno (si no existe)
cp .env.local.example .env.local

# 3. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

> **Nota:** El flag `--legacy-peer-deps` es necesario porque `@module-federation/nextjs-mf` tiene peer dependencies que entran en conflicto con versiones recientes de npm.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# URL base del backend NestJS
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Requerido por el plugin de Module Federation
NEXT_PRIVATE_LOCAL_WEBPACK=true
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend NestJS | `http://localhost:3001/api` |
| `NEXT_PRIVATE_LOCAL_WEBPACK` | Habilita webpack local para Module Federation | `true` |

---

## Módulos del sistema

### Compras (`/dashboard/purchases`)

Muestra el historial completo de órdenes de compra. Desde esta vista se puede:

- Ver todas las compras con su fecha, subtotal, IGV y total
- Abrir el detalle de cada compra (ítems, cantidades, precios)
- Registrar una nueva compra mediante el botón **"+ Nueva Compra"** (modal)

Al registrar una compra, el sistema calcula automáticamente:
- **Subtotal** = cantidad × costo unitario
- **IGV** = subtotal × 18%
- **Total** = subtotal + IGV

### Ventas (`/dashboard/sales`)

Muestra el historial completo de ventas. Desde esta vista se puede:

- Ver todas las ventas con su fecha, subtotal, IGV y total
- Abrir el detalle de cada venta
- Registrar una nueva venta mediante el botón **"+ Nueva Venta"** (modal)

Al seleccionar un producto para vender, el sistema muestra el **stock disponible** en tiempo real y valida que la cantidad solicitada no supere el stock.

### Kardex (`/dashboard/kardex`)

Panel de control de inventario. Muestra por cada producto:

- Stock actual con indicador de color (verde = ok, amarillo = bajo, rojo = agotado)
- Costo y precio de venta
- Botón **"Ver movimientos"** que abre un modal con el historial de entradas y salidas

### Productos (`/dashboard/products`)

Catálogo de productos. Permite:

- Ver todos los productos con su lote, fechas y precios
- Crear un nuevo producto con el botón **"+ Nuevo Producto"** (modal)
- **Editar** un producto existente (único módulo con esta opción)

Al crear un producto, el **precio de venta se calcula automáticamente** como `costo × 1.35`.

---

## Flujo de autenticación

```
/login ──(POST /auth/login)──► JWT token
   │
   └── guarda en localStorage["hce_token"]
   └── redirige a /
   
Cada request:
   axios interceptor lee localStorage["hce_token"]
   agrega header: Authorization: Bearer <token>
   
Si el backend responde 401:
   axios interceptor limpia localStorage
   redirige automáticamente a /login
```

`DashboardLayout` verifica en cada renderizado que exista el token. Si no existe, redirige a `/login` antes de mostrar cualquier contenido.

---

## Servicios y API

Todos los servicios viven en `lib/services/` y siguen el mismo patrón:

```typescript
// Ejemplo: productsService
export const productsService = {
  getAll: async (): Promise<Product[]> => { ... },
  create: async (dto: CreateProductDto): Promise<Product> => { ... },
  update: async (id: number, dto: UpdateProductDto): Promise<Product> => { ... },
};
```

### Endpoints consumidos

| Servicio | Método | Endpoint |
|---|---|---|
| Auth | POST | `/auth/login` |
| Auth | POST | `/auth/register` |
| Productos | GET | `/products` |
| Productos | POST | `/products` |
| Productos | PUT | `/products/:id` |
| Compras | GET | `/purchases` |
| Compras | POST | `/purchases` |
| Ventas | GET | `/sales` |
| Ventas | POST | `/sales` |
| Kardex | GET | `/kardex` |
| Kardex | GET | `/kardex/movements/:id` |

---

## Microfrontend (Module Federation)

Este proyecto actúa como **remote** bajo el nombre `hce_frontend`. Expone los siguientes módulos en `/_next/static/chunks/remoteEntry.js`:

| Módulo expuesto | Archivo fuente |
|---|---|
| `./PurchasesPage` | `pages/dashboard/purchases.tsx` |
| `./SalesPage` | `pages/dashboard/sales.tsx` |
| `./KardexPage` | `pages/dashboard/kardex.tsx` |
| `./ProductsPage` | `pages/dashboard/products.tsx` |
| `./ProductModal` | `components/purchases/ProductModal.tsx` |
| `./PurchaseModal` | `components/purchases/PurchaseModal.tsx` |
| `./SaleModal` | `components/sales/SaleModal.tsx` |
| `./MovementsModal` | `components/kardex/MovementsModal.tsx` |

Para consumir este remote desde un host externo:

```javascript
// next.config.mjs del HOST
remotes: {
  hce_frontend: "hce_frontend@http://localhost:3000/_next/static/chunks/remoteEntry.js",
}

// Uso en el host
const PurchasesPage = dynamic(() => import("hce_frontend/PurchasesPage"));
```

> **Nota técnica:** El plugin `@module-federation/nextjs-mf` requiere Pages Router. App Router no es compatible. El SSR está deshabilitado globalmente en `_app.tsx` para evitar conflictos entre el runtime de Module Federation y el servidor de Next.js.

---

## Pruebas

### Instalar dependencias de prueba

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-jest --legacy-peer-deps
```

### Ejecutar pruebas

```bash
# Correr todas las pruebas
npm test

# Correr en modo watch
npm test -- --watch

# Ver cobertura
npm test -- --coverage
```

### Cobertura de pruebas

| Archivo | Descripción |
|---|---|
| `auth.service.test.ts` | Login, register, logout, getCurrentUser, isAuthenticated |
| `products.service.test.ts` | CRUD de productos, cálculo de precio de venta |
| `purchases.service.test.ts` | Listado y creación de compras, cálculo de IGV |
| `sales.service.test.ts` | Listado y creación de ventas, validación de stock |
| `kardex.service.test.ts` | Inventario, movimientos, lógica de stock |
| `formatters.test.ts` | Formato de moneda (PEN) y fechas (es-PE) |

---

## Credenciales de prueba

```
Email:      admin@hce.com
Contraseña: admin123
```
