---
name: Navigation refactor completed
description: Full sidebar and routing restructure completed in March 2026 — new file locations and route structure
type: project
---

Navigation refactor was fully implemented and build-verified.

**Why:** 11 flat sidebar items caused cognitive overload; unrelated features were top-level menu items (Entrada Estoque, Validades, etc.).

**New structure:**
- `SidebarComponent` → `src/app/shared/components/sidebar/sidebar.component.ts` (collapsible groups)
- `CardapioLayoutComponent` → `src/app/admin/cardapio-layout/` (tab bar: Categorias, Pratos, Receitas)
- `EstoqueLayoutComponent` → `src/app/admin/estoque-layout/` (tab bar: Insumos, Fornecedores, Compras)
- `OverviewComponent` → `src/app/admin/overview/` (replaces DashboardHub; one-page KPI view)
- `InsumosComponent` → updated with 3 tabs (Todos / Estoque Baixo / Validades) + inline entry modal

**Route groups:**
- `/admin/cardapio/{categorias,pratos,receitas}`
- `/admin/estoque/{insumos,fornecedores,compras}`
- `/admin/configuracoes/usuarios`
- `/admin/overview` (landing page)
- Legacy redirects in place for all old URLs

**How to apply:** When touching navigation, routing, or adding new admin pages, follow this grouped structure. New pages go under the appropriate group route.
