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
    <div class="cardapio-page">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-bg"></div>
        <div class="hero-inner">
          <span class="hero-chip">
            <i class="fas fa-fire"></i> Menu Digital
          </span>
          <h1>Nosso <em>Cardápio</em></h1>
          <p>Escolha seus pratos favoritos e faça seu pedido</p>
        </div>
      </div>

      <!-- Category tabs -->
      <div class="category-bar">
        <div class="category-scroll">
          <button class="cat-tab" [class.active]="!categoriaSelecionada" (click)="filtrar(null)">
            <i class="fas fa-th-large"></i> Todos
          </button>
          <button class="cat-tab" *ngFor="let cat of categorias"
            [class.active]="categoriaSelecionada === cat.id"
            (click)="filtrar(cat.id)">
            {{cat.nome}}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <!-- Grid -->
      <div class="pratos-grid" *ngIf="!loading && pratos.length > 0">
        <div class="prato-card" *ngFor="let prato of pratos">
          <div class="prato-img">
            <div class="prato-img-icon">
              <i class="fas fa-utensils"></i>
            </div>
            <div class="prato-cat-badge">{{prato.categoriaNome}}</div>
          </div>
          <div class="prato-body">
            <h3>{{prato.nome}}</h3>
            <p class="prato-desc">{{prato.descricao || 'Delicioso prato preparado com ingredientes selecionados.'}}</p>
            <div class="prato-footer">
              <span class="prato-price">R$&nbsp;{{prato.precoVenda | number:'1.2-2'}}</span>
              <ng-container *ngIf="auth.isLoggedIn(); else loginBtn">
                <button class="add-btn" (click)="addCarrinho(prato)">
                  <i class="fas fa-plus"></i>
                  <span>Adicionar</span>
                </button>
              </ng-container>
              <ng-template #loginBtn>
                <a routerLink="/login" class="add-btn add-btn-outline">
                  <i class="fas fa-sign-in-alt"></i>
                  <span>Entrar</span>
                </a>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!loading && pratos.length === 0">
        <div class="empty-state-icon">
          <i class="fas fa-utensils"></i>
        </div>
        <h3>Nenhum prato disponível</h3>
        <p>Nosso cardápio está sendo preparado com carinho. Em breve novos pratos estarão disponíveis.</p>
        <span class="empty-hint"><i class="far fa-clock"></i>&nbsp; Volte em breve</span>
        <br>
        <button class="btn btn-ghost" style="margin-top:20px;" (click)="filtrar(null)">
          <i class="fas fa-th-large"></i> Ver todos
        </button>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <span class="pagination-info">Página {{currentPage + 1}} de {{totalPages}}</span>
        <button (click)="carregarPagina(currentPage - 1)" [disabled]="currentPage === 0">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button *ngFor="let p of pages" (click)="carregarPagina(p)" [class.active]="p === currentPage">
          {{p + 1}}
        </button>
        <button (click)="carregarPagina(currentPage + 1)" [disabled]="currentPage === totalPages - 1">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

    </div>
  `,
  styles: [`
    .cardapio-page { padding-bottom: 48px; }

    /* ---- Hero ---- */
    .hero {
      position: relative;
      overflow: hidden;
      padding: 52px 24px 40px;
      margin: -24px -24px 0;
      text-align: center;
    }
    .hero-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,38,38,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-inner { position: relative; z-index: 1; }

    .hero-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 16px;
      border-radius: 20px;
      border: 1px solid rgba(220,38,38,0.25);
      background: rgba(220,38,38,0.07);
      color: #DC2626;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .hero h1 {
      font-size: 40px;
      font-weight: 800;
      color: #F3F4F6;
      line-height: 1.1;
      margin-bottom: 10px;
    }
    .hero h1 em {
      font-style: normal;
      color: #DC2626;
      text-decoration: underline;
      text-decoration-color: rgba(220,38,38,0.4);
      text-underline-offset: 6px;
    }
    .hero p { font-size: 15px; color: #6B7280; }

    /* ---- Category bar ---- */
    .category-bar {
      margin: 28px 0 24px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .category-bar::-webkit-scrollbar { display: none; }

    .category-scroll {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
      padding: 0 4px;
    }

    .cat-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      border: 1px solid #222;
      border-radius: 24px;
      background: transparent;
      color: #6B7280;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
      font-family: inherit;
    }
    .cat-tab:hover { border-color: #333; color: #D1D5DB; }
    .cat-tab.active {
      background: #DC2626;
      border-color: #DC2626;
      color: white;
      box-shadow: 0 0 16px rgba(220,38,38,0.22);
    }

    /* ---- Grid ---- */
    .pratos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }

    /* ---- Dish card ---- */
    .prato-card {
      background: #111;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #1A1A1A;
      transition: all 0.22s ease;
    }
    .prato-card:hover {
      transform: translateY(-3px);
      border-color: #242424;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(220,38,38,0.06);
    }

    .prato-img {
      height: 140px;
      background: linear-gradient(145deg, #1A0A0A 0%, #0D0D0D 50%, #0A0A10 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .prato-img::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 30% 30%, rgba(220,38,38,0.06) 0%, transparent 60%);
    }
    .prato-img-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(220,38,38,0.08);
      border: 1px solid rgba(220,38,38,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .prato-img-icon i { font-size: 22px; color: rgba(220,38,38,0.5); }

    .prato-cat-badge {
      position: absolute;
      bottom: 10px;
      left: 10px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #DC2626;
      background: rgba(220,38,38,0.08);
      border: 1px solid rgba(220,38,38,0.15);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .prato-body { padding: 16px; }
    .prato-body h3 { font-size: 15px; font-weight: 600; color: #F3F4F6; margin-bottom: 6px; }

    .prato-desc {
      font-size: 12.5px;
      color: #6B7280;
      line-height: 1.5;
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .prato-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .prato-price {
      font-size: 18px;
      font-weight: 700;
      color: #4ADE80;
      letter-spacing: -0.3px;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #DC2626;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      text-decoration: none;
      font-family: inherit;
    }
    .add-btn:hover { background: #B91C1C; box-shadow: 0 0 16px rgba(220,38,38,0.3); }
    .add-btn i { font-size: 11px; }

    .add-btn-outline {
      background: transparent;
      border: 1px solid #DC2626;
      color: #DC2626;
    }
    .add-btn-outline:hover { background: #DC2626; color: white; }

    /* ---- Responsive ---- */
    @media (max-width: 640px) {
      .hero { padding: 36px 16px 28px; margin: -24px -16px 0; }
      .hero h1 { font-size: 30px; }
      .pratos-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    }
    @media (max-width: 420px) {
      .pratos-grid { grid-template-columns: 1fr; }
    }
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
