# HCE — Sistema de Compras, Ventas y Kardex

API REST basada en microservicios construida con **NestJS**, comunicación via **Kafka**, base de datos **SQL Server** y autenticación **JWT**. Desarrollada como proyecto de examen técnico para el área de Desarrollo TI HCE.

---

## Tabla de contenido

1. [Arquitectura](#arquitectura)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura del monorepo](#estructura-del-monorepo)
4. [Requisitos previos](#requisitos-previos)
5. [Variables de entorno](#variables-de-entorno)
6. [Levantar infraestructura con Docker](#levantar-infraestructura-con-docker)
7. [Instalación y ejecución](#instalación-y-ejecución)
8. [Documentación API (Swagger)](#documentación-api-swagger)
9. [Colección Postman](#colección-postman)
10. [Scripts SQL](#scripts-sql)
11. [Patrones de diseño implementados](#patrones-de-diseño-implementados)
12. [Principios SOLID](#principios-solid)
13. [Flujos de negocio](#flujos-de-negocio)
14. [Tests](#tests)
15. [Estructura de carpetas detallada](#estructura-de-carpetas-detallada)

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                   │
│                  http://localhost:3000                     │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP / JWT
                            ▼
┌──────────────────────────────────────────────────────────┐
│              API Gateway  (hce-backend)                   │
│                  http://localhost:3001/api                 │
│  • AuthGuard (JWT)   • CORS   • Swagger   • Facade        │
└────┬──────────────┬──────────────┬──────────────┬────────┘
     │              │              │              │
  Kafka          Kafka          Kafka          Kafka
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌──────────┐
│purchases│  │ sales   │  │ movements-ms │  │products  │
│   -ms   │  │   -ms   │  │  (Kardex)    │  │   -ms    │
└────┬────┘  └────┬────┘  └──────────────┘  └──────────┘
     │             │
     └──► Kafka ◄──┘
     (register_movement)
             │
             ▼
     movements-ms persiste

┌──────────────────────────────────────────────────────────┐
│              SQL Server 2022  (port 1433)                 │
│   Products · PurchasesCab/Det · SalesCab/Det             │
│   MovementsCab/Det · User                                 │
└──────────────────────────────────────────────────────────┘
```

**Flujo de stock (Single Source of Truth):**
- El stock no se guarda en `Products`. Se calcula en tiempo real sumando entradas y restando salidas desde `MovementsDet`.
- `movements-ms` es el único servicio que escribe en las tablas de movimientos.
- Antes de registrar una venta, `sales-ms` consulta `get_stock_by_product` a `movements-ms` para validar disponibilidad.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | NestJS 11 (monorepo) |
| Lenguaje | TypeScript 5 |
| Mensajería | Apache Kafka (KafkaJS 2) |
| Base de datos | SQL Server 2022 (TypeORM 1) |
| Autenticación | JWT (30 min) + bcrypt |
| Documentación | Swagger / OpenAPI 3 |
| Contenedores | Docker Compose |
| Tests | Jest + Supertest |

---

## Estructura del monorepo

```
hce-backend/
├── apps/
│   ├── hce-backend/          # API Gateway (puerto 3001)
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── app.controller.ts
│   │       ├── main.ts
│   │       ├── auth/          # Registro, login, guard JWT
│   │       ├── dto/           # DTOs con validación
│   │       └── common/
│   │           ├── decorators/   # @AuditLog (Decorator pattern)
│   │           ├── facades/      # BusinessFacade (Facade pattern)
│   │           ├── interfaces/   # IAuditLogger (DIP)
│   │           └── logger/       # NestAuditLogger (implementación)
│   ├── purchases-ms/         # Microservicio de compras
│   ├── sales-ms/             # Microservicio de ventas
│   ├── movements-ms/         # Microservicio de movimientos / Kardex
│   └── products-ms/          # Microservicio de productos
├── libs/
│   └── database/             # Módulo compartido: entidades TypeORM
│       └── src/entities/
├── scripts/
│   ├── database-scripts.sql  # DDL/DML manual
│   └── HCE-API.postman_collection.json
├── docker-compose.yml        # Kafka + Zookeeper + SQL Server
├── nest-cli.json             # Configuración del monorepo (solo en root)
└── .env.example
```

---

## Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Docker** y **Docker Compose**

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=Password123!_HCE
DB_DATABASE=master

# Kafka
KAFKA_BROKER=localhost:9092

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=30m

# CORS — URL del frontend Next.js
FRONTEND_URL=http://localhost:3000
```

> ⚠️ Nunca subas el `.env` real al repositorio. El `.env.example` es la referencia segura.

---

## Levantar infraestructura con Docker

```bash
# Levanta SQL Server 2022 + Kafka + Zookeeper
docker-compose up -d

# Verifica que los servicios estén saludables
docker-compose ps
```

Espera ~30 segundos para que SQL Server y Kafka estén listos antes de lanzar las apps.

---

## Instalación y ejecución

```bash
# 1) Instalar dependencias
npm install

# 2) Lanzar todos los microservicios en modo desarrollo (terminales separadas)

# Terminal 1 — API Gateway
npm run start:dev hce-backend

# Terminal 2 — Microservicio de compras
npm run start:dev purchases-ms

# Terminal 3 — Microservicio de ventas
npm run start:dev sales-ms

# Terminal 4 — Microservicio de movimientos (Kardex)
npm run start:dev movements-ms

# Terminal 5 — Microservicio de productos
npm run start:dev products-ms
```

La API Gateway queda disponible en `http://localhost:3001/api`.

---

## Documentación API (Swagger)

Una vez levantado el gateway, accede a:

```
http://localhost:3001/api/docs
```

Swagger incluye:
- Esquema de autenticación Bearer JWT
- Ejemplos en todos los DTOs
- Respuestas documentadas por endpoint
- Botón **Authorize** para persistir el token entre peticiones

### Endpoints disponibles

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Login → devuelve JWT | No |
| POST | `/api/products` | Crear producto | ✓ |
| PUT | `/api/products/:id` | Actualizar producto | ✓ |
| GET | `/api/products` | Listar productos | ✓ |
| POST | `/api/purchases` | Registrar compra | ✓ |
| GET | `/api/purchases` | Listar compras | ✓ |
| POST | `/api/sales` | Registrar venta | ✓ |
| GET | `/api/sales` | Listar ventas | ✓ |
| GET | `/api/kardex` | Kardex (stock actual) | ✓ |
| GET | `/api/kardex/movements/:id` | Movimientos de un producto | ✓ |

---

## Colección Postman

Importa `scripts/HCE-API.postman_collection.json` en Postman.

**Orden de uso sugerido:**
1. `Auth → Registrar usuario`
2. `Auth → Login` ← guarda el token automáticamente via script de test
3. Usa cualquier endpoint protegido con `{{token}}`

---

## Scripts SQL

El archivo `scripts/database-scripts.sql` contiene:

- `INSERT` de productos y usuario de prueba
- `SELECT` de compras, ventas y Kardex con JOINs
- `UPDATE` de precios
- `DELETE` condicional (solo si no hay movimientos)
- Top 10 productos más vendidos (último trimestre)
- Historial de movimientos por producto

TypeORM con `synchronize: true` crea las tablas automáticamente al levantar los microservicios.

---

## Patrones de diseño implementados

### Facade Pattern — `BusinessFacade`

Oculta la complejidad de la comunicación Kafka. Los controllers del gateway solo interactúan con la fachada, sin conocer los topics ni los clientes Kafka subyacentes.

```typescript
// Controller — solo llama a la fachada
@Post()
createPurchase(@Body() dto: CreatePurchaseDto) {
  return this.facade.createPurchase(dto); // no sabe nada de Kafka
}

// BusinessFacade — encapsula la complejidad
async createPurchase(dto) {
  return firstValueFrom(this.purchasesClient.send('create_purchase', dto));
}
```

### Decorator Pattern — `@AuditLog`

Decorador de método que envuelve cualquier función de servicio con logging de inicio, fin y error, incluyendo el tiempo de ejecución en ms.

```typescript
@AuditLog('Procesar Compra')
async processPurchase(data: CreatePurchasePayload) {
  // El decorador loguea [INICIO], [FIN] y [ERROR] automáticamente
}
```

---

## Principios SOLID

| Principio | Aplicación en el proyecto |
|-----------|--------------------------|
| **S** – Single Responsibility | Cada microservicio maneja un dominio: compras, ventas, movimientos o productos. `BusinessFacade` solo orquesta; `NestAuditLogger` solo registra. |
| **O** – Open/Closed | Para agregar un nuevo destino de logs (p.ej. CloudWatch) se crea una nueva clase que implemente `IAuditLogger` sin modificar el decorador ni los servicios. |
| **L** – Liskov Substitution | `NestAuditLogger` es intercambiable por cualquier implementación de `IAuditLogger` sin romper el comportamiento del sistema. |
| **I** – Interface Segregation | `IAuditLogger` define solo `log()` y `error()` — no más de lo que el decorador necesita. |
| **D** – Dependency Inversion | Los servicios reciben `IAuditLogger` (abstracción) inyectada a través del token `AUDIT_LOGGER_TOKEN`. La clase concreta `NestAuditLogger` se liga en el Composition Root (`AppModule`). |

```typescript
// Abstracción
export interface IAuditLogger {
  log(message: string): void;
  error(message: string, trace?: string): void;
}

// Ligado en AppModule (Composition Root)
{ provide: AUDIT_LOGGER_TOKEN, useClass: NestAuditLogger }

// Consumido por inyección, no por instanciación directa
constructor(@Inject(AUDIT_LOGGER_TOKEN) readonly auditLogger: IAuditLogger) {}
```

---

## Flujos de negocio

### Registrar Compra

```
Cliente → POST /api/purchases
  → AuthGuard valida JWT
  → BusinessFacade.createPurchase()
  → Kafka: create_purchase → purchases-ms
  → Transacción SQL:
      INSERT PurchasesCab + PurchasesDet
      UPDATE Products.Costo, Products.PrecioVenta (× 1.35)
  → Kafka send(): register_movement → movements-ms
      INSERT MovementsCab (TipoMovimiento=1/Entrada)
      INSERT MovementsDet por cada producto
```

### Registrar Venta (con validación de stock)

```
Cliente → POST /api/sales
  → AuthGuard valida JWT
  → BusinessFacade.createSale()
  → Kafka: create_sale → sales-ms
  → Para cada producto:
      Kafka send(): get_stock_by_product → movements-ms
      movements-ms calcula stock real desde MovementsDet
      Si cantidad > stock → RpcException (rollback)
  → Transacción SQL:
      INSERT SalesCab + SalesDet
  → Kafka send(): register_movement → movements-ms
      INSERT MovementsCab (TipoMovimiento=2/Salida)
      INSERT MovementsDet
```

### Kardex

```
Cliente → GET /api/kardex
  → movements-ms ejecuta:
      SELECT con SUM(CASE Tipo WHEN 1 THEN + WHEN 2 THEN -) AS StockActual
      JOIN Products para nombre, costo y precio
```

### Stock — Single Source of Truth

El campo `Products.StockActual` fue eliminado de la entidad. El stock se calcula siempre desde `MovementsDet`, garantizando consistencia y eliminando el riesgo de desincronización.

---

## Tests

```bash
# Tests unitarios (todos los microservicios y decoradores)
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e del gateway
npm run test:e2e
```

### Cobertura de tests

| Módulo | Tests |
|--------|-------|
| `AuditLog` decorator | 3 casos (éxito, error, fallback sin logger) |
| `AuthService` | 5 casos (register OK, email duplicado, login OK, usuario inexistente, password incorrecto) |
| `BusinessFacade` | 5 casos (todos los topics Kafka) |
| `ProductsMsService` | 4 casos (crear, actualizar, producto no encontrado, listar) |
| `MovementsMsService` | 4 casos (registrar, rollback en error, stock por producto, Kardex) |
| E2E Gateway | 6 casos (login, 401 sin token, listar productos, registrar compra, body inválido, kardex) |

---

## Estructura de carpetas detallada

```
apps/hce-backend/src/
├── app.controller.ts         # 4 controllers: Purchases, Sales, Products, Kardex
├── app.module.ts             # Composition Root (DI, Kafka, AUDIT_LOGGER_TOKEN)
├── main.ts                   # Bootstrap: CORS, ValidationPipe, Swagger
├── auth/
│   ├── auth.controller.ts    # POST /auth/register, POST /auth/login
│   ├── auth.guard.ts         # JWT Bearer Guard
│   ├── auth.module.ts        # JwtModule.registerAsync (30m)
│   ├── auth.service.ts       # bcrypt hash, JWT sign
│   ├── auth.service.spec.ts  # Tests unitarios AuthService ✓
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── create-purchase.dto.ts
│   ├── create-sale.dto.ts
│   └── update-product.dto.ts
└── common/
    ├── decorators/
    │   ├── audit-log.decorator.ts       # @AuditLog — Decorator Pattern
    │   └── audit-log.decorator.spec.ts  # Tests ✓
    ├── facades/
    │   ├── business.facade.ts       # Facade Pattern
    │   └── business.facade.spec.ts  # Tests ✓
    ├── interfaces/
    │   └── audit-logger.interface.ts  # IAuditLogger + token (DIP)
    └── logger/
        └── nest-audit-logger.service.ts  # Implementación concreta

libs/database/src/entities/
├── product.entity.ts        # Sin StockActual (single source of truth)
├── purchases-cab.entity.ts
├── purchases-det.entity.ts
├── sales-cab.entity.ts
├── sales-det.entity.ts
├── movements-cab.entity.ts
├── movements-det.entity.ts
└── user.entity.ts
```

---

## Notas de diseño

- **Reconciliación de Kardex**: si `movements-ms` falla al registrar el movimiento después de una compra/venta ya confirmada, el error queda registrado en los logs con el ID del documento origen. Un operador puede corregirlo manualmente con `scripts/database-scripts.sql`. Para una solución 100% atómica entre servicios distribuidos se requeriría el patrón SAGA con compensación.

- **`nest-cli.json` único en root**: el archivo `apps/hce-backend/nest-cli.json` fue eliminado. La configuración del monorepo vive únicamente en `nest-cli.json` en la raíz del proyecto.

- **`synchronize: true`**: conveniente para desarrollo. En producción, usar migraciones TypeORM (`typeorm migration:run`) y deshabilitar `synchronize`.
