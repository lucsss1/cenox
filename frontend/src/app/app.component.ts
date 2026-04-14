import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth.service';
import { ToastComponent } from './shared/components/toast.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent, SidebarComponent],
  template: `
    <!-- Public navbar -->
    <nav class="navbar" [class.navbar-light]="isCardapioRoute()" *ngIf="!isAdminRoute() && !isAuthRoute()">
      <div class="nav-inner">

        <a routerLink="/cardapio" class="nav-brand">
          <div class="brand-flame">
            <i class="fas fa-fire"></i>
          </div>
          <span><strong>Cenox</strong></span>
        </a>

        <div class="nav-links">
          <a routerLink="/cardapio" routerLinkActive="link-active" class="nav-link">
            Cardápio
          </a>

          <ng-container *ngIf="auth.isLoggedIn()">
            <a routerLink="/meus-pedidos" routerLinkActive="link-active" class="nav-link"
               *ngIf="auth.hasRole('CLIENTE')">
              Meus Pedidos
            </a>

            <a routerLink="/carrinho" class="nav-cart" *ngIf="auth.isLoggedIn()">
              <i class="fas fa-shopping-bag"></i>
              <span>Carrinho</span>
              <span class="cart-count" *ngIf="auth.getCartCount() > 0">
                {{auth.getCartCount()}}
              </span>
            </a>

            <a routerLink="/admin" class="btn btn-secondary btn-sm"
               *ngIf="auth.hasAnyRole(['ADMIN','GERENTE','COZINHEIRO'])">
              <i class="fas fa-th-large"></i> Admin
            </a>

            <button class="nav-logout" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </ng-container>

          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="nav-link-outline">Entrar</a>
            <a routerLink="/registrar" class="btn btn-primary btn-sm">Cadastrar</a>
          </ng-container>
        </div>

      </div>
    </nav>

    <!-- Admin layout -->
    <div *ngIf="isAdminRoute()" class="admin-layout">
      <app-sidebar></app-sidebar>
      <div class="admin-main">

        <!-- Topbar -->
        <header class="admin-topbar">
          <nav class="topbar-breadcrumb">
            <i class="fas fa-fire crumb-root"></i>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">{{currentSection}}</span>
          </nav>
          <div class="topbar-spacer"></div>
          <div class="topbar-actions">
            <a routerLink="/admin/cozinha" class="btn btn-ghost btn-sm"
               *ngIf="auth.hasAnyRole(['ADMIN','GERENTE','COZINHEIRO']) && !isCozinhaRoute()">
              <i class="fas fa-fire"></i> Cozinha
            </a>
            <div class="topbar-user" *ngIf="topbarUserName">
              <div class="topbar-avatar"><i class="fas fa-user"></i></div>
              <span class="topbar-user-name">{{topbarUserName}}</span>
            </div>
          </div>
        </header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Public content -->
    <ng-container *ngIf="!isAdminRoute()">
      <div [class]="isAuthRoute() ? 'auth-fullscreen' : isCardapioRoute() ? 'cardapio-fullscreen' : 'public-content'">
        <router-outlet></router-outlet>
      </div>
    </ng-container>

    <app-toast></app-toast>
  `,
  styles: [`
    /* ---- Navbar ---- */
    .navbar {
      background: rgba(8,8,8,0.96);
      border-bottom: 1px solid #161616;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 58px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Brand */
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 16px;
      font-weight: 500;
    }
    .nav-brand strong { font-weight: 700; }
    .brand-flame {
      width: 32px;
      height: 32px;
      background: var(--primary-subtle);
      border: 1px solid var(--primary-muted);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-flame i { color: var(--primary); font-size: 13px; }

    /* Links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-link {
      padding: 6px 12px;
      border-radius: 7px;
      text-decoration: none;
      color: #6B7280;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.18s ease;
    }
    .nav-link:hover { color: #D1D5DB; background: rgba(255,255,255,0.04); }
    .nav-link.link-active { color: var(--text-primary); background: rgba(255,255,255,0.05); }

    .nav-link-outline {
      padding: 6px 14px;
      border: 1px solid #262626;
      border-radius: 7px;
      text-decoration: none;
      color: #9CA3AF;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.18s ease;
      margin-left: 4px;
    }
    .nav-link-outline:hover {
      border-color: #383838;
      color: #E5E7EB;
      background: rgba(255,255,255,0.03);
    }

    /* Cart */
    .nav-cart {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: 7px;
      text-decoration: none;
      color: #9CA3AF;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.18s ease;
      position: relative;
      border: 1px solid #1E1E1E;
      margin-left: 4px;
    }
    .nav-cart:hover { color: #E5E7EB; border-color: #2A2A2A; background: rgba(255,255,255,0.03); }
    .cart-count {
      background: var(--primary);
      color: var(--primary-on);
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* Logout */
    .nav-logout {
      width: 32px;
      height: 32px;
      border-radius: 7px;
      background: transparent;
      border: 1px solid #1E1E1E;
      color: #4B5563;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      transition: all 0.18s ease;
      margin-left: 4px;
    }
    .nav-logout:hover { color: #FCA5A5; border-color: rgba(220,38,38,0.2); background: rgba(220,38,38,0.05); }

    /* ---- Public content ---- */
    .public-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }

    /* ---- Cardápio / public warm routes ---- */
    .cardapio-fullscreen {
      width: 100%;
      min-height: calc(100vh - 58px);
    }

    /* ---- Auth pages (login / registrar) ---- */
    .auth-fullscreen {
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Navbar light (cardápio) ─────────────── */
    .navbar.navbar-light {
      background: #EDE8E0;
      border-bottom: 1px solid #E0D8D0;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .navbar-light .nav-brand { color: #1A1A1A; }
    .navbar-light .brand-flame {
      background: rgba(212,83,26,0.10);
      border-color: rgba(212,83,26,0.20);
    }
    .navbar-light .brand-flame i { color: #D4531A; }
    .navbar-light .nav-link { color: #6B6B6B; }
    .navbar-light .nav-link:hover { color: #1A1A1A; background: rgba(0,0,0,0.04); }
    .navbar-light .nav-link.link-active { color: #D4531A; background: rgba(212,83,26,0.08); }
    .navbar-light .nav-link-outline {
      border-color: #D4C8C0;
      color: #6B6B6B;
    }
    .navbar-light .nav-link-outline:hover {
      border-color: #D4531A;
      color: #D4531A;
      background: rgba(212,83,26,0.06);
    }
    .navbar-light .nav-cart { color: #6B6B6B; border-color: #D4C8C0; }
    .navbar-light .nav-cart:hover { color: #1A1A1A; border-color: #D4531A; background: rgba(212,83,26,0.06); }
    .navbar-light .cart-count { background: #D4531A; color: #fff; }
    .navbar-light .nav-logout { border-color: #D4C8C0; color: #9A9A9A; }
    .navbar-light .nav-logout:hover { color: #D4531A; border-color: rgba(212,83,26,0.30); background: rgba(212,83,26,0.06); }

    /* ---- Admin layout ---- */
    .admin-layout { display: flex; min-height: 100vh; }
    .admin-main {
      margin-left: 240px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 100vh;
    }
    .admin-content {
      flex: 1;
      padding: 28px 32px;
      background: #EDE8E0;
    }

    @media (max-width: 768px) {
      .nav-inner { padding: 0 16px; }
      .nav-link span, .nav-cart span { display: none; }
      .admin-main { margin-left: 56px; }
      .admin-topbar { padding: 0 16px; }
      .admin-content { padding: 20px 16px; }
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  isAuthRoute(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/registrar');
  }

  isCardapioRoute(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/cardapio' || url === '/meus-pedidos' || url === '/carrinho';
  }

  isCozinhaRoute(): boolean {
    return this.router.url.includes('/cozinha');
  }

  get topbarUserName(): string {
    const u = this.auth.getUsuario();
    return u?.nome ?? u?.email?.split('@')[0] ?? '';
  }

  get currentSection(): string {
    const url = this.router.url;
    if (url.includes('/kanban'))                    return 'Pedidos';
    if (url.includes('/cozinha'))                   return 'Modo Cozinha';
    if (url.includes('/admin/pedidos'))             return 'Pedidos (legado)';
    if (url.includes('/cardapio/categorias'))       return 'Categorias';
    if (url.includes('/cardapio/pratos'))           return 'Pratos';
    if (url.includes('/cardapio/receitas'))         return 'Receitas';
    if (url.includes('/estoque/insumos'))           return 'Insumos';
    if (url.includes('/estoque/fornecedores'))      return 'Fornecedores';
    if (url.includes('/estoque/compras'))           return 'Compras';
    if (url.includes('/relatorios/financeiro'))     return 'Rel. Financeiro';
    if (url.includes('/relatorios/pedidos'))        return 'Rel. Pedidos';
    if (url.includes('/relatorios/cardapio'))       return 'Rel. Cardápio';
    if (url.includes('/relatorios/estoque'))        return 'Rel. Estoque';
    if (url.includes('/configuracoes/usuarios'))    return 'Usuários';
    if (url.includes('/overview'))                  return 'Overview';
    return 'Dashboard';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
