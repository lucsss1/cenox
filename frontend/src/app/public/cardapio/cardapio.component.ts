import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Prato, Categoria } from '../../shared/models/models';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cardapio">
      <div class="cardapio-header">
        <h1><i class="fas fa-fire"></i> Nosso Cardapio</h1>
        <p>Escolha seus pratos favoritos</p>
      </div>

      <div class="categorias-filter">
        <button class="filter-btn" [class.active]="!categoriaSelecionada" (click)="filtrar(null)">Todos</button>
        <button class="filter-btn" *ngFor="let cat of categorias"
          [class.active]="categoriaSelecionada === cat.id" (click)="filtrar(cat.id)">
          {{cat.nome}}
        </button>
      </div>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

      <div class="pratos-grid" *ngIf="!loading">
        <div class="prato-card" *ngFor="let prato of pratos">
          <div class="prato-img">
            <i class="fas fa-hamburger"></i>
          </div>
          <div class="prato-info">
            <span class="prato-categoria">{{prato.categoriaNome}}</span>
            <h3>{{prato.nome}}</h3>
            <p class="prato-desc">{{prato.descricao || 'Delicioso prato do nosso cardapio'}}</p>
            <div class="prato-footer">
              <span class="prato-preco">R$ {{prato.precoVenda | number:'1.2-2'}}</span>
              <button class="btn btn-primary btn-sm" (click)="addCarrinho(prato)" *ngIf="auth.isLoggedIn()">
                <i class="fas fa-plus"></i> Adicionar
              </button>
              <a routerLink="/login" class="btn btn-primary btn-sm" *ngIf="!auth.isLoggedIn()">
                <i class="fas fa-sign-in-alt"></i> Entrar para pedir
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregarPagina(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let p of pages" (click)="carregarPagina(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregarPagina(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
      </div>

      <div *ngIf="!loading && pratos.length === 0" class="empty-state">
        <i class="fas fa-utensils"></i>
        <p>Nenhum prato disponivel no momento.</p>
      </div>
    </div>
  `,
  styles: [`
    .cardapio-header { text-align: center; padding: 30px 0 24px; }
    .cardapio-header h1 { font-size: 30px; color: #F9FAFB; font-weight: 700; }
    .cardapio-header h1 i { color: #DC2626; }
    .cardapio-header p { color: #6B7280; margin-top: 6px; font-size: 15px; }
    .categorias-filter { display: flex; gap: 8px; justify-content: center; margin-bottom: 28px; flex-wrap: wrap; }
    .filter-btn {
      padding: 8px 20px; border: 1px solid #333; background: #1A1A1A;
      border-radius: 24px; cursor: pointer; font-size: 13px; color: #9CA3AF;
      transition: all 0.2s; font-weight: 500;
    }
    .filter-btn:hover { border-color: #DC2626; color: #F9FAFB; }
    .filter-btn.active { background: #DC2626; color: white; border-color: #DC2626; box-shadow: 0 0 15px rgba(220,38,38,0.3); }
    .pratos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .prato-card {
      background: #1A1A1A; border-radius: 14px; overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: all 0.3s;
      border: 1px solid #222;
    }
    .prato-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(220,38,38,0.15); border-color: #333; }
    .prato-img {
      height: 150px; background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 50%, #0A0A0A 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .prato-img i { font-size: 48px; color: rgba(255,255,255,0.25); }
    .prato-info { padding: 18px; }
    .prato-categoria { font-size: 11px; color: #DC2626; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .prato-info h3 { font-size: 17px; margin: 6px 0; color: #F3F4F6; }
    .prato-desc { font-size: 13px; color: #6B7280; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .prato-footer { display: flex; justify-content: space-between; align-items: center; }
    .prato-preco { font-size: 20px; font-weight: 700; color: #4ADE80; }
    .empty-state { text-align: center; padding: 60px 20px; color: #6B7280; }
    .empty-state i { font-size: 48px; margin-bottom: 12px; color: #333; display: block; }
  `]
})
export class CardapioComponent implements OnInit {
  pratos: Prato[] = [];
  categorias: Categoria[] = [];
  categoriaSelecionada: number | null = null;
  loading = true;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.api.getCategoriasPublico().subscribe(cats => this.categorias = cats);
    this.carregarCardapio();
  }

  carregarCardapio(): void {
    this.loading = true;
    const obs = this.categoriaSelecionada
      ? this.api.getCardapioCategoria(this.categoriaSelecionada, this.currentPage)
      : this.api.getCardapio(this.currentPage);

    obs.subscribe({
      next: (page) => {
        this.pratos = page.content;
        this.totalPages = page.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filtrar(categoriaId: number | null): void {
    this.categoriaSelecionada = categoriaId;
    this.currentPage = 0;
    this.carregarCardapio();
  }

  carregarPagina(page: number): void {
    this.currentPage = page;
    this.carregarCardapio();
  }

  addCarrinho(prato: Prato): void {
    this.auth.addToCart(prato);
    this.toast.success(prato.nome + ' adicionado ao carrinho!');
  }
}
