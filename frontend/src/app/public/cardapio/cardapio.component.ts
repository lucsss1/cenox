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
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <span class="hero-badge"><i class="fas fa-fire"></i> MENU DIGITAL</span>
          <h1>Nosso <span class="text-red">Cardapio</span></h1>
          <p class="hero-sub">Escolha seus pratos favoritos</p>
          <div class="hero-line"></div>
        </div>
      </div>

      <!-- Category Filters -->
      <div class="categorias-filter">
        <button class="filter-pill" [class.active]="!categoriaSelecionada" (click)="filtrar(null)">Todos</button>
        <button class="filter-pill" *ngFor="let cat of categorias"
          [class.active]="categoriaSelecionada === cat.id" (click)="filtrar(cat.id)">
          {{cat.nome}}
        </button>
      </div>

      <div class="divider"></div>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

      <!-- Dishes Grid -->
      <div class="pratos-grid" *ngIf="!loading && pratos.length > 0">
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

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregarPagina(currentPage - 1)" [disabled]="currentPage === 0">&laquo; Anterior</button>
        <button *ngFor="let p of pages" (click)="carregarPagina(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregarPagina(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo &raquo;</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && pratos.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-utensils"></i>
        </div>
        <h3>Nenhum prato disponivel</h3>
        <p>Nosso cardapio esta sendo preparado com carinho. Em breve novos pratos estarao disponiveis para voce.</p>
        <span class="empty-hint"><i class="far fa-clock"></i> Volte em breve</span>
        <br>
        <button class="btn btn-secondary" style="margin-top:16px;" (click)="filtrar(null)">Explorar Categorias</button>
      </div>
    </div>
  `,
  styles: [`
    .cardapio { padding-bottom: 40px; }

    /* Hero */
    .hero-section {
      text-align: center; padding: 50px 20px 30px; position: relative;
      overflow: hidden; margin: -20px -20px 0;
    }
    .hero-glow {
      position: absolute; top: 0; left: 0; right: 0; height: 120px;
      background: linear-gradient(180deg, rgba(220,38,38,0.12) 0%, transparent 100%);
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; border-radius: 20px;
      border: 1px solid rgba(220,38,38,0.3); background: rgba(220,38,38,0.06);
      color: #DC2626; font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; margin-bottom: 16px;
    }
    .hero-badge i { font-size: 12px; }
    .hero-section h1 {
      font-size: 42px; font-weight: 800; color: #F9FAFB;
      line-height: 1.1; margin-bottom: 8px;
    }
    .text-red { color: #DC2626; text-decoration: underline; text-decoration-color: #DC2626; text-underline-offset: 6px; }
    .hero-sub { color: #6B7280; font-size: 15px; }
    .hero-line {
      width: 40px; height: 3px; background: #DC2626;
      margin: 20px auto 0; border-radius: 2px;
    }

    /* Category Filters */
    .categorias-filter {
      display: flex; gap: 10px; justify-content: center;
      margin: 28px 0 20px; flex-wrap: wrap;
    }
    .filter-pill {
      padding: 9px 22px; border: 1px solid #2A2A2A; background: transparent;
      border-radius: 24px; cursor: pointer; font-size: 13px; color: #9CA3AF;
      transition: all 0.2s; font-weight: 500; font-family: 'Inter', sans-serif;
    }
    .filter-pill:hover { border-color: #444; color: #E5E7EB; }
    .filter-pill.active {
      background: #DC2626; color: white; border-color: #DC2626;
      box-shadow: 0 0 20px rgba(220,38,38,0.25);
    }

    .divider {
      height: 1px; background: #1F1F1F; margin: 0 0 28px;
    }

    /* Dishes Grid */
    .pratos-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .prato-card {
      background: #141414; border-radius: 14px; overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2); transition: all 0.3s;
      border: 1px solid #1F1F1F;
    }
    .prato-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(220,38,38,0.1);
      border-color: #2A2A2A;
    }
    .prato-img {
      height: 150px;
      background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 50%, #0A0A0A 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .prato-img i { font-size: 48px; color: rgba(255,255,255,0.2); }
    .prato-info { padding: 18px; }
    .prato-categoria {
      font-size: 10px; color: #DC2626; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .prato-info h3 { font-size: 16px; margin: 6px 0; color: #F3F4F6; font-weight: 600; }
    .prato-desc {
      font-size: 13px; color: #6B7280; margin-bottom: 14px;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;
    }
    .prato-footer { display: flex; justify-content: space-between; align-items: center; }
    .prato-preco { font-size: 20px; font-weight: 700; color: #4ADE80; }
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
