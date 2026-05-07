# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cenox (Comanda Digital) is a dark kitchen management system. The monorepo contains a Spring Boot backend and an Angular 17 frontend, orchestrated via Docker Compose.

## Commands

### Run everything (recommended)
```bash
# Copy and configure env first
cp .env.example .env
# Set JWT_SECRET: openssl rand -base64 64

docker compose up --build
# Frontend: http://localhost:4200
# Backend:  http://localhost:8080
# Swagger:  http://localhost:8080/swagger-ui.html
```

### Backend (Spring Boot / Maven)
```bash
cd backend
./mvnw spring-boot:run          # requires local MySQL on port 3306
./mvnw test                     # run all tests
./mvnw test -Dtest=ClassName    # run a single test class
./mvnw package -DskipTests      # build JAR
```

### Frontend (Angular 17)
```bash
cd frontend
npm install
npm start                       # dev server on :4200
npm test                        # karma/jasmine
npm run build                   # production build
```

## Architecture

### Backend (`backend/src/main/java/com/comandadigital/`)

Standard Spring Boot layered architecture:

- **`controller/`** — REST controllers, thin HTTP layer only
- **`service/`** — All business logic
- **`repository/`** — Spring Data JPA interfaces
- **`entity/`** — JPA entities (Lombok `@Builder`, `@Data`)
- **`dto/request/`** / **`dto/response/`** — Input/output DTOs, never expose entities directly
- **`mapper/`** — Manual entity↔DTO conversion
- **`config/`** — `SecurityConfig`, `JwtService`, `JwtAuthFilter`
- **`exception/`** — `GlobalExceptionHandler`, `BusinessException`, `ResourceNotFoundException`, `DuplicateResourceException`
- **`enums/`** — `StatusPedido`, `Perfil`, `TipoMovimentacao`, `UnidadeMedida`, etc.

Database migrations live in `src/main/resources/db/migration/` (Flyway, versioned `V1__…sql`).

All API routes are prefixed `/api` (configured in `application.yml`).

### Frontend (`frontend/src/app/`)

Angular 17 with standalone components and lazy-loaded routes:

- **`shared/services/api.service.ts`** — Single service for all HTTP calls to the backend
- **`shared/services/auth.service.ts`** — JWT + localStorage; also manages the shopping cart
- **`shared/services/order-realtime.service.ts`** — Polls `GET /api/pedidos/ativos` every 30s; triggers browser `Notification` on new orders
- **`shared/guards/`** — `authGuard` (JWT present) + `roleGuard` (role in `data.roles`)
- **`shared/interceptors/auth.interceptor.ts`** — Attaches Bearer token to all requests
- **`shared/models/models.ts`** — All TypeScript interfaces mirroring backend DTOs
- **`admin/`** — All authenticated admin pages (dashboard, kanban, estoque, etc.)
- **`public/`** — Public-facing cardápio and cart
- **`auth/`** — Login and registration pages

Routes are defined in `app.routes.ts`. The admin area is protected by both guards and scoped by role: `ADMIN`, `GERENTE`, `COZINHEIRO`.

### Infrastructure

- **Docker Compose**: `mysql` → `backend` → `frontend` (network `comanda-net`; MySQL port not exposed to host)
- **CORS**: hardcoded to `http://localhost:4200` in `SecurityConfig.java` — change this for other environments
- **`JWT_SECRET`** must be set via environment variable; the app will refuse to start without it

## Key Domain Rules

### Stock (Estoque)
- Stock is tracked per **insumo** (ingredient), never per finished product
- All movements are written as immutable records in `movimentacao_estoque` (ledger pattern) — never update, only insert
- `EstoqueService` is the only place stock levels are mutated

### Orders (Pedidos)
Status machine: `PENDENTE → EM_PREPARO → PRONTO → ENTREGUE` (or `CANCELADO` from any non-terminal state)

Critical transitions in `PedidoService`:
- `PENDENTE → EM_PREPARO`: triggers automatic stock deduction based on the dish's **ficha técnica** (bill of materials)
- `CANCELADO` after `EM_PREPARO` or `PRONTO`: triggers stock reversal (estorno)
- Cancellation after `EM_PREPARO` requires role `ADMIN` or `GERENTE`
- A dish can only be ordered if it has a ficha técnica; stock is also verified at order creation time

### Ficha Técnica
Maps a `Prato` (dish) to its list of `Insumo` ingredients with quantities (`quantidadeBruta`). Deleting or creating a ficha técnica directly affects whether a dish can be ordered.

### Compras (Purchase Orders)
`CompraService` integrates with `EstoqueService`: receiving a purchase order triggers stock entries for each item.

## Roles

Defined in `Perfil` enum: `ADMIN`, `GERENTE`, `COZINHEIRO`.

Route-level access in `app.routes.ts`:
- All `admin/` routes: `ADMIN`, `GERENTE`, `COZINHEIRO`
- `cardapio`, `estoque`, `relatorios`, `configuracoes` sub-routes: `ADMIN`, `GERENTE` only
- `configuracoes/usuarios`: `ADMIN` only

## Sub-Agents

`.claude/agents/` contains three agents you can delegate tasks to:
- **`backend`** — backend changes (controllers, services, entities, migrations)
- **`frontend`** — UI changes (components, routes, services, styles)
- **`ux-critic`** — UX review and Design Thinking; read-only, does not write code

> Note: the agent description files reference Next.js/NestJS/PostgreSQL as their ideal stack, but the actual project uses **Angular/Spring Boot/MySQL**. Agents will read the project files and adapt — the descriptions are aspirational templates.
