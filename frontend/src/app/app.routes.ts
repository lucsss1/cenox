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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard-hub/dashboard-hub.component').then(m => m.DashboardHubComponent) },
      { path: 'dashboard/faturamento', loadComponent: () => import('./admin/dashboard-faturamento/dashboard-faturamento.component').then(m => m.DashboardFaturamentoComponent) },
      { path: 'dashboard/pedidos', loadComponent: () => import('./admin/dashboard-pedidos/dashboard-pedidos.component').then(m => m.DashboardPedidosComponent) },
      { path: 'dashboard/estoque', loadComponent: () => import('./admin/dashboard-estoque/dashboard-estoque.component').then(m => m.DashboardEstoqueComponent) },
      { path: 'dashboard/top-pratos', loadComponent: () => import('./admin/dashboard-top-pratos/dashboard-top-pratos.component').then(m => m.DashboardTopPratosComponent) },
      { path: 'dashboard/alertas', loadComponent: () => import('./admin/dashboard-alertas/dashboard-alertas.component').then(m => m.DashboardAlertasComponent) },
      { path: 'categorias', loadComponent: () => import('./admin/categorias/categorias.component').then(m => m.CategoriasComponent) },
      { path: 'pratos', loadComponent: () => import('./admin/pratos/pratos.component').then(m => m.PratosComponent) },
      { path: 'insumos', loadComponent: () => import('./admin/insumos/insumos.component').then(m => m.InsumosComponent) },
      { path: 'entrada-estoque', loadComponent: () => import('./admin/entrada-estoque/entrada-estoque.component').then(m => m.EntradaEstoqueComponent) },
      { path: 'controle-validade', loadComponent: () => import('./admin/controle-validade/controle-validade.component').then(m => m.ControleValidadeComponent) },
      { path: 'fichas-tecnicas', loadComponent: () => import('./admin/fichas-tecnicas/fichas-tecnicas.component').then(m => m.FichasTecnicasComponent) },
      { path: 'pedidos', loadComponent: () => import('./admin/pedidos/pedidos.component').then(m => m.PedidosAdminComponent) },
      { path: 'fornecedores', loadComponent: () => import('./admin/fornecedores/fornecedores.component').then(m => m.FornecedoresComponent) },
      { path: 'compras', loadComponent: () => import('./admin/compras/compras.component').then(m => m.ComprasComponent) },
      { path: 'usuarios', loadComponent: () => import('./admin/usuarios/usuarios.component').then(m => m.UsuariosComponent), data: { roles: ['ADMIN'] } },
    ]
  },
  { path: '**', redirectTo: 'cardapio' }
];
