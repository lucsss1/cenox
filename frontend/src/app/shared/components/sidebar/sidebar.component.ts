import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  roles?: string[];
  children: { label: string; icon: string; route: string; roles?: string[] }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">

      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-icon">
          <i class="fas fa-fire"></i>
        </div>
        <div class="brand-text">
          <span class="brand-name">Comanda</span>
          <span class="brand-sub">Digital</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">

        <!-- Overview -->
        <a routerLink="/admin/overview" routerLinkActive="active" class="nav-item" title="Overview">
          <i class="fas fa-chart-pie nav-icon"></i>
          <span class="nav-label">Overview</span>
        </a>

        <!-- Groups -->
        <ng-container *ngFor="let group of groups">
          <ng-container *ngIf="canShowGroup(group)">
            <div class="nav-section">
              <button
                class="nav-group-btn"
                [class.is-active]="isGroupActive(group.id)"
                [class.is-open]="openGroup === group.id"
                (click)="toggleGroup(group.id)"
                [title]="group.label">
                <i class="{{group.icon}} nav-icon"></i>
                <span class="nav-label">{{group.label}}</span>
                <i class="fas fa-chevron-right group-arrow"></i>
              </button>

              <div class="nav-sub" [class.expanded]="openGroup === group.id">
                <ng-container *ngFor="let child of group.children">
                  <a
                    *ngIf="canShowChild(child)"
                    [routerLink]="child.route"
                    routerLinkActive="active"
                    class="nav-sub-item"
                    [title]="child.label">
                    <i class="{{child.icon}}"></i>
                    <span>{{child.label}}</span>
                  </a>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </ng-container>

      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="user-info" *ngIf="userName">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{userName}}</span>
            <span class="user-role">{{userRole}}</span>
          </div>
        </div>

        <div class="footer-actions">
          <a routerLink="/cardapio" class="footer-btn" title="Voltar ao site">
            <i class="fas fa-globe"></i>
            <span>Ver site</span>
          </a>
          <button class="footer-btn footer-btn-danger" (click)="logout()" title="Sair">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>

    </aside>
  `,
  styles: [`
    /* ---- Layout ---- */
    .sidebar {
      width: 240px;
      background: #070707;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      border-right: 1px solid #171717;
      z-index: 50;
      overflow: hidden;
    }

    /* ---- Brand ---- */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 18px 16px;
      border-bottom: 1px solid #141414;
      flex-shrink: 0;
    }
    .brand-icon {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: rgba(220,38,38,0.15);
      border: 1px solid rgba(220,38,38,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-icon i { color: #DC2626; font-size: 14px; }
    .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
    .brand-name { font-size: 15px; font-weight: 700; color: #F3F4F6; }
    .brand-sub  { font-size: 10px; font-weight: 500; color: #4B5563; text-transform: uppercase; letter-spacing: 0.1em; }

    /* ---- Nav ---- */
    .sidebar-nav {
      flex: 1;
      padding: 10px 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-nav::-webkit-scrollbar { width: 0; }

    /* -- Nav item (top-level link) -- */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 9px 10px;
      border-radius: 8px;
      color: #4B5563;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.18s ease;
      border: 1px solid transparent;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-item:hover { background: rgba(255,255,255,0.03); color: #9CA3AF; }
    .nav-item.active {
      background: rgba(220,38,38,0.08);
      color: #F3F4F6;
      border-color: rgba(220,38,38,0.15);
    }
    .nav-item.active .nav-icon { color: #DC2626; }

    /* -- Group button -- */
    .nav-section { display: flex; flex-direction: column; }
    .nav-group-btn {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 9px 10px;
      border-radius: 8px;
      background: none;
      border: 1px solid transparent;
      color: #4B5563;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.18s ease;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-group-btn:hover { background: rgba(255,255,255,0.03); color: #9CA3AF; }
    .nav-group-btn.is-active {
      color: #D1D5DB;
    }
    .nav-group-btn.is-active .nav-icon { color: #DC2626; }

    .nav-icon { width: 16px; text-align: center; font-size: 13px; flex-shrink: 0; }
    .nav-label { flex: 1; }

    .group-arrow {
      font-size: 9px !important;
      width: auto !important;
      flex-shrink: 0;
      color: #2A2A2A;
      transition: transform 0.22s ease, color 0.18s ease;
    }
    .nav-group-btn.is-open .group-arrow {
      transform: rotate(90deg);
      color: #4B5563;
    }

    /* -- Sub-nav -- */
    .nav-sub {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.26s cubic-bezier(0.4, 0, 0.2, 1);
      padding-left: 12px;
    }
    .nav-sub.expanded { max-height: 320px; }

    .nav-sub-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 10px;
      border-radius: 7px;
      color: #374151;
      font-size: 12.5px;
      text-decoration: none;
      transition: all 0.18s ease;
      margin: 1px 0;
    }
    .nav-sub-item i { width: 14px; text-align: center; font-size: 12px; flex-shrink: 0; }
    .nav-sub-item:hover { background: rgba(255,255,255,0.03); color: #9CA3AF; }
    .nav-sub-item.active {
      background: rgba(220,38,38,0.07);
      color: #E5E7EB;
    }
    .nav-sub-item.active i { color: #DC2626; }

    /* ---- Footer ---- */
    .sidebar-footer {
      border-top: 1px solid #141414;
      padding: 12px 10px;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 8px;
      background: rgba(255,255,255,0.02);
      border: 1px solid #181818;
      margin-bottom: 8px;
    }
    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: rgba(220,38,38,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-avatar i { font-size: 12px; color: #DC2626; }
    .user-details { display: flex; flex-direction: column; min-width: 0; }
    .user-name { font-size: 12px; font-weight: 600; color: #D1D5DB; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 10px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.05em; }

    .footer-actions { display: flex; gap: 4px; }
    .footer-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 7px 10px;
      border-radius: 7px;
      background: none;
      border: 1px solid #1C1C1C;
      color: #4B5563;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.18s ease;
    }
    .footer-btn:hover { background: rgba(255,255,255,0.03); color: #9CA3AF; border-color: #282828; }
    .footer-btn-danger:hover { color: #FCA5A5; border-color: rgba(220,38,38,0.2); background: rgba(220,38,38,0.05); }

    /* ---- Mobile: icon-only ---- */
    @media (max-width: 768px) {
      .sidebar { width: 56px; }
      .brand-text,
      .nav-label,
      .group-arrow,
      .nav-sub-item span,
      .user-details,
      .footer-btn span { display: none; }
      .sidebar-brand { justify-content: center; padding: 16px 10px; }
      .nav-item, .nav-group-btn {
        justify-content: center;
        padding: 10px;
      }
      .nav-sub.expanded { max-height: 0; }
      .nav-sub-item { justify-content: center; }
      .footer-btn { justify-content: center; }
      .user-info { padding: 8px; justify-content: center; }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  openGroup: string | null = null;
  private sub: Subscription | null = null;

  groups: NavGroup[] = [
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: 'fas fa-clipboard-list',
      children: [
        { label: 'Lista',    icon: 'fas fa-list',    route: '/admin/pedidos' },
        { label: 'Kanban',   icon: 'fas fa-columns', route: '/admin/kanban' },
        { label: 'Cozinha',  icon: 'fas fa-fire',    route: '/admin/cozinha',
          roles: ['ADMIN','GERENTE','COZINHEIRO'] },
      ]
    },
    {
      id: 'cardapio',
      label: 'Cardápio',
      icon: 'fas fa-utensils',
      roles: ['ADMIN','GERENTE'],
      children: [
        { label: 'Categorias', icon: 'fas fa-tags',      route: '/admin/cardapio/categorias' },
        { label: 'Pratos',     icon: 'fas fa-hamburger', route: '/admin/cardapio/pratos' },
        { label: 'Receitas',   icon: 'fas fa-book-open', route: '/admin/cardapio/receitas' },
      ]
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: 'fas fa-boxes',
      roles: ['ADMIN','GERENTE'],
      children: [
        { label: 'Insumos',      icon: 'fas fa-cubes',       route: '/admin/estoque/insumos' },
        { label: 'Fornecedores', icon: 'fas fa-truck',       route: '/admin/estoque/fornecedores' },
        { label: 'Compras',      icon: 'fas fa-shopping-bag',route: '/admin/estoque/compras' },
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: 'fas fa-chart-bar',
      roles: ['ADMIN','GERENTE'],
      children: [
        { label: 'Financeiro', icon: 'fas fa-dollar-sign', route: '/admin/relatorios/financeiro' },
        { label: 'Pedidos',    icon: 'fas fa-clock',       route: '/admin/relatorios/pedidos' },
        { label: 'Cardápio',   icon: 'fas fa-utensils',    route: '/admin/relatorios/cardapio' },
        { label: 'Estoque',    icon: 'fas fa-boxes',       route: '/admin/relatorios/estoque' },
      ]
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: 'fas fa-cog',
      roles: ['ADMIN'],
      children: [
        { label: 'Usuários', icon: 'fas fa-users', route: '/admin/configuracoes/usuarios' },
      ]
    },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  get userName(): string {
    const u = this.auth.getUsuario();
    return u?.nome ?? u?.email?.split('@')[0] ?? '';
  }

  get userRole(): string {
    const u = this.auth.getUsuario();
    return u?.perfil ?? '';
  }

  ngOnInit(): void {
    this.syncGroup(this.router.url);
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this.syncGroup(e.urlAfterRedirects ?? e.url));
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private syncGroup(url: string): void {
    const found = this.groups.find(g => url.includes('/admin/' + g.id));
    if (found) this.openGroup = found.id;
    else if (url.includes('/admin/pedidos') || url.includes('/admin/kanban') || url.includes('/admin/cozinha')) {
      this.openGroup = 'pedidos';
    }
  }

  toggleGroup(id: string): void {
    this.openGroup = this.openGroup === id ? null : id;
  }

  isGroupActive(id: string): boolean {
    return this.router.url.includes('/admin/' + id) ||
      (id === 'pedidos' && (
        this.router.url.includes('/admin/pedidos') ||
        this.router.url.includes('/admin/kanban') ||
        this.router.url.includes('/admin/cozinha')
      ));
  }

  canShowGroup(group: NavGroup): boolean {
    if (!group.roles) return true;
    return this.auth.hasAnyRole(group.roles);
  }

  canShowChild(child: { roles?: string[] }): boolean {
    if (!child.roles) return true;
    return this.auth.hasAnyRole(child.roles);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
