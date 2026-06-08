# HCE Frontend — Examen Técnico

## Stack compatible con Module Federation

| Paquete | Versión | Razón |
|---|---|---|
| Next.js | 14.2.29 | Compatible con nextjs-mf@8.1.10 |
| React | 18.x | Requerido por el plugin MF |
| HeroUI | 2.7.9 (v2) | Compatible con React 18 |
| `@module-federation/nextjs-mf` | 8.1.10 | Microfrontend real |
| Router | **Pages Router** | El plugin NO soporta App Router |

## Instalación y arranque

```bash
npm install --legacy-peer-deps
npm run dev
```

> **IMPORTANTE**: El archivo `.env.local` ya contiene `NEXT_PRIVATE_LOCAL_WEBPACK=true`, requerido por el plugin de microfrontend.

## Por qué Pages Router

`@module-federation/nextjs-mf` valida explícitamente que el proyecto use Pages Router. Si detecta App Router lanza:
```
Error: App Directory is not supported by nextjs-mf
```

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Dashboard home |
| `/login` | Inicio de sesión |
| `/register` | Crear cuenta |
| `/dashboard/purchases` | Registrar compras |
| `/dashboard/sales` | Registrar ventas |
| `/dashboard/kardex` | Kardex + movimientos |
| `/dashboard/products` | Catálogo + editar |

## Microfrontend (Module Federation activo)

El `remoteEntry.js` se genera en `/_next/static/chunks/remoteEntry.js`.

Módulos expuestos:

| Expone | Ruta |
|---|---|
| `./PurchasesPage` | `pages/dashboard/purchases.tsx` |
| `./SalesPage` | `pages/dashboard/sales.tsx` |
| `./KardexPage` | `pages/dashboard/kardex.tsx` |
| `./ProductsPage` | `pages/dashboard/products.tsx` |
| `./ProductModal` | `components/purchases/ProductModal.tsx` |
| `./MovementsModal` | `components/kardex/MovementsModal.tsx` |

## Credenciales de prueba

- Email: `admin@hce.com`
- Contraseña: `admin123`
