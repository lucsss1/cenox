import { Component } from '@angular/core';
import { RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-relatorios-layout',
  standalone: true,
  imports: [RouterModule, RouterLinkActive],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-chart-bar"></i> Relatórios</h2>
        <p class="page-subtitle">Análise detalhada de desempenho</p>
      </div>
    </div>

    <div class="section-tabs">
      <a routerLink="financeiro"   routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-dollar-sign"></i> Financeiro
      </a>
      <a routerLink="pedidos"      routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-clipboard-list"></i> Pedidos
      </a>
      <a routerLink="cardapio"     routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-utensils"></i> Cardápio
      </a>
      <a routerLink="estoque"      routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-boxes"></i> Estoque
      </a>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: []
})
export class RelatoriosLayoutComponent {}
