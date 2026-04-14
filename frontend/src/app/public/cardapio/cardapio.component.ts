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

      <!-- ── Hero ── -->
      <div class="hero">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>

        <!-- Floating food decorations (purely decorative) -->
        <span class="food-float f1" aria-hidden="true">🍕</span>
        <span class="food-float f2" aria-hidden="true">🍔</span>
        <span class="food-float f3" aria-hidden="true">🥗</span>
        <span class="food-float f4" aria-hidden="true">🍰</span>
        <span class="food-float f5" aria-hidden="true">☕</span>
        <span class="food-float f6" aria-hidden="true">🌮</span>
        <span class="food-float f7" aria-hidden="true">🍜</span>

        <div class="hero-inner">
          <span class="hero-chip">
            <i class="fas fa-fire"></i> Menu Digital
          </span>
          <h1>Nosso <em>Cardápio</em></h1>
          <p>Pratos preparados com carinho. Peça agora.</p>
        </div>

        <div class="hero-showcase" aria-hidden="true">
          <div class="showcase-ring">
            <span class="showcase-emoji">🍽️</span>
          </div>
          <div class="showcase-orbit">
            <span class="orbit-item oi-1">🍕</span>
            <span class="orbit-item oi-2">🍔</span>
            <span class="orbit-item oi-3">🥗</span>
            <span class="orbit-item oi-4">🍰</span>
          </div>
        </div>
      </div>

      <!-- ── Category pills ── -->
      <div class="category-bar">
        <div class="category-scroll">
          <button class="cat-pill" [class.active]="!categoriaSelecionada" (click)="filtrar(null)">
            🍽️ Todos
          </button>
          <button class="cat-pill" *ngFor="let cat of categorias"
            [class.active]="categoriaSelecionada === cat.id"
            (click)="filtrar(cat.id)">
            {{getCatEmoji(cat.nome)}} {{cat.nome}}
          </button>
        </div>
      </div>

      <!-- ── Skeleton ── -->
      <div class="pratos-grid" *ngIf="loading" aria-busy="true" aria-label="Carregando cardápio...">
        <div class="prato-skeleton" *ngFor="let i of [1,2,3,4,5,6]">
          <div class="skel-img"></div>
          <div class="skel-body">
            <div class="skel-line skel-cat"></div>
            <div class="skel-line skel-title"></div>
            <div class="skel-line skel-desc"></div>
            <div class="skel-line skel-desc skel-short"></div>
            <div class="skel-row">
              <div class="skel-line skel-price"></div>
              <div class="skel-line skel-btn"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Error state ── -->
      <div class="state-box" *ngIf="hasError && !loading" role="alert">
        <div class="state-icon error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Falha ao carregar</h3>
        <p>Não foi possível buscar os pratos. Verifique sua conexão e tente novamente.</p>
        <button class="ghost-btn" (click)="carregarCardapio()">
          <i class="fas fa-redo"></i> Tentar novamente
        </button>
      </div>

      <!-- ── Grid ── -->
      <div class="pratos-grid" *ngIf="!loading && !hasError && pratos.length > 0">
        <div class="prato-card" *ngFor="let prato of pratos; let i = index"
             [style.animation-delay.ms]="i * 55">

          <!-- Card image / food visual -->
          <div class="prato-img" [style.background]="getTheme(prato.categoriaNome).gradient">
            <span class="prato-bg-emoji" aria-hidden="true">{{getTheme(prato.categoriaNome).emoji}}</span>
            <div class="prato-emoji-wrap">
              <span class="prato-main-emoji">{{getTheme(prato.categoriaNome).emoji}}</span>
            </div>
            <span class="prato-cat-badge">{{prato.categoriaNome}}</span>
          </div>

          <div class="prato-body">
            <h3 class="prato-name">{{prato.nome}}</h3>
            <p class="prato-desc">{{prato.descricao || 'Delicioso prato preparado com ingredientes selecionados.'}}</p>
            <div class="prato-footer">
              <span class="prato-price">R$&nbsp;{{prato.precoVenda | number:'1.2-2'}}</span>
              <ng-container *ngIf="auth.isLoggedIn(); else loginBtn">
                <button class="add-btn" (click)="addCarrinho(prato)">
                  <i class="fas fa-plus"></i> Adicionar
                </button>
              </ng-container>
              <ng-template #loginBtn>
                <a routerLink="/login" class="add-btn add-btn-ghost">
                  <i class="fas fa-sign-in-alt"></i> Entrar
                </a>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Empty state ── -->
      <div class="state-box" *ngIf="!loading && !hasError && pratos.length === 0">
        <div class="state-icon">
          <span style="font-size:36px;">🍽️</span>
        </div>
        <h3>Nenhum prato disponível</h3>
        <p>Nosso cardápio está sendo preparado com carinho. Em breve novos pratos estarão disponíveis.</p>
        <button class="ghost-btn" (click)="filtrar(null)">
          🍽️ Ver todos
        </button>
      </div>

      <!-- ── Pagination ── -->
      <div class="pagination" *ngIf="totalPages > 1">
        <span class="page-info">Página {{currentPage + 1}} de {{totalPages}}</span>
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
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    :host {
      --brand:        #D4531A;
      --brand-hover:  #B84412;
      --brand-shadow: rgba(212, 83, 26, 0.28);
      --brand-subtle: rgba(212, 83, 26, 0.08);
      --brand-muted:  rgba(212, 83, 26, 0.18);
      --page-bg:      #EDE8E0;
      --card-bg:      #FFFFFF;
      --input-bg:     #F5F0EB;
      --text-dark:    #1A1A1A;
      --text-body:    #4A4A4A;
      --text-muted:   #9A9A9A;
      --border:       #E0D8D0;
      font-family: 'Poppins', sans-serif;
      display: block;
    }

    /* ── Animations ──────────────────────────────── */
    @keyframes cardIn {
      from { transform: translateY(18px) scale(0.97); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -800px 0; }
      100% { background-position:  800px 0; }
    }
    @keyframes floatA {
      0%, 100% { transform: translateY(0)    rotate(0deg);  }
      33%       { transform: translateY(-14px) rotate(6deg);  }
      66%       { transform: translateY(-6px)  rotate(-4deg); }
    }
    @keyframes floatB {
      0%, 100% { transform: translateY(0)    rotate(-3deg); }
      50%       { transform: translateY(-18px) rotate(5deg);  }
    }
    @keyframes floatC {
      0%, 100% { transform: translateY(0)    rotate(2deg);  }
      40%       { transform: translateY(-10px) rotate(-6deg); }
      70%       { transform: translateY(-20px) rotate(3deg);  }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
    }
    @keyframes orbitReverse {
      from { transform: rotate(0deg) translateX(52px) rotate(0deg); }
      to   { transform: rotate(-360deg) translateX(52px) rotate(360deg); }
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.2); }
      50%       { transform: scale(1.04); box-shadow: 0 0 0 12px rgba(255,255,255,0); }
    }

    /* ── Page wrapper ────────────────────────────── */
    .cardapio-page {
      min-height: calc(100vh - 58px);
      background: var(--page-bg);
      font-family: 'Poppins', sans-serif;
      padding-bottom: 64px;
    }

    /* ── Hero ────────────────────────────────────── */
    .hero {
      background: linear-gradient(135deg, #B83E0E 0%, #D4531A 45%, #E8763A 80%, #EDE8E0 100%);
      padding: 56px 48px 52px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      min-height: 260px;
    }

    .blob { position: absolute; border-radius: 50%; pointer-events: none; }
    .blob-1 { width: 300px; height: 300px; background: rgba(184,62,14,0.25); top: -120px; right: 80px; }
    .blob-2 { width: 180px; height: 180px; background: rgba(255,255,255,0.08); bottom: -70px; left: 5%; }
    .blob-3 { width: 90px;  height: 90px;  background: rgba(255,255,255,0.06); top: 20px; left: 38%; }

    /* Floating food emojis */
    .food-float {
      position: absolute;
      pointer-events: none;
      user-select: none;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
      z-index: 2;
      line-height: 1;
    }
    .f1 { font-size: 34px; top: 18%; left: 9%;  animation: floatA 3.4s ease-in-out infinite; opacity: 0.80; }
    .f2 { font-size: 26px; top: 55%; left: 18%; animation: floatB 4.1s ease-in-out infinite 0.4s; opacity: 0.65; }
    .f3 { font-size: 28px; bottom: 12%; left: 32%; animation: floatC 5.0s ease-in-out infinite 0.9s; opacity: 0.60; }
    .f4 { font-size: 22px; top: 10%; right: 28%; animation: floatB 3.8s ease-in-out infinite 0.2s; opacity: 0.55; }
    .f5 { font-size: 24px; bottom: 18%; right: 38%; animation: floatA 4.5s ease-in-out infinite 1.1s; opacity: 0.60; }
    .f6 { font-size: 20px; top: 60%; right: 26%; animation: floatC 3.6s ease-in-out infinite 0.6s; opacity: 0.50; }
    .f7 { font-size: 18px; top: 28%; left: 28%; animation: floatB 4.8s ease-in-out infinite 1.4s; opacity: 0.45; }

    .hero-inner { position: relative; z-index: 3; }

    .hero-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 16px;
      border-radius: 50px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.30);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .hero h1 {
      font-size: 46px;
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
      margin: 0 0 12px;
      font-family: 'Poppins', sans-serif;
    }
    .hero h1 em {
      font-style: normal;
      text-decoration: underline;
      text-decoration-color: rgba(255,255,255,0.38);
      text-underline-offset: 6px;
    }
    .hero p { font-size: 15px; color: rgba(255,255,255,0.72); margin: 0; }

    /* Hero orbiting showcase */
    .hero-showcase {
      position: relative; z-index: 3;
      flex-shrink: 0;
      width: 140px; height: 140px;
      display: flex; align-items: center; justify-content: center;
    }
    .showcase-ring {
      width: 96px; height: 96px;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.28);
      display: flex; align-items: center; justify-content: center;
      animation: ringPulse 3s ease-in-out infinite;
    }
    .showcase-emoji { font-size: 44px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2)); line-height: 1; }

    .showcase-orbit {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .orbit-item {
      position: absolute;
      font-size: 20px;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
    }
    .oi-1 { animation: orbit         8s linear infinite;       }
    .oi-2 { animation: orbit         8s linear infinite -2s;   }
    .oi-3 { animation: orbitReverse  8s linear infinite -4s;   }
    .oi-4 { animation: orbitReverse  8s linear infinite -6s;   }

    /* ── Category bar ────────────────────────────── */
    .category-bar {
      padding: 28px 40px 0;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .category-bar::-webkit-scrollbar { display: none; }
    .category-scroll { display: flex; gap: 8px; flex-wrap: wrap; }

    .cat-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 22px; height: 44px;
      border: 1.5px solid var(--border);
      border-radius: 50px;
      background: var(--card-bg);
      color: var(--text-muted);
      font-size: 13px; font-weight: 500;
      font-family: 'Poppins', sans-serif;
      cursor: pointer; white-space: nowrap;
      transition: all 0.18s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .cat-pill:hover {
      border-color: var(--brand-muted);
      color: var(--brand);
      background: var(--brand-subtle);
    }
    .cat-pill.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
      box-shadow: 0 4px 12px var(--brand-shadow);
    }

    /* ── Grid ────────────────────────────────────── */
    .pratos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding: 24px 40px 0;
    }

    /* ── Skeleton ────────────────────────────────── */
    .prato-skeleton {
      background: var(--card-bg);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .skel-img {
      height: 175px;
      background: linear-gradient(90deg, var(--input-bg) 25%, #EDE8E0 50%, var(--input-bg) 75%);
      background-size: 1600px 100%;
      animation: shimmer 1.5s infinite linear;
    }
    .skel-body { padding: 18px; display: flex; flex-direction: column; gap: 8px; }
    .skel-line {
      border-radius: 50px;
      background: linear-gradient(90deg, #EDE8E0 25%, var(--border) 50%, #EDE8E0 75%);
      background-size: 1600px 100%;
      animation: shimmer 1.5s infinite linear;
    }
    .skel-cat   { height: 18px; width: 72px; }
    .skel-title { height: 13px; width: 68%; }
    .skel-desc  { height: 11px; width: 100%; }
    .skel-short { width: 65%; }
    .skel-row   { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
    .skel-price { height: 20px; width: 80px; }
    .skel-btn   { height: 40px; width: 100px; }

    /* ── Prato card ──────────────────────────────── */
    .prato-card {
      background: var(--card-bg);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .prato-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.12), 0 0 0 1.5px var(--brand-muted);
    }

    /* Card image area with food emoji */
    .prato-img {
      height: 175px;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }

    /* Large blurred emoji in background for depth */
    .prato-bg-emoji {
      position: absolute;
      font-size: 140px;
      opacity: 0.12;
      filter: blur(8px);
      pointer-events: none;
      user-select: none;
      z-index: 0;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      line-height: 1;
    }

    /* Radial highlight overlay */
    .prato-img::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 60% 20%, rgba(255,255,255,0.16) 0%, transparent 65%);
      z-index: 1;
    }

    /* Main emoji (the "photo") */
    .prato-emoji-wrap {
      position: relative; z-index: 2;
      width: 80px; height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.20);
      border: 1.5px solid rgba(255,255,255,0.32);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      backdrop-filter: blur(2px);
    }
    .prato-card:hover .prato-emoji-wrap {
      transform: scale(1.12) rotate(-8deg);
    }
    .prato-main-emoji {
      font-size: 44px;
      line-height: 1;
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.30));
    }

    .prato-cat-badge {
      position: absolute; bottom: 10px; left: 12px;
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: #fff;
      background: rgba(0,0,0,0.22);
      backdrop-filter: blur(8px);
      padding: 3px 10px;
      border-radius: 50px;
      z-index: 3;
    }

    .prato-body { padding: 18px; }
    .prato-name {
      font-size: 15px; font-weight: 700;
      color: var(--text-dark); margin: 0 0 6px;
      font-family: 'Poppins', sans-serif;
    }
    .prato-desc {
      font-size: 12.5px; color: var(--text-muted);
      line-height: 1.55; margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .prato-footer {
      display: flex; justify-content: space-between; align-items: center; gap: 10px;
    }
    .prato-price {
      font-size: 19px; font-weight: 700;
      color: var(--brand);
      font-family: 'Poppins', sans-serif;
      letter-spacing: -0.3px;
    }

    .add-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 18px; height: 44px;
      background: var(--brand);
      border: none; border-radius: 50px;
      color: #fff; font-size: 13px; font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.18s ease;
      text-decoration: none;
    }
    .add-btn:hover {
      background: var(--brand-hover);
      box-shadow: 0 4px 16px var(--brand-shadow);
      transform: translateY(-1px);
    }
    .add-btn i { font-size: 11px; }

    .add-btn-ghost {
      background: transparent;
      border: 1.5px solid var(--brand);
      color: var(--brand);
    }
    .add-btn-ghost:hover { background: var(--brand); color: #fff; }

    /* ── State box ───────────────────────────────── */
    .state-box {
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      padding: 72px 24px; gap: 12px;
    }
    .state-icon {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--input-bg); border: 1.5px solid var(--border);
      display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
    }
    .state-icon i { font-size: 28px; color: var(--text-muted); }
    .error-icon { background: var(--brand-subtle); border-color: var(--brand-muted); }
    .error-icon i { color: var(--brand); }
    .state-box h3 {
      font-size: 18px; font-weight: 700; color: var(--text-dark); margin: 0;
      font-family: 'Poppins', sans-serif;
    }
    .state-box p { font-size: 13.5px; color: var(--text-muted); max-width: 360px; margin: 0; }

    .ghost-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 24px; height: 44px;
      border: 1.5px solid var(--border); border-radius: 50px;
      background: var(--card-bg); color: var(--text-body);
      font-size: 13px; font-weight: 500;
      font-family: 'Poppins', sans-serif; cursor: pointer;
      transition: all 0.18s ease; margin-top: 4px;
    }
    .ghost-btn:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-subtle); }

    /* ── Pagination ──────────────────────────────── */
    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; margin: 40px 40px 0; flex-wrap: wrap;
    }
    .page-info { font-size: 13px; color: var(--text-muted); margin-right: 8px; font-family: 'Poppins', sans-serif; }
    .pagination button {
      width: 40px; height: 40px; border-radius: 50%;
      border: 1.5px solid var(--border); background: var(--card-bg);
      color: var(--text-body); font-size: 13px; font-weight: 500;
      font-family: 'Poppins', sans-serif; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .pagination button:hover:not(:disabled):not(.active) {
      border-color: var(--brand); color: var(--brand); background: var(--brand-subtle);
    }
    .pagination button.active {
      background: var(--brand); border-color: var(--brand);
      color: #fff; box-shadow: 0 2px 8px var(--brand-shadow);
    }
    .pagination button:disabled { opacity: 0.35; cursor: not-allowed; }

    /* ── Responsive ──────────────────────────────── */
    @media (max-width: 768px) {
      .hero { padding: 44px 24px 40px; min-height: unset; }
      .hero h1 { font-size: 34px; }
      .hero-showcase { display: none; }
      .f4, .f5, .f6, .f7 { display: none; }
      .category-bar { padding: 20px 20px 0; }
      .pratos-grid { grid-template-columns: 1fr 1fr; gap: 14px; padding: 18px 20px 0; }
      .pagination { margin: 32px 20px 0; }
    }
    @media (max-width: 480px) {
      .hero { padding: 36px 20px 32px; }
      .hero h1 { font-size: 28px; }
      .f1, .f2, .f3 { display: none; }
      .pratos-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CardapioComponent implements OnInit {
  pratos: Prato[] = [];
  categorias: Categoria[] = [];
  categoriaSelecionada: number | null = null;
  loading = true;
  hasError = false; // UI state only
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];

  // ── Food theming by category ─────────────────────────────────────────────
  private readonly foodThemes: { keys: string[]; emoji: string; gradient: string }[] = [
    { keys: ['pizza'],                                       emoji: '🍕', gradient: 'linear-gradient(135deg,#7C2D12,#C2410C,#EA580C)' },
    { keys: ['burger','hamburguer','lanche','x-','sanduíche','sandwich'], emoji: '🍔', gradient: 'linear-gradient(135deg,#78350F,#B45309,#F59E0B)' },
    { keys: ['massa','macarrão','espaguete','carbonara','lasanha','talharim'], emoji: '🍝', gradient: 'linear-gradient(135deg,#92400E,#A16207,#CA8A04)' },
    { keys: ['sushi','japonês','temaki','hot roll','yakisoba'], emoji: '🍱', gradient: 'linear-gradient(135deg,#1E3A5F,#1E40AF,#3B82F6)' },
    { keys: ['salada','vegano','vegetariano'],                emoji: '🥗', gradient: 'linear-gradient(135deg,#14532D,#166534,#16A34A)' },
    { keys: ['sobremesa','doce','bolo','torta','pudim'],      emoji: '🍰', gradient: 'linear-gradient(135deg,#701A75,#A21CAF,#D946EF)' },
    { keys: ['açaí','sorvete','gelato','milkshake'],          emoji: '🍧', gradient: 'linear-gradient(135deg,#4C1D95,#6D28D9,#8B5CF6)' },
    { keys: ['bebida','suco','vitamina','shake','água'],      emoji: '🥤', gradient: 'linear-gradient(135deg,#164E63,#0E7490,#06B6D4)' },
    { keys: ['café','coffee','expresso','cappuccino','latte'],emoji: '☕', gradient: 'linear-gradient(135deg,#292524,#44403C,#78716C)' },
    { keys: ['frango','chicken','grelhado','asinha'],         emoji: '🍗', gradient: 'linear-gradient(135deg,#713F12,#92400E,#D97706)' },
    { keys: ['carne','churrasco','picanha','costela','steak'],emoji: '🥩', gradient: 'linear-gradient(135deg,#450A0A,#991B1B,#DC2626)' },
    { keys: ['peixe','frutos','camarão','salmão','atum'],     emoji: '🐟', gradient: 'linear-gradient(135deg,#0C4A6E,#0369A1,#0EA5E9)' },
    { keys: ['tacos','mexicano','burrito','tex-mex'],         emoji: '🌮', gradient: 'linear-gradient(135deg,#365314,#3F6212,#65A30D)' },
    { keys: ['árabe','arabe','shawarma','kebab','esfiha'],    emoji: '🥙', gradient: 'linear-gradient(135deg,#431407,#9A3412,#C2410C)' },
    { keys: ['wrap','tortilla'],                              emoji: '🌯', gradient: 'linear-gradient(135deg,#7C2D12,#9A3412,#B45309)' },
    { keys: ['sopas','sopa','caldo','creme'],                 emoji: '🍲', gradient: 'linear-gradient(135deg,#44403C,#78716C,#A8A29E)' },
    { keys: ['ramen','lámen','noodle'],                       emoji: '🍜', gradient: 'linear-gradient(135deg,#1C1917,#292524,#57534E)' },
  ];

  // Returns emoji + gradient for a given category name
  getTheme(categoryName: string): { emoji: string; gradient: string } {
    const lower = (categoryName || '').toLowerCase();
    for (const t of this.foodThemes) {
      if (t.keys.some(k => lower.includes(k))) {
        return { emoji: t.emoji, gradient: t.gradient };
      }
    }
    return {
      emoji: '🍽️',
      gradient: 'linear-gradient(135deg,#B83E0E,#D4531A,#E8763A)',
    };
  }

  // Emoji only (for category pills)
  getCatEmoji(categoryName: string): string {
    return this.getTheme(categoryName).emoji;
  }

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
    this.hasError = false;
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
      error: () => { this.loading = false; this.hasError = true; }
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
