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
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'categorias', loadComponent: () => import('./admin/categorias/categorias.component').then(m => m.CategoriasComponent) },
      { path: 'pratos', loadComponent: () => import('./admin/pratos/pratos.component').then(m => m.PratosComponent) },
      { path: 'insumos', loadComponent: () => import('./admin/insumos/insumos.component').then(m => m.InsumosComponent) },
      { path: 'fichas-tecnicas', loadComponent: () => import('./admin/fichas-tecnicas/fichas-tecnicas.component').then(m => m.FichasTecnicasComponent) },
      { path: 'pedidos', loadComponent: () => import('./admin/pedidos/pedidos.component').then(m => m.PedidosAdminComponent) },
      { path: 'fornecedores', loadComponent: () => import('./admin/fornecedores/fornecedores.component').then(m => m.FornecedoresComponent) },
      { path: 'compras', loadComponent: () => import('./admin/compras/compras.component').then(m => m.ComprasComponent) },
      { path: 'usuarios', loadComponent: () => import('./admin/usuarios/usuarios.component').then(m => m.UsuariosComponent), data: { roles: ['ADMIN'] } },
    ]
  },
  { path: '**', redirectTo: 'cardapio' }
];
