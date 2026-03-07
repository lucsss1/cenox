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
          <i class="fas fa-fire"></i> Comanda Digital
        </a>
        <div class="nav-links">
          <a routerLink="/cardapio" class="nav-link">Cardapio</a>
          <ng-container *ngIf="auth.isLoggedIn()">
            <a routerLink="/carrinho" class="nav-link cart-link">
              <i class="fas fa-shopping-cart"></i> Carrinho
              <span class="cart-badge" *ngIf="auth.getCartCount() > 0">{{auth.getCartCount()}}</span>
            </a>
            <a routerLink="/meus-pedidos" class="nav-link" *ngIf="auth.hasRole('CLIENTE')">Meus Pedidos</a>
            <a routerLink="/admin" class="nav-link" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE','COZINHEIRO'])">Painel Admin</a>
            <button class="btn btn-secondary btn-sm" (click)="logout()">Sair</button>
          </ng-container>
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="nav-link nav-link-btn">Entrar</a>
            <a routerLink="/registrar" class="btn btn-primary btn-sm">Cadastrar</a>
          </ng-container>
        </div>
      </div>
    </nav>

    <div *ngIf="isAdminRoute()" class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <i class="fas fa-fire"></i>
          </div>
          <span class="sidebar-brand">Comanda Digital</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" class="sidebar-link" [class.active]="isRoute('/admin/dashboard')">
            <i class="fas fa-chart-line"></i> <span>Dashboard</span>
          </a>
          <a routerLink="/admin/pedidos" class="sidebar-link" [class.active]="isRoute('/admin/pedidos')">
            <i class="fas fa-clipboard-list"></i> <span>Pedidos</span>
          </a>
          <a routerLink="/admin/categorias" class="sidebar-link" [class.active]="isRoute('/admin/categorias')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-tags"></i> <span>Categorias</span>
          </a>
          <a routerLink="/admin/pratos" class="sidebar-link" [class.active]="isRoute('/admin/pratos')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-hamburger"></i> <span>Pratos</span>
          </a>
          <a routerLink="/admin/fichas-tecnicas" class="sidebar-link" [class.active]="isRoute('/admin/fichas-tecnicas')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-file-alt"></i> <span>Fichas Tecnicas</span>
          </a>
          <a routerLink="/admin/insumos" class="sidebar-link" [class.active]="isRoute('/admin/insumos')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-boxes"></i> <span>Insumos</span>
          </a>
          <a routerLink="/admin/entrada-estoque" class="sidebar-link" [class.active]="isRoute('/admin/entrada-estoque')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-arrow-circle-down"></i> <span>Entrada Estoque</span>
          </a>
          <a routerLink="/admin/controle-validade" class="sidebar-link" [class.active]="isRoute('/admin/controle-validade')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-calendar-check"></i> <span>Validades</span>
          </a>
          <a routerLink="/admin/fornecedores" class="sidebar-link" [class.active]="isRoute('/admin/fornecedores')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-truck"></i> <span>Fornecedores</span>
          </a>
          <a routerLink="/admin/compras" class="sidebar-link" [class.active]="isRoute('/admin/compras')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">
            <i class="fas fa-shopping-bag"></i> <span>Compras</span>
          </a>
          <a routerLink="/admin/usuarios" class="sidebar-link" [class.active]="isRoute('/admin/usuarios')" *ngIf="auth.hasRole('ADMIN')">
            <i class="fas fa-users"></i> <span>Usuarios</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/cardapio" class="sidebar-link">
            <i class="fas fa-globe"></i> <span>Voltar ao Site</span>
          </a>
          <button class="sidebar-link sidebar-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> <span>Sair</span>
          </button>
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
    /* ---- Public Navbar ---- */
    .navbar {
      background: #0A0A0A; border-bottom: 1px solid #1A1A1A;
      position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);
    }
    .nav-container {
      max-width: 1200px; margin: 0 auto; padding: 14px 20px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .nav-brand {
      font-size: 18px; font-weight: 700; color: #DC2626; text-decoration: none;
      display: flex; align-items: center; gap: 8px;
    }
    .nav-brand i { font-size: 20px; }
    .nav-links { display: flex; align-items: center; gap: 20px; }
    .nav-link {
      text-decoration: none; color: #9CA3AF; font-size: 14px;
      font-weight: 500; position: relative; transition: color 0.2s;
    }
    .nav-link:hover { color: #E5E7EB; }
    .nav-link-btn {
      padding: 7px 16px; border: 1px solid #333; border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-link-btn:hover { border-color: #555; color: #F9FAFB; }
    .cart-link { display: flex; align-items: center; gap: 6px; }
    .cart-badge {
      background: #DC2626; color: white; font-size: 10px; font-weight: 700;
      padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center;
    }
    .public-content { max-width: 1200px; margin: 0 auto; padding: 20px; }

    /* ---- Admin Layout ---- */
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 240px; background: #0A0A0A; color: white;
      display: flex; flex-direction: column; position: fixed; height: 100vh;
      border-right: 1px solid #1A1A1A; z-index: 50;
    }
    .sidebar-header {
      padding: 18px 18px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid #1A1A1A;
    }
    .sidebar-logo {
      width: 32px; height: 32px; border-radius: 8px;
      background: rgba(220,38,38,0.12); display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sidebar-logo i { color: #DC2626; font-size: 14px; }
    .sidebar-brand { font-size: 16px; font-weight: 700; color: #F9FAFB; }
    .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
    .sidebar-link {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 18px; color: #6B7280; text-decoration: none;
      font-size: 13px; transition: all 0.2s; border-left: 3px solid transparent;
      margin: 1px 0;
    }
    .sidebar-link:hover { background: rgba(255,255,255,0.03); color: #E5E7EB; }
    .sidebar-link.active {
      color: #F9FAFB; background: rgba(220,38,38,0.06);
      border-left-color: #DC2626;
    }
    .sidebar-link i { width: 18px; text-align: center; font-size: 14px; }
    .sidebar-footer { border-top: 1px solid #1A1A1A; padding: 8px 0; }
    .sidebar-btn {
      width: 100%; text-align: left; border: none; background: none;
      cursor: pointer; font-size: inherit; font-family: inherit;
    }
    .admin-content {
      margin-left: 240px; flex: 1; padding: 28px; min-height: 100vh;
    }

    @media (max-width: 768px) {
      .nav-links { gap: 10px; }
      .sidebar { width: 56px; }
      .sidebar-brand, .sidebar-link span { display: none; }
      .sidebar-header { justify-content: center; padding: 16px 8px; }
      .sidebar-link { justify-content: center; padding: 12px; border-left: none; }
      .admin-content { margin-left: 56px; }
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  isRoute(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
