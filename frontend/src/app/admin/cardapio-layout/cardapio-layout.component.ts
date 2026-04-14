import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-cardapio-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="section-tabs">
      <a routerLink="/admin/cardapio/categorias" routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-tags"></i> Categorias
      </a>
      <a routerLink="/admin/cardapio/pratos" routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-hamburger"></i> Pratos
      </a>
      <a routerLink="/admin/cardapio/receitas" routerLinkActive="tab-active" class="section-tab">
        <i class="fas fa-book-open"></i> Receitas
      </a>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class CardapioLayoutComponent {}
