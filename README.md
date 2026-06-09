# Prueba Técnica - Desarrollo TI HCE 🚀

Este repositorio contiene la solución integral para la evaluación técnica de HCE. El proyecto está compuesto por un Backend desarrollado con una arquitectura de microservicios orientados a eventos y un Frontend moderno y escalable preparado para implementaciones organizacionales complejas.

---

## ⚠️ Nota Importante sobre Nomenclatura e Idioma
Para el desarrollo de este proyecto se ha aplicado el estándar de escribir la estructura del código, métodos, variables de infraestructura y patrones en **inglés** (buenas prácticas de desarrollo). 

Sin embargo, **algunos nombres de entidades, tablas, propiedades y variables de dominio se han escrito en español** (ej. `Productos`, `Ventas_Cabecera`, `Ventas_Detalle`, `Kardex`). Esta decisión de diseño se tomó de forma deliberada para **cumplir estrictamente con la estructura y los requerimientos indicados en el documento PDF** de la prueba técnica.

---

## 🏗️ Arquitectura del Sistema

### Backend (Monorepo con NestJS)
La solución backend emplea un enfoque de **Microservicios Orientados a Eventos** para garantizar el desacoplamiento, la escalabilidad y la alta disponibilidad. 

- **API Gateway (`hce-backend`):** Actúa como único punto de entrada (BFF - Backend For Frontend) para orquestar las peticiones del cliente.
- **Microservicios de Dominio:** - `purchases-ms` (Gestión de Compras)
  - `sales-ms` (Gestión de Ventas)
  - `products-ms` (Catálogo de Productos)
  - `movements-ms` (Gestión de Kardex e Inventario)
- **Mensajería Asíncrona:** La comunicación inter-servicios se realiza mediante **Apache Kafka**, asegurando consistencia eventual (ej. al registrar una venta, el inventario se actualiza asíncronamente).
- **Librería Compartida (`database`):** Fuente única de verdad para las entidades de TypeORM, evitando la duplicidad de código.

#### Patrones de Diseño Implementados:
- **Facade Pattern:** Orquestación de llamadas a múltiples microservicios desde el API Gateway manteniendo los controladores limpios.
- **Decorator Pattern:** Implementación de decoradores personalizados (ej. `@AuditLog`) para extraer lógicas transversales como la auditoría y medición de tiempos de respuesta.
- **Domain-Driven Design (DDD):** Separación clara de contextos delimitados (Ventas, Compras, Inventario).

### Frontend (Next.js)
El cliente web está diseñado pensando en el crecimiento del equipo y la aplicación a largo plazo.

- **Framework:** Next.js (Pages Router) con React.
- **Arquitectura:** Preparado para **Module Federation** (Microfrontends), permitiendo escalar módulos de forma independiente.
- **Estilos:** UI responsiva y ágil implementada con Tailwind CSS.
- **Separación de Responsabilidades:** Lógica de negocio HTTP abstraída en servicios (`lib/services/`) aislados de la capa de componentes visuales.
- **Testing:** Cobertura de pruebas unitarias en la capa de servicios utilizando **Jest**.

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js, NestJS, TypeORM, Apache Kafka, Docker.
- **Frontend:** Next.js, React, Tailwind CSS, Jest, Axios.
- **Base de Datos:** SQL Server / Relacional.

---

## ⚙️ Requisitos Previos

Para ejecutar este proyecto en tu entorno local, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker](https://www.docker.com/) y Docker Compose (Para levantar los servicios de Kafka, Zookeeper y Base de datos)

---
