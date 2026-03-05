import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Fornecedor, CatalogoFornecedor, Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-truck"></i> Fornecedores</h2>
        <p class="page-subtitle">{{fornecedores.length}} registros encontrados</p>
      </div>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Fornecedor</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Razao Social</th><th>CNPJ</th><th>Email</th><th>Telefone</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of fornecedores">
              <td style="color:#DC2626;font-weight:600;">#{{f.id}}</td>
              <td><strong style="color:#F3F4F6;">{{f.razaoSocial}}</strong></td>
              <td>{{f.cnpj}}</td>
              <td>{{f.email || '&mdash;'}}</td>
              <td>{{f.telefone || '&mdash;'}}</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn-icon" (click)="verCatalogo(f)" title="Catalogo"><i class="fas fa-list-alt"></i></button>
                  <button class="btn-icon btn-icon-warning" (click)="editar(f)" title="Editar"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="excluir(f.id)" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="fornecedores.length === 0"><td colspan="6" style="text-align:center;color:#6B7280;padding:30px;">Nenhum fornecedor</td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;align-items:center;margin-top:16px;" *ngIf="!loading && totalPages > 1">
        <span class="pagination-info">Exibindo {{fornecedores.length}} registros</span>
        <div class="pagination" style="margin-top:0;">
          <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
          <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
          <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
        </div>
      </div>
    </div>

    <!-- Modal Criar/Editar Fornecedor -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Fornecedor</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group"><label>Razao Social</label><input type="text" class="form-control" formControlName="razaoSocial"></div>
          <div class="form-group"><label>CNPJ</label><input type="text" class="form-control" formControlName="cnpj" placeholder="00.000.000/0000-00"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label>Email</label><input type="email" class="form-control" formControlName="email"></div>
            <div class="form-group"><label>Telefone</label><input type="text" class="form-control" formControlName="telefone"></div>
          </div>
          <div class="form-group"><label>Endereco</label><input type="text" class="form-control" formControlName="endereco"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Catalogo do Fornecedor -->
    <div class="modal-overlay" *ngIf="showCatalogoModal" (click)="showCatalogoModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3><i class="fas fa-list-alt" style="color:var(--primary);margin-right:8px;"></i> Catalogo - {{catalogoFornecedorNome}}</h3>
          <button class="modal-close" (click)="showCatalogoModal=false">&times;</button>
        </div>

        <div style="display:grid;grid-template-columns:2fr 1fr 1fr auto auto;gap:8px;align-items:end;margin-bottom:16px;">
          <div class="form-group" style="margin-bottom:0;">
            <label>Insumo</label>
            <select class="form-control" [(ngModel)]="catInsumoId">
              <option [ngValue]="0">Selecione...</option>
              <option *ngFor="let ins of insumosDisponiveis" [ngValue]="ins.id">{{ins.nome}} ({{ins.unidadeMedida}})</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Preco (R$)</label>
            <input type="number" class="form-control" [(ngModel)]="catPreco" step="0.0001" min="0.0001">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Unid. Venda</label>
            <select class="form-control" [(ngModel)]="catUnidade">
              <option value="">Selecione...</option>
              <option value="KG">KG</option><option value="G">G</option>
              <option value="L">L</option><option value="ML">ML</option><option value="UN">UN</option>
              <option value="CX">CX</option><option value="PCT">PCT</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm" style="height:38px;" [disabled]="!catInsumoId || !catPreco || !catUnidade"
                  (click)="catEditId ? atualizarCatalogo() : adicionarCatalogo()">
            <i [class]="catEditId ? 'fas fa-check' : 'fas fa-plus'"></i> {{catEditId ? 'Salvar' : 'Add'}}
          </button>
          <button *ngIf="catEditId" class="btn btn-secondary btn-sm" style="height:38px;" (click)="cancelarEdicaoCatalogo()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <table *ngIf="catalogoItens.length > 0">
          <thead><tr><th>Insumo</th><th>Preco</th><th>Unid. Venda</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of catalogoItens">
              <td><strong style="color:#F3F4F6;">{{c.insumoNome}}</strong></td>
              <td>R$ {{c.preco | number:'1.4-4'}}</td>
              <td>{{c.unidadeVenda}}</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn-icon btn-icon-warning" (click)="editarCatalogo(c)" title="Editar"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="excluirCatalogo(c.id)" title="Remover"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="catalogoItens.length === 0" style="text-align:center;color:#6B7280;padding:20px;">Nenhum produto cadastrado no catalogo deste fornecedor</p>
      </div>
    </div>
  `
})
export class FornecedoresComponent implements OnInit {
  fornecedores: Fornecedor[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  showCatalogoModal = false;
  catalogoFornecedorId = 0;
  catalogoFornecedorNome = '';
  catalogoItens: CatalogoFornecedor[] = [];
  insumosDisponiveis: Insumo[] = [];
  catInsumoId = 0;
  catPreco = 0;
  catUnidade = '';
  catEditId = 0;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      razaoSocial: ['', Validators.required], cnpj: ['', Validators.required],
      email: [''], telefone: [''], endereco: ['']
    });
  }

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getFornecedores(page).subscribe({
      next: (p) => { this.fornecedores = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }
  editar(f: Fornecedor): void {
    this.editando = true; this.editId = f.id;
    this.form.patchValue(f); this.showModal = true;
  }
  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const obs = this.editando ? this.api.updateFornecedor(this.editId, this.form.value) : this.api.createFornecedor(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Fornecedor salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar este fornecedor?')) return;
    this.api.deleteFornecedor(id).subscribe({ next: () => { this.toast.success('Fornecedor desativado!'); this.carregar(this.currentPage); } });
  }

  verCatalogo(f: Fornecedor): void {
    this.catalogoFornecedorId = f.id;
    this.catalogoFornecedorNome = f.razaoSocial;
    this.resetCatForm();
    this.api.getCatalogoFornecedor(f.id).subscribe({
      next: (data) => {
        this.catalogoItens = data;
        this.showCatalogoModal = true;
        this.carregarInsumosDisponiveis();
      }
    });
  }

  private carregarInsumosDisponiveis(): void {
    this.api.getInsumos(0).subscribe({
      next: (p) => { this.insumosDisponiveis = p.content; }
    });
  }

  private resetCatForm(): void {
    this.catInsumoId = 0; this.catPreco = 0; this.catUnidade = ''; this.catEditId = 0;
  }

  adicionarCatalogo(): void {
    if (!this.catInsumoId || !this.catPreco || !this.catUnidade) return;
    this.api.createCatalogo(this.catalogoFornecedorId, {
      insumoId: this.catInsumoId, preco: this.catPreco, unidadeVenda: this.catUnidade
    }).subscribe({
      next: () => {
        this.toast.success('Produto adicionado ao catalogo!');
        this.resetCatForm();
        this.recarregarCatalogo();
      },
      error: () => {}
    });
  }

  editarCatalogo(c: CatalogoFornecedor): void {
    this.catEditId = c.id;
    this.catInsumoId = c.insumoId;
    this.catPreco = c.preco;
    this.catUnidade = c.unidadeVenda;
  }

  atualizarCatalogo(): void {
    if (!this.catPreco || !this.catUnidade) return;
    this.api.updateCatalogo(this.catEditId, {
      insumoId: this.catInsumoId, preco: this.catPreco, unidadeVenda: this.catUnidade
    }).subscribe({
      next: () => {
        this.toast.success('Catalogo atualizado!');
        this.resetCatForm();
        this.recarregarCatalogo();
      },
      error: () => {}
    });
  }

  cancelarEdicaoCatalogo(): void { this.resetCatForm(); }

  excluirCatalogo(id: number): void {
    if (!confirm('Remover este item do catalogo?')) return;
    this.api.deleteCatalogo(id).subscribe({
      next: () => { this.toast.success('Item removido!'); this.recarregarCatalogo(); }
    });
  }

  private recarregarCatalogo(): void {
    this.api.getCatalogoFornecedor(this.catalogoFornecedorId).subscribe({
      next: (data) => { this.catalogoItens = data; }
    });
  }
}
