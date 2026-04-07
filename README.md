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

### Infraestrutura
- Docker + Docker Compose
- Nginx (proxy reverso para o frontend)

---

## PRIMEIROS PASSOS

1. Abrir o CMD e clonar o repositorio:
```bash
git clone https://github.com/lucsss1/cenox.git
cd cenox
```

---

## COMO RODAR COM DOCKER (Recomendado)

Esta e a forma mais rapida de rodar o projeto. Nao e necessario instalar Java, Maven, MySQL ou Node.js — apenas Docker.

### Pre-requisitos

- **Docker Desktop** instalado: https://www.docker.com/products/docker-desktop/

### Passos

1. Na raiz do projeto, execute:
```bash
docker compose up --build
```

2. Aguarde o build e a inicializacao (pode levar alguns minutos na primeira vez).

3. Acesse o sistema:

| Servico | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend (API) | http://localhost:8080 |
| Swagger UI | http://localhost:4200/swagger-ui/ |
| API Docs | http://localhost:4200/api-docs |

> As migrations Flyway criam automaticamente todas as tabelas e o usuario seed.

### Parar os containers

```bash
docker compose down
```

Para parar e apagar os dados do banco:
```bash
docker compose down -v
```

### Variaveis de Ambiente (opcional)

Por padrao, o banco usa usuario `root` e senha `root`. Para customizar, copie o arquivo de exemplo e edite:
```bash
cp .env.example .env
```

---

## COMO RODAR MANUALMENTE (Alternativa)

Se preferir rodar sem Docker, siga as instrucoes abaixo.

### Pre-requisitos

- **Java 17+** (JDK)
- **Maven 3.8+**
- **MySQL 8.0+**
- **Node.js 18+** e **npm 9+**
- **Angular CLI 17+** (`npm install -g @angular/cli`)

### Configuracao do Banco de Dados

1. Instalar o MySQL pelo link: https://dev.mysql.com/downloads/installer/, selecionando a opcao abaixo:
<img width="966" height="609" alt="image" src="https://github.com/user-attachments/assets/bed99e50-8b12-4cdb-9eb6-4eb17ed74436" />

2. Abrir o instalador e seguir com as configuracoes padrao, somente dando "Proximo".
3. Na parte de escolher uma senha para o usuario "root", a senha devera ser "root", caso contrario o sistema nao ira rodar.
4. MySQL instalado.

### Configuracao do Java

1. Instalar o Java (JDK versao 17) a partir do link https://www.oracle.com/java/technologies/downloads/ e descendo a tela ate encontrar a instalacao da versao 17.
2. Selecionar Windows e instalar a "x64 MSI Installer"
3. Apos a instalacao, verificar digitando no CMD o comando `java -version`. Caso retorne a versao do java, a instalacao foi concluida.

### Configuracao do Maven

1. Proximos passos, instalar Maven, acessar o link: https://maven.apache.org/download.cgi e fazer o download da versao "apache-maven-3.9.12-bin.zip". Apos instalar, descompactar a pasta.
2. Apos isso, clicar na tecla "Windows" do teclado e digitar "Editar as variaveis de sistema", na tela que abriu, clicar em "Variaveis do ambiente":

<img width="407" height="458" alt="image" src="https://github.com/user-attachments/assets/7b9348cd-d330-4a2a-be97-05623e824029" />

3. Na parte de "Variavel do ambiente", clicar em "Nova". No campo "Nome da variavel" escrever M2_HOME, em "Valor da variavel", copiar o caminho completo da pasta "apache-maven-3.9.12". Clicar em OK:
<img width="648" height="155" alt="image" src="https://github.com/user-attachments/assets/d9ad3621-63f8-41da-b18b-e5aca6a5a0b0" />

4. Apos isso, na mesma tela encontre a variavel chamada "Path", selecione-a e clique em "Editar", adicione o mesmo caminho da pasta "apache-maven-3.9.12" e escreva "\bin" no final, exemplo: "C:\Users\usuario\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin", clicar em "OK".

<img width="586" height="232" alt="image" src="https://github.com/user-attachments/assets/bfe7557c-88ef-4a8c-aa0c-edbde9f925ab" />

5. Verificar a instalacao completa do Maven abrindo o CMD e digitando `mvn -version`.

### Rodando o Backend

No CMD, ir para a pasta `comanda-digital/backend` e executar:

```bash
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend disponivel em: **http://localhost:8080**

> As migrations Flyway criam automaticamente todas as tabelas e o usuario seed.

### Rodando o Frontend

No CMD, ir para a pasta `comanda-digital/frontend` e executar:

```bash
npm install
ng serve
```

Frontend disponivel em: **http://localhost:4200**

---

## Deploy na Vercel (Frontend)

> O frontend Angular pode ser publicado gratuitamente na Vercel. O backend Spring Boot precisa ser hospedado separadamente em uma plataforma com suporte a Java (ex: Railway, Render, Fly.io).

### 1. Deploy do Backend (obrigatorio antes do frontend)

Escolha uma plataforma Java (ex: Railway):
1. Crie uma conta em [railway.app](https://railway.app)
2. Crie um novo projeto e adicione um banco **MySQL** (plugin MySQL)
3. Conecte seu repositorio e configure as variaveis de ambiente:
   | Variavel | Valor |
   |----------|-------|
   | `DB_HOST` | host do banco |
   | `DB_PORT` | porta do banco |
   | `DB_NAME` | nome do banco |
   | `DB_USER` | usuario do banco |
   | `DB_PASSWORD` | senha do banco |
   | `JWT_SECRET` | string secreta longa e aleatoria |
4. O Railway detectara o `pom.xml` automaticamente e fara o build com Maven
5. Anote a URL publica gerada (ex: `https://meu-backend.up.railway.app`)

### 2. Configurar a URL do Backend no Frontend

Para deploy na Vercel, edite o arquivo `frontend/src/environments/environment.prod.ts` e substitua o valor de `apiUrl` pela URL do seu backend:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://meu-backend.up.railway.app/api'
};
```

> **Atencao:** Ao usar Docker localmente, mantenha `apiUrl: '/api'` (o Nginx ja faz o proxy automaticamente). Altere para a URL completa apenas para deploy na Vercel.

### 3. Deploy do Frontend na Vercel

**Opcao A — Via interface web (recomendado):**
1. Acesse [vercel.com](https://vercel.com) e faca login com sua conta GitHub
2. Clique em **"Add New Project"** e importe o repositorio
3. Em **"Root Directory"**, selecione `comanda-digital/frontend`
4. As configuracoes de build sao detectadas automaticamente pelo `vercel.json`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/comanda-digital/browser`
5. Clique em **Deploy**

**Opcao B — Via CLI:**
```bash
npm install -g vercel
cd comanda-digital/frontend
vercel --prod
```

### 4. Verificar o Deploy

Apos o deploy, acesse a URL gerada pela Vercel. O frontend se comunicara com o backend pela URL configurada em `environment.prod.ts`.

> **Atencao:** Certifique-se de que o backend permite requisicoes CORS da URL do seu frontend Vercel. Configure a variavel `CORS_ALLOWED_ORIGINS` com a URL da Vercel no backend.

---

## Swagger / API Docs

| Metodo | URL |
|--------|-----|
| Com Docker | http://localhost:4200/swagger-ui/ |
| Sem Docker | http://localhost:8080/swagger-ui.html |
| API Docs (Docker) | http://localhost:4200/api-docs |
| API Docs (sem Docker) | http://localhost:8080/api-docs |

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
├── docker-compose.yml       # Orquestrador dos containers
├── .env.example             # Modelo de variaveis de ambiente
├── backend/
│   ├── Dockerfile
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
    ├── Dockerfile
    ├── nginx.conf               # Proxy reverso para a API
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
