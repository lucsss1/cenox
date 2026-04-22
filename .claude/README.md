# .claude/ — Agentes do Claude Code

Este diretório contém os **subagentes especializados** do projeto Comanda Digital, configurados para o [Claude Code](https://claude.ai/code). Cada agente é um arquivo `.md` com instruções que definem identidade, responsabilidades, regras e comportamento de um especialista virtual que atua em uma área específica do sistema.

---

## O que são subagentes?

Subagentes são especialistas que o Claude Code aciona automaticamente (ou sob instrução) para executar tarefas dentro de sua área de domínio. Eles leem o codebase, escrevem código, revisam implementações e retornam resultados — tudo de forma isolada, sem interferir no contexto principal da conversa.

A orquestração está definida no `CLAUDE.md` na raiz do projeto. Nunca acione manualmente tarefas que se encaixam em um dos agentes abaixo — delegue sempre.

---

## Agentes disponíveis

### `agents/backend.md` — Backend Agent

**Quem é:** Engenheiro sênior de backend especializado no servidor do Comanda Digital.

**Quando acionar:**
- Criar ou modificar endpoints REST
- Modelar entidades JPA e migrations Flyway
- Implementar regras de negócio (services)
- Trabalhar com controle de estoque (ledger pattern)
- Configurar autenticação JWT e segurança
- Escrever testes unitários ou de integração backend
- Criar ou ajustar queries, repositories, DTOs
- Qualquer tarefa que toque em `backend/src/`

**O que ele faz:**
- Gera código completo e funcional (controllers, services, repositories, DTOs, mappers)
- Respeita a hierarquia de camadas: Controller → Service → Repository
- Aplica validações, tratamento de erros e logging em toda implementação
- Gera migrations Flyway para qualquer alteração de schema
- Documenta endpoints via Swagger (`@Operation`, `@ApiResponse`, etc.)
- Garante soft delete, ledger imutável para estoque/financeiro e uso de `DECIMAL` para valores monetários

**Stack que conhece:** Java 17, Spring Boot 3, Spring Data JPA, Hibernate, Flyway, Spring Security, JWT, MySQL 8

**Ferramentas disponíveis:** `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`

**Modelo:** Claude Sonnet

> **Atenção:** O arquivo de definição do agente menciona NestJS/Prisma/PostgreSQL como stack de referência, mas o projeto usa **Java Spring Boot + MySQL**. O agente está instruído a sempre ler `pom.xml` e `application.yml` para adaptar-se à stack real.

---

### `agents/frontend.md` — Frontend Agent

**Quem é:** Engenheiro sênior de frontend especializado na interface do Comanda Digital.

**Quando acionar:**
- Criar ou modificar páginas e componentes Angular
- Implementar formulários reativos
- Criar guards, interceptors e services HTTP
- Trabalhar no Kitchen Display System (KDS)
- Construir dashboards, tabelas de dados, gráficos
- Implementar fluxo de criação de pedidos
- Qualquer tarefa que toque em `frontend/src/`

**O que ele faz:**
- Gera componentes standalone com lazy loading via routes
- Implementa todos os 4 estados obrigatórios em cada página: loading (skeleton), erro, vazio (empty state) e preenchido
- Usa `authInterceptor` para injeção automática do JWT
- Mantém interfaces TypeScript sincronizadas com os DTOs do backend
- Aplica responsividade mobile-first e touch targets ≥ 44px para roles operacionais
- Garante separação de responsabilidades: lógica de negócio fora dos componentes

**Stack que conhece:** Angular 17 (standalone components), TypeScript, Tailwind CSS (ou equivalente), Angular CLI, Nginx

**Ferramentas disponíveis:** `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`

**Modelo:** Claude Sonnet

> **Atenção:** O arquivo de definição do agente menciona Next.js/React/shadcn/ui como stack de referência, mas o projeto usa **Angular 17**. O agente está instruído a sempre ler `package.json` para confirmar e adaptar-se à stack real.

---

### `agents/ux-critic.md` — UX Critic Agent

**Quem é:** Designer de produto sênior especializado em sistemas operacionais de alta pressão (restaurantes, foodtech).

**Quando acionar:**
- Revisar uma página ou componente antes de considerar pronto
- Auditar acessibilidade (WCAG 2.1 AA)
- Analisar carga cognitiva por role (KITCHEN, WAITER, CASHIER, MANAGER)
- Avaliar se um fluxo tem toques/passos demais
- Verificar consistência entre módulos do sistema
- Revisar copy, labels, mensagens de erro e empty states
- Checar se DTOs do backend retornam tudo que a UI precisa (review cross-agent)
- Gerar um relatório de saúde UX do sistema

**O que ele faz:**
- Avalia interfaces contra 7 frameworks: eficiência operacional, hierarquia de informação, prevenção de erros, feedback/estados, consistência, acessibilidade e contexto de dispositivo
- Emite relatórios com severidade 🔴 Crítico / 🟡 Importante / 🔵 Melhoria
- Testa cenários extremos: 40 pedidos no KDS, conexão instável, mão enluvada, tela com reflexo
- Compara com referências do mercado (Square KDS, Toast POS, iFood Gestor, etc.)
- **Não implementa código** — aponta problemas e propõe soluções concretas para o Frontend Agent executar

**Ferramentas disponíveis:** `Read`, `Glob`, `Grep` (somente leitura — não escreve código)

**Modelo:** Claude Sonnet

---

## Como os agentes são acionados

Os agentes são acionados pelo Claude Code via instrução no `CLAUDE.md` da raiz. A tabela de orquestração é:

| Tarefa | Agente |
|--------|--------|
| API REST, JPA, Flyway, JWT, regras de negócio | `backend` |
| Componentes Angular, páginas, guards, KDS, dashboard | `frontend` |
| Review de telas, auditoria UX/acessibilidade, fluxos | `ux-critic` |
| Tarefas que envolvem backend + frontend simultaneamente | ambos em paralelo |

---

## Como contribuir com novos agentes

1. Crie um arquivo `.md` em `.claude/agents/` seguindo o frontmatter:

```markdown
---
name: nome-do-agente
description: >
  Descrição do agente e quando acioná-lo (usada para seleção automática).
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# Conteúdo do sistema do agente
```

2. O campo `description` é crítico — é ele que o Claude Code usa para decidir qual agente acionar. Seja específico sobre os gatilhos de acionamento.

3. Inclua no corpo do agente: identidade, stack, domínio de negócio, princípios arquiteturais, padrões de código e regras invioláveis.

4. Registre o novo agente na tabela de orquestração do `CLAUDE.md` na raiz.

---

## `settings.local.json`

Arquivo de permissões locais do Claude Code para este projeto. Define quais comandos Bash o agente pode executar sem pedir confirmação. **Não versionar** em ambientes compartilhados — cada desenvolvedor mantém o seu.

Permissões atualmente configuradas:

| Permissão | Finalidade |
|-----------|------------|
| `gh auth:*` | Autenticação no GitHub CLI |
| `git --version` | Verificação da versão do Git |
| `xargs grep:*` | Busca em múltiplos arquivos |
| `mkdir -p ~/.claude/agents` | Criação do diretório de agentes global |
| `cp .claude/agents/*.md ~/.claude/agents/` | Cópia dos agentes do projeto para o diretório global |
