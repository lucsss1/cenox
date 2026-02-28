# Comanda Digital

Sistema completo de gerenciamento de restaurante com cardapio digital, gestao de pedidos, estoque, fichas tecnicas e dashboard gerencial.

## Stack Tecnologica

### Backend
- Java 17
- Spring Boot 3.2.5
- Spring Security + JWT (stateless)
- Spring Data JPA + Hibernate
- Flyway (migrations)
- MySQL 8
- Bean Validation
- Swagger/OpenAPI

### Frontend
- Angular 17+ (standalone components)
- Angular Router + Guards
- HttpInterceptor (JWT)
- Reactive Forms
- Chart.js

## Pre-requisitos

- **Java 17+** (JDK)
- **Maven 3.8+**
- **MySQL 8.0+**
- **Node.js 18+** e **npm 9+**
- **Angular CLI 17+** (`npm install -g @angular/cli`)

## Configuracao do Banco de Dados

1. Inicie o MySQL e crie o banco (o Spring cria automaticamente se `createDatabaseIfNotExist=true`):

```sql
CREATE DATABASE comanda_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Configure as credenciais em `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/comanda_digital
    username: root
    password: root
```

## Como Rodar o Backend

```bash
cd comanda-digital/backend

# Instalar dependencias e rodar
mvn clean install -DskipTests
mvn spring-boot:run
```

O backend estara disponivel em: **http://localhost:8080**

As migrations Flyway criam automaticamente todas as tabelas e o usuario seed.

## Como Rodar o Frontend

```bash
cd comanda-digital/frontend

# Instalar dependencias
npm install

# Rodar em modo desenvolvimento
ng serve
```

O frontend estara disponivel em: **http://localhost:4200**

## Swagger / API Docs

Acesse a documentacao da API em:
- **http://localhost:8080/swagger-ui.html**
- **http://localhost:8080/api-docs**

## Usuario Seed

| Campo | Valor |
|-------|-------|
| Email | `admin@email.com` |
| Senha | `senha123` |
| Perfil | ADMIN |

## Perfis (RBAC)

| Perfil | Permissoes |
|--------|-----------|
| **ADMIN** | Acesso total: usuarios, categorias, pratos, fichas, insumos, fornecedores, compras, pedidos, dashboard |
| **GERENTE** | Tudo exceto gestao de usuarios |
| **COZINHEIRO** | Visualizar e gerenciar pedidos (alterar status) |
| **CLIENTE** | Cardapio publico, carrinho, fazer pedidos, ver seus pedidos |

## Modulos

1. **Autenticacao** - Login JWT, registro de clientes
2. **Cardapio Publico** - Listagem de pratos ativos com ficha tecnica
3. **Carrinho** - Adicionar pratos, definir quantidade, finalizar pedido
4. **Pedidos** - CRUD completo com fluxo de status (PENDENTE -> EM_PREPARO -> PRONTO -> ENTREGUE)
5. **Fichas Tecnicas** - Composicao de pratos com insumos, fator de correcao, calculo de custos
6. **Estoque/Insumos** - Controle de insumos com estoque minimo e movimentacoes
7. **Fornecedores** - Cadastro de fornecedores
8. **Compras** - Registro de compras com atualizacao automatica de custo medio e estoque
9. **Dashboard** - KPIs, graficos de faturamento, alertas de food cost e estoque

## Regras de Negocio Implementadas

- Prato so pode ser ATIVO se possuir ficha tecnica
- Food cost > 35% gera alerta no dashboard
- Pedido so e aceito se houver estoque suficiente para todos os insumos
- Baixa automatica de estoque ao alterar pedido para EM_PREPARO (@Transactional)
- Cancelamento de pedido restrito a perfis ADMIN e GERENTE
- Email unico (retorna 409 Conflict)
- Fator de correcao >= 1.0 na ficha tecnica
- Custo medio ponderado atualizado automaticamente ao registrar compra
- Recalculo automatico de custo de producao e food cost apos compra
- Exclusao logica (soft delete) via campo status em todas as entidades
- DTO obrigatorio - entidades nunca expostas nos controllers

## Fluxo Completo de Integracao

1. Cliente se registra e faz login
2. Cliente navega pelo cardapio e adiciona pratos ao carrinho
3. Cliente finaliza pedido (validacao de estoque)
4. Cozinheiro altera status para EM_PREPARO (baixa automatica de estoque)
5. Cozinheiro marca como PRONTO, depois ENTREGUE
6. Gerente registra compra de insumos (custo medio atualizado, estoque reposto)
7. Dashboard reflete todos os dados em tempo real

## Estrutura do Projeto

```
comanda-digital/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/comandadigital/
│       │   ├── config/          # JWT, Security
│       │   ├── controller/      # REST Controllers
│       │   ├── dto/request/     # DTOs de entrada
│       │   ├── dto/response/    # DTOs de saida
│       │   ├── entity/          # Entidades JPA
│       │   ├── enums/           # Enumeracoes
│       │   ├── exception/       # Tratamento global
│       │   ├── mapper/          # Conversores Entity<->DTO
│       │   ├── repository/      # Spring Data JPA
│       │   └── service/         # Regras de negocio
│       └── resources/
│           ├── application.yml
│           └── db/migration/    # Flyway
└── frontend/
    └── src/app/
        ├── auth/                # Login, Registro
        ├── admin/               # Painel administrativo
        │   ├── dashboard/
        │   ├── categorias/
        │   ├── pratos/
        │   ├── fichas-tecnicas/
        │   ├── insumos/
        │   ├── fornecedores/
        │   ├── compras/
        │   ├── pedidos/
        │   └── usuarios/
        ├── public/              # Area publica
        │   ├── cardapio/
        │   └── carrinho/
        └── shared/              # Servicos, guards, interceptors, models
```
