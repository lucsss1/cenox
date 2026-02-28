import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth.service';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ToastComponent],
  template: `
    <nav class="navbar" *ngIf="!isAdminRoute()">
      <div class="nav-container">
        <a routerLink="/cardapio" class="nav-brand">
          <i class="fas fa-utensils"></i> Comanda Digital
        </a>
        <div class="nav-links">
          <a routerLink="/cardapio" class="nav-link">Cardapio</a>
          <ng-container *ngIf="auth.isLoggedIn()">
            <a routerLink="/carrinho" class="nav-link">
              <i class="fas fa-shopping-cart"></i> Carrinho
              <span class="cart-badge" *ngIf="auth.getCartCount() > 0">{{auth.getCartCount()}}</span>
            </a>
            <a routerLink="/meus-pedidos" class="nav-link" *ngIf="auth.hasRole('CLIENTE')">Meus Pedidos</a>
            <a routerLink="/admin" class="nav-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE','COZINHEIRO'])">Painel Admin</a>
            <button class="btn btn-secondary btn-sm" (click)="logout()">Sair</button>
          </ng-container>
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="nav-link">Entrar</a>
            <a routerLink="/registrar" class="btn btn-primary btn-sm">Cadastrar</a>
          </ng-container>
        </div>
      </div>
    </nav>

    <div *ngIf="isAdminRoute()" class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <i class="fas fa-utensils"></i> Comanda Digital
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" class="sidebar-link"><i class="fas fa-chart-line"></i> Dashboard</a>
          <a routerLink="/admin/pedidos" class="sidebar-link"><i class="fas fa-clipboard-list"></i> Pedidos</a>
          <a routerLink="/admin/categorias" class="sidebar-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])"><i class="fas fa-tags"></i> Categorias</a>
          <a routerLink="/admin/pratos" class="sidebar-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])"><i class="fas fa-hamburger"></i> Pratos</a>
          <a routerLink="/admin/fichas-tecnicas" class="sidebar-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])"><i class="fas fa-file-alt"></i> Fichas Tecnicas</a>
          <a routerLink="/admin/insumos" class="sidebar-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])"><i class="fas fa-boxes"></i> Insumos</a>
          <a routerLink="/admin/fornecedores" class="sidebar-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])"><i class="fas fa-truck"></i> Fornecedores</a>
          <a routerLink="/admin/compras" class="sidebar-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])"><i class="fas fa-shopping-bag"></i> Compras</a>
          <a routerLink="/admin/usuarios" class="sidebar-link" *ngIf="auth.hasRole('ADMIN')"><i class="fas fa-users"></i> Usuarios</a>
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/cardapio" class="sidebar-link"><i class="fas fa-home"></i> Voltar ao Site</a>
          <button class="sidebar-link" style="width:100%;text-align:left;border:none;background:none;cursor:pointer;color:inherit;font-size:inherit;padding:10px 16px;" (click)="logout()"><i class="fas fa-sign-out-alt"></i> Sair</button>
        </div>
      </aside>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <div *ngIf="!isAdminRoute()" class="public-content">
      <router-outlet></router-outlet>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .navbar { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
    .nav-brand { font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
    .nav-links { display: flex; align-items: center; gap: 16px; }
    .nav-link { text-decoration: none; color: var(--gray-700); font-size: 14px; font-weight: 500; position: relative; }
    .nav-link:hover { color: var(--primary); }
    .cart-badge { position: absolute; top: -8px; right: -10px; background: var(--danger); color: white; font-size: 10px; padding: 1px 5px; border-radius: 10px; }
    .public-content { max-width: 1200px; margin: 0 auto; padding: 20px; }

    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar { width: 240px; background: var(--dark); color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; }
    .sidebar-header { padding: 20px 16px; font-size: 18px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
    .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .sidebar-link:hover { background: rgba(255,255,255,0.1); color: white; }
    .sidebar-link i { width: 18px; text-align: center; }
    .sidebar-footer { border-top: 1px solid rgba(255,255,255,0.1); padding: 8px 0; }
    .admin-content { margin-left: 240px; flex: 1; padding: 24px; min-height: 100vh; }

    @media (max-width: 768px) {
      .nav-links { gap: 8px; }
      .sidebar { width: 60px; }
      .sidebar-header, .sidebar-link span { display: none; }
      .admin-content { margin-left: 60px; }
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
