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
      <!-- Mobile topbar -->
      <div class="mobile-topbar">
        <button class="mobile-menu-btn" (click)="sidebarOpen = !sidebarOpen">
          <i class="fas" [class.fa-bars]="!sidebarOpen" [class.fa-times]="sidebarOpen"></i>
        </button>
        <span class="mobile-brand"><i class="fas fa-fire"></i> Comanda Digital</span>
      </div>

      <!-- Sidebar overlay for mobile -->
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>

      <aside class="sidebar" [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <i class="fas fa-fire"></i>
          </div>
          <span class="sidebar-brand">Comanda Digital</span>
        </div>

        <nav class="sidebar-nav">
          <!-- Overview -->
          <div class="sidebar-section">Visao Geral</div>
          <a routerLink="/admin/dashboard" class="sidebar-link" [class.active]="isDashboardRoute()" (click)="closeMobile()">
            <i class="fas fa-th-large"></i> <span>Dashboard</span>
          </a>
          <a routerLink="/admin/pedidos" class="sidebar-link" [class.active]="isRoute('/admin/pedidos')" (click)="closeMobile()">
            <i class="fas fa-clipboard-list"></i> <span>Pedidos</span>
          </a>

          <!-- Menu -->
          <div class="sidebar-section" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">Cardapio</div>
          <a routerLink="/admin/categorias" class="sidebar-link" [class.active]="isRoute('/admin/categorias')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-tags"></i> <span>Categorias</span>
          </a>
          <a routerLink="/admin/pratos" class="sidebar-link" [class.active]="isRoute('/admin/pratos')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-hamburger"></i> <span>Pratos</span>
          </a>
          <a routerLink="/admin/fichas-tecnicas" class="sidebar-link" [class.active]="isRoute('/admin/fichas-tecnicas')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-file-alt"></i> <span>Fichas Tecnicas</span>
          </a>

          <!-- Inventory -->
          <div class="sidebar-section" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">Estoque</div>
          <a routerLink="/admin/insumos" class="sidebar-link" [class.active]="isRoute('/admin/insumos')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-boxes"></i> <span>Insumos</span>
          </a>
          <a routerLink="/admin/entrada-estoque" class="sidebar-link" [class.active]="isRoute('/admin/entrada-estoque')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-arrow-circle-down"></i> <span>Entrada Estoque</span>
          </a>
          <a routerLink="/admin/controle-validade" class="sidebar-link" [class.active]="isRoute('/admin/controle-validade')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-calendar-check"></i> <span>Validades</span>
          </a>

          <!-- Suppliers & Purchases -->
          <div class="sidebar-section" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">Compras</div>
          <a routerLink="/admin/fornecedores" class="sidebar-link" [class.active]="isRoute('/admin/fornecedores')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-truck"></i> <span>Fornecedores</span>
          </a>
          <a routerLink="/admin/compras" class="sidebar-link" [class.active]="isRoute('/admin/compras')" *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])" (click)="closeMobile()">
            <i class="fas fa-shopping-bag"></i> <span>Pedidos Compra</span>
          </a>

          <!-- Admin -->
          <div class="sidebar-section" *ngIf="auth.hasRole('ADMIN')">Administracao</div>
          <a routerLink="/admin/usuarios" class="sidebar-link" [class.active]="isRoute('/admin/usuarios')" *ngIf="auth.hasRole('ADMIN')" (click)="closeMobile()">
            <i class="fas fa-users"></i> <span>Usuarios</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/cardapio" class="sidebar-link" (click)="closeMobile()">
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
      background: #09090B; border-bottom: 1px solid var(--border, #27272A);
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
      text-decoration: none; color: #A1A1AA; font-size: 14px;
      font-weight: 500; position: relative; transition: color 0.15s;
    }
    .nav-link:hover { color: #FAFAFA; }
    .nav-link-btn {
      padding: 7px 16px; border: 1px solid #27272A; border-radius: 8px;
      transition: all 0.15s;
    }
    .nav-link-btn:hover { border-color: #3F3F46; color: #FAFAFA; }
    .cart-link { display: flex; align-items: center; gap: 6px; }
    .cart-badge {
      background: #DC2626; color: white; font-size: 10px; font-weight: 700;
      padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center;
    }
    .public-content { max-width: 1200px; margin: 0 auto; padding: 20px; }

    /* ---- Admin Layout ---- */
    .admin-layout { display: flex; min-height: 100vh; }

    /* ---- Sidebar ---- */
    .sidebar {
      width: 240px; background: #09090B;
      display: flex; flex-direction: column;
      position: fixed; height: 100vh;
      border-right: 1px solid #27272A; z-index: 50;
    }
    .sidebar-header {
      padding: 16px 20px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid #27272A; height: 56px;
    }
    .sidebar-logo {
      width: 28px; height: 28px; border-radius: 7px;
      background: rgba(220,38,38,0.1); display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sidebar-logo i { color: #DC2626; font-size: 12px; }
    .sidebar-brand { font-size: 15px; font-weight: 700; color: #FAFAFA; }

    .sidebar-nav { flex: 1; padding: 4px 0; overflow-y: auto; }

    .sidebar-section {
      font-size: 10px; font-weight: 600; color: #52525B;
      text-transform: uppercase; letter-spacing: 0.08em;
      padding: 20px 20px 6px;
    }

    .sidebar-link {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 20px; color: #71717A; text-decoration: none;
      font-size: 13px; font-weight: 450;
      transition: all 0.15s;
      margin: 1px 8px; border-radius: 6px;
    }
    .sidebar-link:hover { background: rgba(255,255,255,0.04); color: #A1A1AA; }
    .sidebar-link.active {
      color: #FAFAFA; background: rgba(220,38,38,0.08);
    }
    .sidebar-link.active i { color: #DC2626; }
    .sidebar-link i { width: 18px; text-align: center; font-size: 13px; flex-shrink: 0; }

    .sidebar-footer {
      border-top: 1px solid #27272A; padding: 8px 0;
    }
    .sidebar-btn {
      width: calc(100% - 16px); text-align: left; border: none; background: none;
      cursor: pointer; font-size: inherit; font-family: inherit;
    }
    .admin-content {
      margin-left: 240px; flex: 1; padding: 28px 32px; min-height: 100vh;
    }

    /* ---- Mobile topbar ---- */
    .mobile-topbar {
      display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px;
      background: #09090B; border-bottom: 1px solid #27272A;
      z-index: 40; padding: 0 16px;
      align-items: center; gap: 12px;
    }
    .mobile-menu-btn {
      width: 36px; height: 36px; border: 1px solid #27272A; background: transparent;
      border-radius: 8px; color: #A1A1AA; font-size: 16px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .mobile-brand { font-size: 15px; font-weight: 700; color: #FAFAFA; display: flex; align-items: center; gap: 8px; }
    .mobile-brand i { color: #DC2626; font-size: 14px; }

    .sidebar-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.5); z-index: 45;
    }

    /* ---- Responsive ---- */
    @media (max-width: 768px) {
      .nav-links { gap: 10px; }
      .mobile-topbar { display: flex; }
      .sidebar-overlay { display: block; }
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.2s ease;
        z-index: 50;
      }
      .sidebar.sidebar-open { transform: translateX(0); }
      .admin-content { margin-left: 0; padding: 72px 16px 24px; }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .admin-content { padding: 24px; }
    }
  `]
})
export class AppComponent {
  sidebarOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  isRoute(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  isDashboardRoute(): boolean {
    return this.router.url === '/admin/dashboard' || this.router.url.startsWith('/admin/dashboard/');
  }

  closeMobile(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
