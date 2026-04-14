import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Prato, Categoria } from '../../shared/models/models';

@Component({
  selector: 'app-pratos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="pr-root">

  <!-- Page Header -->
  <div class="pr-header">
    <div class="pr-header__left">
      <h1 class="pr-title">Cardápio</h1>
      <span class="pr-count">{{ pratos.length }} produtos</span>
    </div>
    <button class="pr-btn-add" (click)="abrirModal()">
      <i class="fas fa-plus"></i> Novo Produto
    </button>
  </div>

  <!-- Loading skeleton -->
  <div class="pr-skeleton-wrap" *ngIf="loading">
    <div class="pr-layout">
      <div class="sk-sidebar"></div>
      <div class="sk-grid">
        <div class="sk-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>
    </div>
  </div>

  <div class="pr-layout" *ngIf="!loading">

    <!-- Category filter sidebar -->
    <aside class="pr-filter">
      <div class="pr-filter__head">Categorias</div>
      <button class="pr-filter__item" [class.active]="selectedCategoria === ''" (click)="selectedCategoria = ''">
        <span>Todos</span>
        <span class="pr-filter__count">{{ pratos.length }}</span>
      </button>
      <button class="pr-filter__item" *ngFor="let c of categorias"
        [class.active]="selectedCategoria === c.id"
        (click)="selectedCategoria = c.id">
        <span>{{ c.nome }}</span>
        <span class="pr-filter__count">{{ getCountByCategoria(c.id) }}</span>
      </button>
    </aside>

    <!-- Products grid -->
    <main class="pr-main">

      <!-- Empty state -->
      <div class="pr-empty" *ngIf="pratosFiltrados.length === 0">
        <i class="fas fa-hamburger pr-empty__icon"></i>
        <p class="pr-empty__title">Nenhum produto encontrado</p>
        <p class="pr-empty__sub">Adicione o primeiro produto desta categoria.</p>
        <button class="pr-btn-add" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Produto</button>
      </div>

      <div class="pr-grid" *ngIf="pratosFiltrados.length > 0">
        <div class="pr-card" *ngFor="let p of pratosFiltrados" [class.pr-card--inactive]="p.status === 'INATIVO'">

          <!-- Image area -->
          <div class="pr-card__img">
            <img *ngIf="p.imagemUrl" [src]="p.imagemUrl" [alt]="p.nome">
            <span *ngIf="!p.imagemUrl" class="pr-card__initial">{{ p.nome.charAt(0) }}</span>
            <span class="pr-card__status-badge" [class.active]="p.status === 'ATIVO'" [class.inactive]="p.status === 'INATIVO'">
              {{ p.status === 'ATIVO' ? 'Disponível' : 'Indisponível' }}
            </span>
          </div>

          <!-- Body -->
          <div class="pr-card__body">
            <div class="pr-card__top">
              <span class="pr-card__cat">{{ p.categoriaNome }}</span>
              <div class="pr-card__badges">
                <span class="pr-badge pr-badge--danger" *ngIf="p.foodCostAlto">
                  <i class="fas fa-exclamation-triangle"></i> FC Alto
                </span>
                <span class="pr-badge pr-badge--warning" *ngIf="!p.temFichaTecnica">
                  <i class="fas fa-file-alt"></i> Sem Receita
                </span>
              </div>
            </div>

            <h3 class="pr-card__name">{{ p.nome }}</h3>

            <div class="pr-card__metrics">
              <div class="pr-card__metric">
                <span class="pr-card__metric-label">Preço</span>
                <span class="pr-card__metric-val">R$ {{ p.precoVenda | number:'1.2-2' }}</span>
              </div>
              <div class="pr-card__metric" *ngIf="p.foodCost">
                <span class="pr-card__metric-label">Food Cost</span>
                <span class="pr-card__metric-val" [class.high]="p.foodCostAlto">{{ p.foodCost | number:'1.1-1' }}%</span>
              </div>
            </div>
          </div>

          <!-- Footer / actions -->
          <div class="pr-card__footer">
            <div class="pr-toggle"
              [class.pr-toggle--on]="p.status === 'ATIVO'"
              [class.pr-toggle--disabled]="p.status === 'INATIVO' && !p.temFichaTecnica"
              (click)="p.status === 'ATIVO' ? desativar(p.id) : (p.temFichaTecnica ? ativar(p.id) : null)"
              [title]="p.status === 'INATIVO' && !p.temFichaTecnica ? 'Adicione uma receita para ativar' : (p.status === 'ATIVO' ? 'Clique para desativar' : 'Clique para ativar')">
              <span class="pr-toggle__track"><span class="pr-toggle__thumb"></span></span>
              <span class="pr-toggle__label">{{ p.status === 'ATIVO' ? 'Disponível' : 'Indisponível' }}</span>
            </div>
            <div class="pr-card__actions">
              <button class="pr-action" (click)="editar(p)" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="pr-action pr-action--danger" *ngIf="p.status === 'INATIVO'" (click)="excluir(p.id)" title="Excluir"><i class="fas fa-trash"></i></button>
            </div>
          </div>

        </div>
      </div>

      <!-- Pagination -->
      <div class="pr-pagination" *ngIf="totalPages > 1">
        <button class="pr-page-btn" (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">‹</button>
        <button class="pr-page-btn" *ngFor="let pg of pages" (click)="carregar(pg)" [class.active]="pg === currentPage">{{ pg + 1 }}</button>
        <button class="pr-page-btn" (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">›</button>
      </div>

    </main>
  </div>

  <!-- Create / Edit Modal -->
  <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
    <div class="pr-modal" (click)="$event.stopPropagation()">

      <div class="ficha-modal-header">
        <div class="ficha-header-shimmer"></div>
        <div class="ficha-header-body">
          <div class="ficha-header-icon"><i class="fas fa-utensils"></i></div>
          <div class="ficha-header-text">
            <h3>{{editando ? 'Editar' : 'Novo'}} Produto</h3>
            <p>Configure o prato para o seu cardápio</p>
          </div>
          <button class="pr-modal__close ficha-close" (click)="fecharModal()">&times;</button>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()">

        <div class="ficha-section">
          <div class="ficha-step-header">
            <span class="ficha-step-num">01</span>
            <span class="ficha-step-title">Identificação</span>
          </div>
          <div class="pr-field ficha-form-group">
            <label class="pr-label">Nome</label>
            <input type="text" class="pr-input" formControlName="nome" placeholder="Ex: X-Burguer Clássico">
          </div>
          <div class="pr-field ficha-form-group" style="margin-top:12px;">
            <label class="pr-label">Descrição</label>
            <textarea class="pr-input pr-textarea" formControlName="descricao" rows="2" placeholder="Breve descrição do produto"></textarea>
          </div>
        </div>

        <div class="ficha-section">
          <div class="ficha-step-header">
            <span class="ficha-step-num">02</span>
            <span class="ficha-step-title">Precificação & Detalhes</span>
          </div>
          <div class="ficha-grid-2">
            <div class="pr-field ficha-form-group">
              <label class="pr-label">Preço de Venda (R$)</label>
              <input type="number" class="pr-input" formControlName="precoVenda" step="0.01" min="0.01">
            </div>
            <div class="pr-field ficha-form-group">
              <label class="pr-label">Tempo de Preparo (min)</label>
              <input type="number" class="pr-input" formControlName="tempoPreparo" min="1">
            </div>
          </div>
          <div class="pr-field ficha-form-group" style="margin-top:12px;">
            <label class="pr-label">Categoria</label>
            <select class="pr-input pr-select" formControlName="categoriaId">
              <option value="">Selecione uma categoria</option>
              <option *ngFor="let c of categorias" [value]="c.id">{{ c.nome }}</option>
            </select>
          </div>
          <div class="pr-field ficha-form-group" style="margin-top:12px;">
            <label class="pr-label">URL da Imagem</label>
            <input type="text" class="pr-input" formControlName="imagemUrl" placeholder="https://...">
          </div>
        </div>

        <div style="background:#FFFFFF;border-top:1px solid var(--border-card);padding:16px 24px;display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="pr-btn-ghost" (click)="fecharModal()">Cancelar</button>
          <button type="submit" class="pr-btn-primary" [disabled]="form.invalid">
            <i class="fas fa-check" style="margin-right:5px;"></i>
            {{editando ? 'Salvar Alterações' : 'Criar Produto'}}
          </button>
        </div>

      </form>
    </div>
  </div>

  <!-- Confirm Desativar -->
  <div class="modal-overlay" *ngIf="confirmDesativarId !== null" (click)="confirmDesativarId = null">
    <div class="pr-confirm" (click)="$event.stopPropagation()">
      <p class="pr-confirm__text">Desativar este produto? Ele não aparecerá para novos pedidos.</p>
      <div class="pr-confirm__btns">
        <button class="pr-btn-ghost" (click)="confirmDesativarId = null">Cancelar</button>
        <button class="pr-btn-danger" (click)="confirmarDesativar()">Desativar</button>
      </div>
    </div>
  </div>

  <!-- Confirm Excluir -->
  <div class="modal-overlay" *ngIf="confirmExcluirId !== null" (click)="confirmExcluirId = null">
    <div class="pr-confirm" (click)="$event.stopPropagation()">
      <p class="pr-confirm__text">Excluir permanentemente este produto? Esta ação não pode ser desfeita.</p>
      <div class="pr-confirm__btns">
        <button class="pr-btn-ghost" (click)="confirmExcluirId = null">Cancelar</button>
        <button class="pr-btn-danger" (click)="confirmarExcluir()">Excluir</button>
      </div>
    </div>
  </div>

</div>
  `,
  styleUrls: ['./pratos.component.css']
})
export class PratosComponent implements OnInit {
  pratos: Prato[] = [];
  categorias: Categoria[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  // UI state only
  selectedCategoria: number | '' = '';
  confirmDesativarId: number | null = null;
  confirmExcluirId: number | null = null;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], descricao: [''], precoVenda: [0, [Validators.required, Validators.min(0.01)]],
      tempoPreparo: [null], categoriaId: ['', Validators.required], imagemUrl: ['']
    });
  }

  ngOnInit(): void {
    this.api.getCategoriasPublico().subscribe(c => this.categorias = c);
    this.carregar(0);
  }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getPratos(page).subscribe({
      next: (p) => { this.pratos = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }

  editar(p: Prato): void {
    this.editando = true; this.editId = p.id;
    this.form.patchValue({ nome: p.nome, descricao: p.descricao, precoVenda: p.precoVenda, tempoPreparo: p.tempoPreparo, categoriaId: p.categoriaId, imagemUrl: p.imagemUrl });
    this.showModal = true;
  }

  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const val = { ...this.form.value, categoriaId: +this.form.value.categoriaId };
    const obs = this.editando ? this.api.updatePrato(this.editId, val) : this.api.createPrato(val);
    obs.subscribe({
      next: () => { this.toast.success('Prato salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  ativar(id: number): void {
    this.api.ativarPrato(id).subscribe({
      next: () => { this.toast.success('Prato ativado!'); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  desativar(id: number): void {
    this.confirmDesativarId = id;
  }

  excluir(id: number): void {
    this.confirmExcluirId = id;
  }

  confirmarDesativar(): void {
    if (!this.confirmDesativarId) return;
    const id = this.confirmDesativarId;
    this.confirmDesativarId = null;
    this.api.deletePrato(id).subscribe({
      next: () => { this.toast.success('Prato desativado!'); this.carregar(this.currentPage); }
    });
  }

  confirmarExcluir(): void {
    if (!this.confirmExcluirId) return;
    const id = this.confirmExcluirId;
    this.confirmExcluirId = null;
    this.api.deletePrato(id).subscribe({
      next: () => { this.toast.success('Prato excluído!'); this.carregar(this.currentPage); }
    });
  }

  get pratosFiltrados(): Prato[] {
    if (!this.selectedCategoria) return this.pratos;
    return this.pratos.filter(p => p.categoriaId === this.selectedCategoria);
  }

  getCountByCategoria(catId: number): number {
    return this.pratos.filter(p => p.categoriaId === catId).length;
  }
}
