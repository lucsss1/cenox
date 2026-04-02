import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  styleUrls: ['./sidebar.component.css'],
  template: `
    <aside class="sidebar">

      <!-- ── Brand ── -->
      <div class="sidebar-brand">
        <div class="brand-mark">C</div>
        <div class="brand-text">
          <span class="brand-name">CENOX</span>
          <span class="brand-sub">Dark Kitchen</span>
        </div>
      </div>

      <!-- ── Navigation ── -->
      <nav class="sidebar-nav" aria-label="Menu principal">

        <!-- ── Zona diária: sempre visível para todos ── -->
        <a routerLink="/admin/overview"
           routerLinkActive="nav-link--active"
           class="nav-link"
           title="Visão Geral">
          <i class="fas fa-chart-pie nav-icon"></i>
          <span>Visão Geral</span>
        </a>

        <a routerLink="/admin/kanban"
           routerLinkActive="nav-link--active"
           class="nav-link"
           title="Pedidos">
          <i class="fas fa-fire nav-icon"></i>
          <span>Pedidos</span>
        </a>

        <a routerLink="/admin/cozinha"
           routerLinkActive="nav-link--active"
           class="nav-link"
           *ngIf="auth.hasAnyRole(['ADMIN','GERENTE','COZINHEIRO'])"
           title="Cozinha">
          <i class="fas fa-utensils nav-icon"></i>
          <span>Cozinha</span>
        </a>

        <!-- ── Zona de gestão: Admin / Gerente ── -->
        <ng-container *ngIf="auth.hasAnyRole(['ADMIN','GERENTE'])">

          <div class="nav-divider" aria-hidden="true"></div>

          <!-- Cardápio group -->
          <button class="nav-group-btn"
                  [class.active]="isGroupActive('cardapio')"
                  (click)="toggleGroup('cardapio')"
                  [attr.aria-expanded]="openGroup === 'cardapio'">
            <i class="fas fa-hamburger nav-icon"></i>
            <span>Cardápio</span>
            <i class="fas fa-chevron-right nav-chevron"
               [class.open]="openGroup === 'cardapio'"></i>
          </button>
          <div class="nav-group-children" [class.expanded]="openGroup === 'cardapio'">
            <a routerLink="/admin/cardapio/pratos"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-hamburger nav-icon"></i><span>Pratos</span>
            </a>
            <a routerLink="/admin/cardapio/categorias"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-tags nav-icon"></i><span>Categorias</span>
            </a>
            <a routerLink="/admin/cardapio/receitas"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-book-open nav-icon"></i><span>Receitas</span>
            </a>
          </div>

          <!-- Estoque group -->
          <button class="nav-group-btn"
                  [class.active]="isGroupActive('estoque')"
                  (click)="toggleGroup('estoque')"
                  [attr.aria-expanded]="openGroup === 'estoque'">
            <i class="fas fa-cubes nav-icon"></i>
            <span>Estoque</span>
            <i class="fas fa-chevron-right nav-chevron"
               [class.open]="openGroup === 'estoque'"></i>
          </button>
          <div class="nav-group-children" [class.expanded]="openGroup === 'estoque'">
            <a routerLink="/admin/estoque/insumos"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-cubes nav-icon"></i><span>Insumos</span>
            </a>
            <a routerLink="/admin/estoque/fornecedores"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-truck nav-icon"></i><span>Fornecedores</span>
            </a>
            <a routerLink="/admin/estoque/compras"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-shopping-bag nav-icon"></i><span>Compras</span>
            </a>
          </div>

          <!-- Relatórios group -->
          <button class="nav-group-btn"
                  [class.active]="isGroupActive('relatorios')"
                  (click)="toggleGroup('relatorios')"
                  [attr.aria-expanded]="openGroup === 'relatorios'">
            <i class="fas fa-chart-bar nav-icon"></i>
            <span>Relatórios</span>
            <i class="fas fa-chevron-right nav-chevron"
               [class.open]="openGroup === 'relatorios'"></i>
          </button>
          <div class="nav-group-children" [class.expanded]="openGroup === 'relatorios'">
            <a routerLink="/admin/relatorios/financeiro"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-dollar-sign nav-icon"></i><span>Financeiro</span>
            </a>
            <a routerLink="/admin/relatorios/pedidos"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-clock nav-icon"></i><span>Pedidos</span>
            </a>
            <a routerLink="/admin/relatorios/estoque"
               routerLinkActive="nav-link--active"
               class="nav-link nav-link--child">
              <i class="fas fa-boxes nav-icon"></i><span>Estoque</span>
            </a>
          </div>

        </ng-container>

        <!-- ── Sistema: Admin only ── -->
        <ng-container *ngIf="auth.hasRole('ADMIN')">
          <div class="nav-divider" aria-hidden="true"></div>
          <a routerLink="/admin/configuracoes/usuarios"
             routerLinkActive="nav-link--active"
             class="nav-link"
             title="Usuários">
            <i class="fas fa-users nav-icon"></i>
            <span>Usuários</span>
          </a>
        </ng-container>

      </nav>

      <!-- ── Footer ── -->
      <div class="sidebar-footer">
        <div class="user-card" *ngIf="userName">
          <div class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <span class="user-name">{{userName}}</span>
            <span class="user-role">{{userRole}}</span>
          </div>
        </div>
        <div class="footer-row">
          <a routerLink="/cardapio" class="footer-btn" title="Ver cardápio público">
            <i class="fas fa-globe"></i>
            <span>Ver site</span>
          </a>
          <button class="footer-btn footer-btn--danger" (click)="logout()" title="Sair">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>

    </aside>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  openGroup: string | null = null;
  private sub: Subscription | null = null;

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
    if (url.includes('/admin/cardapio'))   this.openGroup = 'cardapio';
    else if (url.includes('/admin/estoque'))    this.openGroup = 'estoque';
    else if (url.includes('/admin/relatorios')) this.openGroup = 'relatorios';
    else this.openGroup = null;
  }

  toggleGroup(id: string): void {
    this.openGroup = this.openGroup === id ? null : id;
  }

  isGroupActive(id: string): boolean {
    return this.router.url.includes('/admin/' + id);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
