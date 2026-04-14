import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-estoque-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="section-tabs">
      <a routerLink="/admin/estoque/insumos" routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-cubes"></i> Insumos
      </a>
      <a routerLink="/admin/estoque/fornecedores" routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-truck"></i> Fornecedores
      </a>
      <a routerLink="/admin/estoque/compras" routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-shopping-bag"></i> Compras
      </a>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class EstoqueLayoutComponent {}
