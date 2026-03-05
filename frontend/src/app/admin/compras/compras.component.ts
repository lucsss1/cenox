import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Compra, Fornecedor, Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-shopping-bag"></i> Pedidos de Compra</h2>
        <p class="page-subtitle">{{compras.length}} registros encontrados</p>
      </div>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Pedido</button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <i class="fas fa-search"></i>
        <input type="text" class="search-input" placeholder="Buscar por fornecedor, ID ou NF..."
               [(ngModel)]="searchTerm" (input)="filtrarLocal()">
      </div>
      <button class="filter-btn-outline"><i class="fas fa-sliders-h"></i> Filtros</button>
      <div class="status-pills" style="margin-left:auto;">
        <span class="status-pill" *ngFor="let s of statusCounts"
              [style.border-color]="s.color" [style.color]="s.color"
              (click)="filtrarStatus(s.key)" [class.active-pill]="filtroStatus === s.key">
          <span class="dot" [style.background]="s.color"></span>
          {{s.label}}: {{s.count}}
        </span>
      </div>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th class="sortable" (click)="sort('id')">ID <i class="fas fa-sort" style="font-size:10px;margin-left:2px;"></i></th>
              <th class="sortable" (click)="sort('fornecedorNome')">FORNECEDOR <i class="fas fa-sort" style="font-size:10px;margin-left:2px;"></i></th>
              <th class="sortable" (click)="sort('dataCompra')">DATA <i class="fas fa-sort" style="font-size:10px;margin-left:2px;"></i></th>
              <th class="sortable" (click)="sort('notaFiscal')">NF <i class="fas fa-sort" style="font-size:10px;margin-left:2px;"></i></th>
              <th>ITENS</th>
              <th class="sortable" (click)="sort('valorTotal')">TOTAL <i class="fas fa-sort" style="font-size:10px;margin-left:2px;"></i></th>
              <th class="sortable" (click)="sort('status')">STATUS <i class="fas fa-sort" style="font-size:10px;margin-left:2px;"></i></th>
              <th>ACOES</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of comprasFiltradas">
              <td style="color:#DC2626;font-weight:600;">#{{c.id.toString().padStart(4, '0')}}</td>
              <td><strong style="color:#F3F4F6;">{{c.fornecedorNome}}</strong></td>
              <td>{{c.dataCompra | date:'dd/MM/yyyy'}}</td>
              <td>{{c.notaFiscal || '&mdash;'}}</td>
              <td>{{c.itens.length}}</td>
              <td><strong style="color:#F3F4F6;">R$ {{c.valorTotal | number:'1.2-2'}}</strong></td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-warning': c.status === 'RASCUNHO',
                  'badge-info': c.status === 'ENVIADO',
                  'badge-success': c.status === 'RECEBIDO',
                  'badge-danger': c.status === 'CANCELADO'
                }">
                  <span class="badge-dot"></span>
                  {{getStatusLabel(c.status)}}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn-icon" title="Visualizar"><i class="fas fa-eye"></i></button>
                  <button *ngIf="c.status === 'RASCUNHO'" class="btn-icon" (click)="alterarStatus(c.id, 'ENVIADO')" title="Enviar">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                  <button *ngIf="c.status === 'ENVIADO'" class="btn-icon btn-icon-success" (click)="alterarStatus(c.id, 'RECEBIDO')" title="Receber">
                    <i class="fas fa-check"></i>
                  </button>
                  <button *ngIf="c.status === 'RASCUNHO'" class="btn-icon btn-icon-warning" (click)="editar(c)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button *ngIf="c.status !== 'RECEBIDO' && c.status !== 'CANCELADO'" class="btn-icon btn-icon-danger" (click)="excluir(c.id)" title="Cancelar">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="comprasFiltradas.length === 0">
              <td colspan="8" style="text-align:center;color:#6B7280;padding:30px;">Nenhum pedido de compra</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;align-items:center;margin-top:16px;" *ngIf="!loading">
        <span class="pagination-info">Exibindo {{comprasFiltradas.length}} de {{compras.length}} pedidos</span>
        <div class="pagination" *ngIf="totalPages > 1" style="margin-top:0;">
          <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
          <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
          <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Pedido de Compra</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;">
            <div class="form-group">
              <label>Fornecedor</label>
              <select class="form-control" formControlName="fornecedorId">
                <option value="">Selecione...</option>
                <option *ngFor="let f of fornecedores" [value]="f.id">{{f.razaoSocial}}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data</label>
              <input type="date" class="form-control" formControlName="dataCompra">
            </div>
            <div class="form-group">
              <label>Nota Fiscal</label>
              <input type="text" class="form-control" formControlName="notaFiscal">
            </div>
          </div>

          <div *ngIf="!editando">
            <h4 style="margin:12px 0 8px;color:#F3F4F6;font-size:14px;">Itens do Pedido</h4>
            <div formArrayName="itens">
              <div *ngFor="let item of itensArray.controls; let i=index" [formGroupName]="i"
                   style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
                <div class="form-group" style="margin:0;">
                  <label *ngIf="i===0">Insumo</label>
                  <select class="form-control" formControlName="insumoId">
                    <option value="">Sel...</option>
                    <option *ngFor="let ins of insumos" [value]="ins.id">{{ins.nome}} ({{ins.unidadeMedida}})</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label *ngIf="i===0">Quantidade</label>
                  <input type="number" class="form-control" formControlName="quantidade" step="0.001">
                </div>
                <div class="form-group" style="margin:0;">
                  <label *ngIf="i===0">Preco Unit.</label>
                  <input type="number" class="form-control" formControlName="precoUnitario" step="0.01">
                </div>
                <button type="button" class="btn-icon btn-icon-danger" (click)="removerItem(i)" style="margin-bottom:2px;">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" (click)="adicionarItem()"><i class="fas fa-plus"></i> Item</button>
          </div>
          <p *ngIf="editando" style="margin:12px 0;color:#6B7280;font-size:13px;">
            <i class="fas fa-info-circle"></i> Os itens nao podem ser editados. Para corrigir, cancele e crie um novo pedido.
          </p>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || (!editando && itensArray.length === 0)">{{editando ? 'Salvar' : 'Criar Rascunho'}}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .active-pill { background: rgba(255,255,255,0.06) !important; }
  `]
})
export class ComprasComponent implements OnInit {
  compras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  fornecedores: Fornecedor[] = [];
  insumos: Insumo[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false;
  editando = false;
  editId = 0;
  form: FormGroup;
  searchTerm = '';
  filtroStatus = '';
  statusCounts: {key: string; label: string; color: string; count: number}[] = [];

  get itensArray(): FormArray { return this.form.get('itens') as FormArray; }

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      fornecedorId: ['', Validators.required],
      dataCompra: ['', Validators.required],
      notaFiscal: [''],
      itens: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.api.getFornecedoresTodos().subscribe(f => this.fornecedores = f);
    this.api.getInsumos(0).subscribe(p => this.insumos = p.content);
    this.carregar(0);
  }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getCompras(page).subscribe({
      next: (p) => {
        this.compras = p.content;
        this.totalPages = p.totalPages;
        this.pages = Array.from({length: p.totalPages}, (_, i) => i);
        this.loading = false;
        this.calcStatusCounts();
        this.filtrarLocal();
      },
      error: () => { this.loading = false; }
    });
  }

  calcStatusCounts(): void {
    const map: Record<string, number> = {};
    this.compras.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
    const statusConfig: Record<string, {label: string; color: string}> = {
      'RASCUNHO': {label: 'Pendente', color: '#D97706'},
      'ENVIADO': {label: 'Em Transito', color: '#3B82F6'},
      'RECEBIDO': {label: 'Recebido', color: '#16A34A'},
      'CANCELADO': {label: 'Cancelado', color: '#DC2626'}
    };
    this.statusCounts = Object.keys(statusConfig)
      .filter(k => map[k])
      .map(k => ({key: k, label: statusConfig[k].label, color: statusConfig[k].color, count: map[k] || 0}));
  }

  filtrarStatus(status: string): void {
    this.filtroStatus = this.filtroStatus === status ? '' : status;
    this.filtrarLocal();
  }

  filtrarLocal(): void {
    let result = this.compras;
    if (this.filtroStatus) {
      result = result.filter(c => c.status === this.filtroStatus);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.fornecedorNome.toLowerCase().includes(term) ||
        c.id.toString().includes(term) ||
        (c.notaFiscal && c.notaFiscal.toLowerCase().includes(term))
      );
    }
    this.comprasFiltradas = result;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'RASCUNHO': 'Pendente', 'ENVIADO': 'Em Transito',
      'RECEBIDO': 'Recebido', 'CANCELADO': 'Cancelado'
    };
    return map[status] || status;
  }

  sort(field: string): void {
    this.comprasFiltradas.sort((a: any, b: any) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
  }

  abrirModal(): void {
    this.editando = false; this.editId = 0;
    this.form.reset(); this.itensArray.clear(); this.adicionarItem(); this.showModal = true;
  }
  fecharModal(): void { this.showModal = false; }

  adicionarItem(): void {
    this.itensArray.push(this.fb.group({
      insumoId: ['', Validators.required],
      quantidade: [0, [Validators.required, Validators.min(0.001)]],
      precoUnitario: [0, [Validators.required, Validators.min(0.01)]]
    }));
  }
  removerItem(i: number): void { this.itensArray.removeAt(i); }

  editar(c: Compra): void {
    this.editando = true;
    this.editId = c.id;
    this.itensArray.clear();
    this.form.patchValue({
      fornecedorId: c.fornecedorId,
      dataCompra: c.dataCompra,
      notaFiscal: c.notaFiscal
    });
    this.showModal = true;
  }

  alterarStatus(id: number, status: string): void {
    const msg = status === 'RECEBIDO' ? 'Confirmar recebimento? Isso atualizara o estoque e custos.' : 'Confirmar envio?';
    if (!confirm(msg)) return;
    this.api.alterarStatusCompra(id, status).subscribe({
      next: () => {
        const successMsg = status === 'RECEBIDO' ? 'Compra recebida! Estoque e custos atualizados.' : 'Status atualizado!';
        this.toast.success(successMsg);
        this.carregar(this.currentPage);
      },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Cancelar este pedido de compra?')) return;
    this.api.deleteCompra(id).subscribe({
      next: () => { this.toast.success('Pedido de compra cancelado!'); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  salvar(): void {
    if (this.form.invalid) return;
    if (this.editando) {
      const val = {
        ...this.form.value,
        fornecedorId: +this.form.value.fornecedorId,
        itens: []
      };
      this.api.updateCompra(this.editId, val).subscribe({
        next: () => {
          this.toast.success('Pedido atualizado!');
          this.fecharModal(); this.carregar(this.currentPage);
        },
        error: () => {}
      });
    } else {
      const val = {
        ...this.form.value,
        fornecedorId: +this.form.value.fornecedorId,
        itens: this.form.value.itens.map((i: any) => ({ ...i, insumoId: +i.insumoId }))
      };
      this.api.createCompra(val).subscribe({
        next: () => {
          this.toast.success('Pedido de compra criado como RASCUNHO!');
          this.fecharModal(); this.carregar(this.currentPage);
        },
        error: () => {}
      });
    }
  }
}
