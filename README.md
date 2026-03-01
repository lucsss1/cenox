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



## PRIMEIROS PASSOS

1. Abrir o CMD e clonar esse repositório com o comando: git clone https://github.com/lucsss1/comanda-digital.git


## COMO RODAR O BACKEND

### Configuracao do Banco de Dados

1. Instalar o MySQL pelo link: https://dev.mysql.com/downloads/installer/, selecionando a opção abaixo:
<img width="966" height="609" alt="image" src="https://github.com/user-attachments/assets/bed99e50-8b12-4cdb-9eb6-4eb17ed74436" />

2. Abrir o instalador e seguir com as configurações padrões, somente dando "Próximo".
3. Na parte de escolher uma senha para o usuário "root", a senha deverá ser "root", caso contrário o sistema não irá rodar.
4. MySQL instalado.

### Configuracao do Java

1. Instalar o Java (JDK versão 17) a partir do link https://www.oracle.com/java/technologies/downloads/ e descendo a tela até encontrar a instalação da versão 17. 
2. Selecionar Windows e instalar a "x64 MSI Installer"
3. Após a instalação, verificar digitando no CMD o comando java -version. Caso retorne a versão do java, a instalação foi concluída.

### Configuracao do Maven

1. Próximos passos, instalar Maven, acessar o link: https://maven.apache.org/download.cgi e fazer o download da versão "apache-maven-3.9.12-bin.zip". Após instalar, descompactar a pasta.
2. Após isso, clicar na tecla "Windows" do teclado e digitar "Editar as variáveis de sistema", na tela que abriu, clicar em "Variáveis do ambiente":

<img width="407" height="458" alt="image" src="https://github.com/user-attachments/assets/7b9348cd-d330-4a2a-be97-05623e824029" />

3. Na parte de "Varíavel do ambiente", clicar em "Nova". No campo "Nome da variável" escrever M2_HOME, em "Valor da variável", copiar o caminho completo da pasta "apache-maven-3.9.12". Clicar em OK:
<img width="648" height="155" alt="image" src="https://github.com/user-attachments/assets/d9ad3621-63f8-41da-b18b-e5aca6a5a0b0" />

4. Após isso, na mesma tela encontre a varíavel chamada "Path", selecione-a e clique em "Editar", adicione o mesmo caminho da pasta "apache-maven-3.9.12" e escreva "\bin" no final, exemplo: "C:\Users\usuario\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin", clicar em "OK".

<img width="586" height="232" alt="image" src="https://github.com/user-attachments/assets/bfe7557c-88ef-4a8c-aa0c-edbde9f925ab" />



5. Verificar a instalação completa do Maven abrindo o CMD e digitando "mvn -version".
6. No CMD, ir para a pasta comanda-digital/backend e digitar os comandos abaixo:

- Primeiro: mvn clean install -DskipTests
- Segundo: mvn spring-boot:run (esse serve para rodar o backend).

7. Concluído. O backend estara disponivel em: **http://localhost:8080** (As migrations Flyway criam automaticamente todas as tabelas e o usuario seed.)


## COMO RODAR O FRONTEND

1. Instalar o Node.js a partir do link: https://nodejs.org/en/download.
2. Em seguida, verificar a instalação dele abrindo o CMD e digitando node -v, para verificar a versão.
3. No CMD, ir para a pasta cd comanda-digital/frontend e digitar os seguintes comandos abaixo:

- Primeiro: npm install -g @angular/cli (Isso irá instalar as dependencias)
- Segundo: Rodar npm install
- Terceiro: ng serve (irá rodar o angular)

4. Concluído. O frontend estara disponivel em: **http://localhost:4200**

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
