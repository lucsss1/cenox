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

    <!-- Status Filter Pills -->
    <div class="status-pills">
      <button class="pill" [class.active]="filtroStatus === ''" (click)="filtroStatus=''; filtrar()">Todos</button>
      <button class="pill em-avaliacao" [class.active]="filtroStatus === 'EM_AVALIACAO'" (click)="filtroStatus='EM_AVALIACAO'; filtrar()">Em Avaliacao</button>
      <button class="pill em-homologacao" [class.active]="filtroStatus === 'EM_HOMOLOGACAO'" (click)="filtroStatus='EM_HOMOLOGACAO'; filtrar()">Em Homologacao</button>
      <button class="pill homologado" [class.active]="filtroStatus === 'HOMOLOGADO'" (click)="filtroStatus='HOMOLOGADO'; filtrar()">Homologado</button>
      <button class="pill suspenso" [class.active]="filtroStatus === 'SUSPENSO'" (click)="filtroStatus='SUSPENSO'; filtrar()">Suspenso</button>
      <button class="pill bloqueado" [class.active]="filtroStatus === 'BLOQUEADO'" (click)="filtroStatus='BLOQUEADO'; filtrar()">Bloqueado</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Empresa</th><th>CNPJ</th><th>Responsavel</th><th>Telefone</th><th>Avaliacao</th><th>Prazo Entrega</th><th>Status</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of fornecedoresFiltrados">
              <td style="color:#DC2626;font-weight:600;">#{{f.id}}</td>
              <td><strong style="color:#F3F4F6;">{{f.nomeEmpresa}}</strong></td>
              <td>{{f.cnpj}}</td>
              <td>{{f.responsavelComercial || '&mdash;'}}</td>
              <td>{{f.telefone || '&mdash;'}}</td>
              <td>
                <span *ngIf="f.avaliacao" class="rating">{{f.avaliacao}}/5</span>
                <span *ngIf="!f.avaliacao" style="color:#6B7280;">&mdash;</span>
              </td>
              <td>
                <span *ngIf="f.prazoEntregaDias">{{f.prazoEntregaDias}} dias</span>
                <span *ngIf="!f.prazoEntregaDias" style="color:#6B7280;">&mdash;</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(f.statusFornecedor)">{{formatStatus(f.statusFornecedor)}}</span>
              </td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn-icon" (click)="verCatalogo(f)" title="Catalogo"><i class="fas fa-list-alt"></i></button>
                  <button class="btn-icon btn-icon-warning" (click)="editar(f)" title="Editar"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="excluir(f.id)" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="fornecedoresFiltrados.length === 0"><td colspan="9" style="text-align:center;color:#6B7280;padding:30px;">Nenhum fornecedor</td></tr>
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
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:650px;">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Fornecedor</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group"><label>Nome da Empresa *</label><input type="text" class="form-control" formControlName="nomeEmpresa"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label>CNPJ *</label><input type="text" class="form-control" formControlName="cnpj" placeholder="00.000.000/0000-00"></div>
            <div class="form-group"><label>Responsavel Comercial</label><input type="text" class="form-control" formControlName="responsavelComercial"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label>Email</label><input type="email" class="form-control" formControlName="email"></div>
            <div class="form-group"><label>Telefone</label><input type="text" class="form-control" formControlName="telefone"></div>
          </div>
          <div class="form-group"><label>Endereco</label><input type="text" class="form-control" formControlName="endereco"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
            <div class="form-group">
              <label>Status Fornecedor</label>
              <select class="form-control" formControlName="statusFornecedor">
                <option value="EM_AVALIACAO">Em Avaliacao</option>
                <option value="EM_HOMOLOGACAO">Em Homologacao</option>
                <option value="HOMOLOGADO">Homologado</option>
                <option value="SUSPENSO">Suspenso</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
            <div class="form-group">
              <label>Avaliacao (0-5)</label>
              <input type="number" class="form-control" formControlName="avaliacao" min="0" max="5" step="0.5">
            </div>
            <div class="form-group">
              <label>Prazo Entrega (dias)</label>
              <input type="number" class="form-control" formControlName="prazoEntregaDias" min="0">
            </div>
          </div>
          <div class="form-group">
            <label>Observacoes</label>
            <textarea class="form-control" formControlName="observacoes" rows="3" style="resize:vertical;"></textarea>
          </div>

          <!-- Status lifecycle info -->
          <div class="info-box" *ngIf="editando">
            <i class="fas fa-info-circle"></i>
            <span>Ciclo: Em Avaliacao → Em Homologacao → Homologado. Apenas fornecedores Homologados recebem pedidos de compra.</span>
          </div>

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
  `,
  styles: [`
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-em-avaliacao { background: rgba(234,179,8,0.15); color: #EAB308; }
    .status-em-homologacao { background: rgba(59,130,246,0.15); color: #3B82F6; }
    .status-homologado { background: rgba(34,197,94,0.15); color: #22C55E; }
    .status-suspenso { background: rgba(249,115,22,0.15); color: #F97316; }
    .status-bloqueado { background: rgba(239,68,68,0.15); color: #EF4444; }
    .status-inativo { background: rgba(107,114,128,0.15); color: #6B7280; }
    .rating { background: rgba(234,179,8,0.15); color: #EAB308; padding: 2px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
    .status-pills { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .pill { background: #1E1E1E; color: #9CA3AF; border: 1px solid #333; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s; }
    .pill:hover { border-color: #555; color: #E5E7EB; }
    .pill.active { color: #fff; border-color: transparent; }
    .pill.active.em-avaliacao, .pill.em-avaliacao.active { background: rgba(234,179,8,0.3); color: #EAB308; }
    .pill.active.em-homologacao, .pill.em-homologacao.active { background: rgba(59,130,246,0.3); color: #3B82F6; }
    .pill.active.homologado, .pill.homologado.active { background: rgba(34,197,94,0.3); color: #22C55E; }
    .pill.active.suspenso, .pill.suspenso.active { background: rgba(249,115,22,0.3); color: #F97316; }
    .pill.active.bloqueado, .pill.bloqueado.active { background: rgba(239,68,68,0.3); color: #EF4444; }
    .pill.active:not(.em-avaliacao):not(.em-homologacao):not(.homologado):not(.suspenso):not(.bloqueado) { background: #DC2626; }
    .info-box { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; color: #93C5FD; font-size: 13px; display: flex; align-items: center; gap: 10px; }
    .info-box i { color: #3B82F6; }
  `]
})
export class FornecedoresComponent implements OnInit {
  fornecedores: Fornecedor[] = [];
  fornecedoresFiltrados: Fornecedor[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  filtroStatus = '';
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
      nomeEmpresa: ['', Validators.required], cnpj: ['', Validators.required],
      email: [''], telefone: [''], endereco: [''],
      responsavelComercial: [''], statusFornecedor: ['EM_AVALIACAO'],
      avaliacao: [null], observacoes: [''], prazoEntregaDias: [null]
    });
  }

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getFornecedores(page).subscribe({
      next: (p) => {
        this.fornecedores = p.content;
        this.totalPages = p.totalPages;
        this.pages = Array.from({length: p.totalPages}, (_, i) => i);
        this.loading = false;
        this.filtrar();
      },
      error: () => { this.loading = false; }
    });
  }

  filtrar(): void {
    if (!this.filtroStatus) {
      this.fornecedoresFiltrados = this.fornecedores;
    } else {
      this.fornecedoresFiltrados = this.fornecedores.filter(f => f.statusFornecedor === this.filtroStatus);
    }
  }

  abrirModal(): void {
    this.editando = false;
    this.form.reset({ statusFornecedor: 'EM_AVALIACAO' });
    this.showModal = true;
  }
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
    this.catalogoFornecedorNome = f.nomeEmpresa;
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
      next: () => { this.toast.success('Produto adicionado ao catalogo!'); this.resetCatForm(); this.recarregarCatalogo(); },
      error: () => {}
    });
  }

  editarCatalogo(c: CatalogoFornecedor): void {
    this.catEditId = c.id; this.catInsumoId = c.insumoId; this.catPreco = c.preco; this.catUnidade = c.unidadeVenda;
  }

  atualizarCatalogo(): void {
    if (!this.catPreco || !this.catUnidade) return;
    this.api.updateCatalogo(this.catEditId, {
      insumoId: this.catInsumoId, preco: this.catPreco, unidadeVenda: this.catUnidade
    }).subscribe({
      next: () => { this.toast.success('Catalogo atualizado!'); this.resetCatForm(); this.recarregarCatalogo(); },
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

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'EM_AVALIACAO': 'status-em-avaliacao',
      'EM_HOMOLOGACAO': 'status-em-homologacao',
      'HOMOLOGADO': 'status-homologado',
      'SUSPENSO': 'status-suspenso',
      'BLOQUEADO': 'status-bloqueado',
      'INATIVO': 'status-inativo'
    };
    return map[status] || '';
  }

  formatStatus(status: string): string {
    const map: { [key: string]: string } = {
      'EM_AVALIACAO': 'Em Avaliacao',
      'EM_HOMOLOGACAO': 'Em Homologacao',
      'HOMOLOGADO': 'Homologado',
      'SUSPENSO': 'Suspenso',
      'BLOQUEADO': 'Bloqueado',
      'INATIVO': 'Inativo'
    };
    return map[status] || status;
  }

  private recarregarCatalogo(): void {
    this.api.getCatalogoFornecedor(this.catalogoFornecedorId).subscribe({
      next: (data) => { this.catalogoItens = data; }
    });
  }
}
