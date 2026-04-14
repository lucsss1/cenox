import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'cardapio', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'registrar', loadComponent: () => import('./auth/registrar.component').then(m => m.RegistrarComponent) },
  { path: 'cardapio', loadComponent: () => import('./public/cardapio/cardapio.component').then(m => m.CardapioComponent) },
  { path: 'carrinho', loadComponent: () => import('./public/carrinho/carrinho.component').then(m => m.CarrinhoComponent), canActivate: [authGuard] },
  { path: 'meus-pedidos', loadComponent: () => import('./public/cardapio/meus-pedidos.component').then(m => m.MeusPedidosComponent), canActivate: [authGuard] },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'GERENTE', 'COZINHEIRO'] },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      // ── Overview (new unified dashboard) ────────────────────────────────
      {
        path: 'overview',
        loadComponent: () => import('./admin/overview/overview.component').then(m => m.OverviewComponent)
      },

      // ── Pedidos ──────────────────────────────────────────────────────────
      {
        path: 'pedidos',
        loadComponent: () => import('./admin/pedidos/pedidos.component').then(m => m.PedidosAdminComponent)
      },
      {
        path: 'kanban',
        loadComponent: () => import('./admin/kanban/kanban.component').then(m => m.KanbanComponent)
      },
      {
        path: 'cozinha',
        loadComponent: () => import('./admin/cozinha/cozinha.component').then(m => m.CozinhaComponent)
      },

      // ── Cardápio (grouped) ────────────────────────────────────────────────
      {
        path: 'cardapio',
        loadComponent: () => import('./admin/cardapio-layout/cardapio-layout.component').then(m => m.CardapioLayoutComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] },
        children: [
          { path: '', redirectTo: 'pratos', pathMatch: 'full' },
          { path: 'categorias', loadComponent: () => import('./admin/categorias/categorias.component').then(m => m.CategoriasComponent) },
          { path: 'pratos',     loadComponent: () => import('./admin/pratos/pratos.component').then(m => m.PratosComponent) },
          { path: 'receitas',   loadComponent: () => import('./admin/fichas-tecnicas/fichas-tecnicas.component').then(m => m.FichasTecnicasComponent) },
        ]
      },

      // ── Estoque (grouped) ─────────────────────────────────────────────────
      {
        path: 'estoque',
        loadComponent: () => import('./admin/estoque-layout/estoque-layout.component').then(m => m.EstoqueLayoutComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] },
        children: [
          { path: '', redirectTo: 'insumos', pathMatch: 'full' },
          { path: 'insumos',      loadComponent: () => import('./admin/insumos/insumos.component').then(m => m.InsumosComponent) },
          { path: 'fornecedores', loadComponent: () => import('./admin/fornecedores/fornecedores.component').then(m => m.FornecedoresComponent) },
          { path: 'compras',      loadComponent: () => import('./admin/compras/compras.component').then(m => m.ComprasComponent) },
        ]
      },

      // ── Relatórios (grouped) ─────────────────────────────────────────────
      {
        path: 'relatorios',
        loadComponent: () => import('./admin/relatorios-layout/relatorios-layout.component').then(m => m.RelatoriosLayoutComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] },
        children: [
          { path: '', redirectTo: 'financeiro', pathMatch: 'full' },
          { path: 'financeiro', loadComponent: () => import('./admin/relatorio-financeiro/relatorio-financeiro.component').then(m => m.RelatorioFinanceiroComponent) },
          { path: 'pedidos',    loadComponent: () => import('./admin/relatorio-pedidos/relatorio-pedidos.component').then(m => m.RelatorioPedidosComponent) },
          { path: 'cardapio',   loadComponent: () => import('./admin/relatorio-cardapio/relatorio-cardapio.component').then(m => m.RelatorioCardapioComponent) },
          { path: 'estoque',    loadComponent: () => import('./admin/relatorio-estoque/relatorio-estoque.component').then(m => m.RelatorioEstoqueComponent) },
        ]
      },

      // ── Configurações ─────────────────────────────────────────────────────
      {
        path: 'configuracoes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
          { path: 'usuarios', loadComponent: () => import('./admin/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
        ]
      },

      // ── Dashboard sub-pages (detail views, still accessible) ──────────────
      { path: 'dashboard/faturamento', loadComponent: () => import('./admin/dashboard-faturamento/dashboard-faturamento.component').then(m => m.DashboardFaturamentoComponent) },
      { path: 'dashboard/pedidos',     loadComponent: () => import('./admin/dashboard-pedidos/dashboard-pedidos.component').then(m => m.DashboardPedidosComponent) },
      { path: 'dashboard/estoque',     loadComponent: () => import('./admin/dashboard-estoque/dashboard-estoque.component').then(m => m.DashboardEstoqueComponent) },
      { path: 'dashboard/top-pratos',  loadComponent: () => import('./admin/dashboard-top-pratos/dashboard-top-pratos.component').then(m => m.DashboardTopPratosComponent) },
      { path: 'dashboard/alertas',     loadComponent: () => import('./admin/dashboard-alertas/dashboard-alertas.component').then(m => m.DashboardAlertasComponent) },

      // ── Legacy redirects (preserve old bookmarks & links) ─────────────────
      { path: 'dashboard',         redirectTo: 'overview',                 pathMatch: 'full' },
      { path: 'pedidos',           redirectTo: 'kanban',                   pathMatch: 'full' },
      { path: 'categorias',        redirectTo: 'cardapio/categorias',      pathMatch: 'full' },
      { path: 'pratos',            redirectTo: 'cardapio/pratos',          pathMatch: 'full' },
      { path: 'fichas-tecnicas',   redirectTo: 'cardapio/receitas',        pathMatch: 'full' },
      { path: 'insumos',           redirectTo: 'estoque/insumos',          pathMatch: 'full' },
      { path: 'entrada-estoque',   redirectTo: 'estoque/insumos',          pathMatch: 'full' },
      { path: 'controle-validade', redirectTo: 'estoque/insumos',          pathMatch: 'full' },
      { path: 'fornecedores',      redirectTo: 'estoque/fornecedores',     pathMatch: 'full' },
      { path: 'compras',           redirectTo: 'estoque/compras',          pathMatch: 'full' },
      { path: 'usuarios',          redirectTo: 'configuracoes/usuarios',   pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: 'cardapio' }
];
