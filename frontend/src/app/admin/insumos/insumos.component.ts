import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Insumo, Fornecedor, CatalogoFornecedor, HistoricoPreco } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-boxes"></i> Insumos / Estoque</h2>
        <p class="page-subtitle">{{insumos.length}} registros encontrados</p>
      </div>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Insumo</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Unidade</th><th>Estoque</th><th>Min.</th><th>Custo Medio</th><th>Validade</th><th>Fornecedor</th><th>Status Est.</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let i of insumos">
              <td><span class="id-col">#{{i.id}}</span></td>
              <td><strong>{{i.nome}}</strong></td>
              <td>{{i.categoria || '&mdash;'}}</td>
              <td>{{i.unidadeMedida}}</td>
              <td>{{i.quantidadeEstoque | number:'1.0-3'}}</td>
              <td>{{i.estoqueMinimo | number:'1.0-3'}}</td>
              <td>{{i.custoMedio ? 'R$ ' + (i.custoMedio | number:'1.2-2') : '&mdash;'}}</td>
              <td>
                <span *ngIf="i.dataValidade" [class]="getValidadeClass(i.dataValidade)">{{i.dataValidade}}</span>
                <span *ngIf="!i.dataValidade">&mdash;</span>
              </td>
              <td>{{i.fornecedorNome || '&mdash;'}}</td>
              <td>
                <span [class]="i.abaixoEstoqueMinimo ? 'badge badge-danger' : 'badge badge-success'">
                  <span class="badge-dot"></span>
                  {{i.abaixoEstoqueMinimo ? 'BAIXO' : 'OK'}}
                </span>
              </td>
              <td>
                <div class="action-bar">
                  <button class="btn-icon" (click)="verCotacao(i)" title="Cotacao"><i class="fas fa-search-dollar"></i></button>
                  <button class="btn-icon btn-icon-purple" (click)="verHistorico(i)" title="Historico"><i class="fas fa-chart-line"></i></button>
                  <button class="btn-icon btn-icon-warning" (click)="abrirSaida(i)" title="Saida Manual"><i class="fas fa-arrow-down"></i></button>
                  <button class="btn-icon btn-icon-warning" (click)="editar(i)" title="Editar"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon btn-icon-danger" (click)="excluir(i.id)" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="insumos.length === 0">
              <td colspan="11" class="empty-row">Nenhum insumo encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer" *ngIf="!loading && totalPages > 1">
        <span class="pagination-info">Exibindo {{insumos.length}} registros</span>
        <div class="pagination">
          <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
          <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
          <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
        </div>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Insumo</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-grid">
            <div class="form-group"><label>Nome *</label><input type="text" class="form-control" formControlName="nome"></div>
            <div class="form-group"><label>Categoria</label><input type="text" class="form-control" formControlName="categoria" placeholder="Ex: Hortifruti, Carnes..."></div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Unidade de Medida *</label>
              <select class="form-control" formControlName="unidadeMedida">
                <option value="">Selecione...</option>
                <option value="KG">KG</option><option value="G">G</option>
                <option value="L">L</option><option value="ML">ML</option><option value="UN">UN</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fornecedor</label>
              <select class="form-control" formControlName="fornecedorId">
                <option [ngValue]="null">Nenhum</option>
                <option *ngFor="let f of fornecedores" [ngValue]="f.id">{{f.nomeEmpresa}}</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group"><label>Estoque Minimo *</label><input type="number" class="form-control" formControlName="estoqueMinimo" step="0.001"></div>
            <div class="form-group"><label>Custo Medio (R$)</label><input type="number" class="form-control" formControlName="custoMedio" step="0.01"></div>
          </div>
          <div class="form-grid">
            <div class="form-group"><label>Data de Entrada</label><input type="date" class="form-control" formControlName="dataEntradaEstoque"></div>
            <div class="form-group"><label>Data de Validade</label><input type="date" class="form-control" formControlName="dataValidade"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Saida Manual -->
    <div class="modal-overlay" *ngIf="showSaidaModal" (click)="showSaidaModal=false">
      <div class="modal-content modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Saida Manual - {{saidaInsumoNome}}</h3>
          <button class="modal-close" (click)="showSaidaModal=false">&times;</button>
        </div>
        <div class="form-group">
          <label>Quantidade</label>
          <input type="number" class="form-control" [(ngModel)]="saidaQtd" step="0.001" min="0.001">
        </div>
        <div class="form-group">
          <label>Motivo *</label>
          <select class="form-control" [(ngModel)]="saidaMotivo">
            <option value="">Selecione o motivo...</option>
            <option value="DESPERDICIO">Desperdicio</option>
            <option value="VENCIMENTO">Vencimento</option>
            <option value="QUEBRA">Quebra</option>
            <option value="USO_INTERNO">Uso Interno</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showSaidaModal=false">Cancelar</button>
          <button class="btn btn-danger" [disabled]="!saidaMotivo || saidaQtd <= 0" (click)="confirmarSaida()">Registrar Saida</button>
        </div>
      </div>
    </div>

    <!-- Modal Cotacao Comparativa -->
    <div class="modal-overlay" *ngIf="showCotacaoModal" (click)="showCotacaoModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><i class="fas fa-search-dollar header-icon"></i> Cotacao - {{cotacaoInsumoNome}}</h3>
          <button class="modal-close" (click)="showCotacaoModal=false">&times;</button>
        </div>
        <table *ngIf="cotacaoItens.length > 0">
          <thead><tr><th>#</th><th>Fornecedor</th><th>Preco</th><th>Unidade</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of cotacaoItens; let idx = index">
              <td><span class="rank-number" [class.rank-1]="idx === 0">{{idx + 1}}</span></td>
              <td><strong>{{c.fornecedorNome}}</strong></td>
              <td><strong>R$ {{c.preco | number:'1.4-4'}}</strong></td>
              <td>{{c.unidadeVenda}}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="cotacaoItens.length === 0" class="empty-row">Nenhum fornecedor cadastrado para este insumo</p>
      </div>
    </div>

    <!-- Modal Historico de Precos -->
    <div class="modal-overlay" *ngIf="showHistoricoModal" (click)="showHistoricoModal=false">
      <div class="modal-content modal-wide" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><i class="fas fa-chart-line header-icon-purple"></i> Historico de Precos - {{historicoInsumoNome}}</h3>
          <button class="modal-close" (click)="showHistoricoModal=false">&times;</button>
        </div>
        <canvas #historicoChart></canvas>
        <table *ngIf="historicoItens.length > 0" class="mt-table">
          <thead><tr><th>Data</th><th>Fornecedor</th><th>Preco</th></tr></thead>
          <tbody>
            <tr *ngFor="let h of historicoItens">
              <td>{{h.dataRegistro}}</td>
              <td><strong>{{h.fornecedorNome}}</strong></td>
              <td><strong>R$ {{h.preco | number:'1.4-4'}}</strong></td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="historicoItens.length === 0" class="empty-row">Nenhum historico de precos disponivel</p>
      </div>
    </div>
  `,
  styles: [`
    .empty-row { text-align: center; color: var(--text-tertiary); padding: 32px !important; }
    .table-footer { display: flex; align-items: center; margin-top: var(--space-4); }
    .table-footer .pagination { margin-top: 0; }
    .modal-sm { max-width: 400px; }
    .modal-wide { max-width: 700px; }
    .header-icon { color: var(--primary); margin-right: 8px; }
    .header-icon-purple { color: #A78BFA; margin-right: 8px; }
    .mt-table { margin-top: var(--space-4); }
    .btn-icon-purple { border-color: rgba(124,58,237,0.3); color: #A78BFA; }
    .btn-icon-purple:hover { border-color: rgba(124,58,237,0.5); color: #C4B5FD; background: rgba(124,58,237,0.08); }
    .validade-vencido { color: #EF4444; }
    .validade-proximo { color: #F59E0B; }
    .validade-ok { color: var(--text-tertiary); }
  `]
})
export class InsumosComponent implements OnInit {
  @ViewChild('historicoChart') historicoRef!: ElementRef<HTMLCanvasElement>;

  insumos: Insumo[] = [];
  fornecedores: Fornecedor[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  showSaidaModal = false;
  saidaInsumoId = 0;
  saidaInsumoNome = '';
  saidaQtd = 0;
  saidaMotivo = '';

  showCotacaoModal = false;
  cotacaoInsumoNome = '';
  cotacaoItens: CatalogoFornecedor[] = [];

  showHistoricoModal = false;
  historicoInsumoNome = '';
  historicoItens: HistoricoPreco[] = [];
  private histChart: Chart | null = null;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], unidadeMedida: ['', Validators.required],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]], custoMedio: [null],
      categoria: [''], dataEntradaEstoque: [null], dataValidade: [null], fornecedorId: [null]
    });
  }

  ngOnInit(): void {
    this.carregar(0);
    this.api.getFornecedoresTodos().subscribe({ next: (f) => this.fornecedores = f });
  }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getInsumos(page).subscribe({
      next: (p) => { this.insumos = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }
  editar(i: Insumo): void {
    this.editando = true; this.editId = i.id;
    this.form.patchValue({
      nome: i.nome, unidadeMedida: i.unidadeMedida, estoqueMinimo: i.estoqueMinimo, custoMedio: i.custoMedio,
      categoria: i.categoria, dataEntradaEstoque: i.dataEntradaEstoque, dataValidade: i.dataValidade,
      fornecedorId: i.fornecedorId || null
    });
    this.showModal = true;
  }
  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const obs = this.editando ? this.api.updateInsumo(this.editId, this.form.value) : this.api.createInsumo(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Insumo salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar este insumo?')) return;
    this.api.deleteInsumo(id).subscribe({ next: () => { this.toast.success('Insumo desativado!'); this.carregar(this.currentPage); } });
  }

  abrirSaida(i: Insumo): void {
    this.saidaInsumoId = i.id; this.saidaInsumoNome = i.nome;
    this.saidaQtd = 0; this.saidaMotivo = '';
    this.showSaidaModal = true;
  }

  confirmarSaida(): void {
    if (!this.saidaMotivo || this.saidaQtd <= 0) return;
    this.api.saidaManual(this.saidaInsumoId, { quantidade: this.saidaQtd, motivo: this.saidaMotivo }).subscribe({
      next: () => { this.toast.success('Saida registrada!'); this.showSaidaModal = false; this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  verCotacao(i: Insumo): void {
    this.cotacaoInsumoNome = i.nome;
    this.api.getCotacaoInsumo(i.id).subscribe({
      next: (data) => { this.cotacaoItens = data; this.showCotacaoModal = true; }
    });
  }

  verHistorico(i: Insumo): void {
    this.historicoInsumoNome = i.nome;
    this.api.getHistoricoPrecos(i.id).subscribe({
      next: (data) => {
        this.historicoItens = data;
        this.showHistoricoModal = true;
        setTimeout(() => this.renderHistoricoChart(), 200);
      }
    });
  }

  getValidadeClass(data: string): string {
    if (this.isVencido(data)) return 'validade-vencido';
    if (this.isProximoVencer(data)) return 'validade-proximo';
    return 'validade-ok';
  }

  isVencido(data: string): boolean {
    return new Date(data) < new Date();
  }

  isProximoVencer(data: string): boolean {
    const validade = new Date(data);
    const hoje = new Date();
    const diffDias = (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    return diffDias >= 0 && diffDias <= 7;
  }

  private renderHistoricoChart(): void {
    if (!this.historicoRef || this.historicoItens.length === 0) return;
    const ctx = this.historicoRef.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.histChart) this.histChart.destroy();

    const labels = this.historicoItens.map(h => h.dataRegistro);
    const valores = this.historicoItens.map(h => h.preco);

    this.histChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Preco (R$)',
          data: valores,
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124,58,237,0.06)',
          fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, ticks: { color: '#52525B' }, grid: { color: '#27272A' }, border: { display: false } },
          x: { ticks: { color: '#52525B' }, grid: { display: false }, border: { display: false } }
        }
      }
    });
  }
}
