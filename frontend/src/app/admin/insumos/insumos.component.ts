import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Insumo, CatalogoFornecedor, HistoricoPreco } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-boxes"></i> Insumos / Estoque</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Insumo</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Unidade</th><th>Estoque</th><th>Min.</th><th>Custo Medio</th><th>Status Est.</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let i of insumos">
              <td>{{i.id}}</td>
              <td><strong>{{i.nome}}</strong></td>
              <td>{{i.unidadeMedida}}</td>
              <td>{{i.quantidadeEstoque | number:'1.0-3'}}</td>
              <td>{{i.estoqueMinimo | number:'1.0-3'}}</td>
              <td>{{i.custoMedio ? 'R$ ' + (i.custoMedio | number:'1.2-2') : '-'}}</td>
              <td>
                <span [class]="i.abaixoEstoqueMinimo ? 'badge badge-danger' : 'badge badge-success'">
                  {{i.abaixoEstoqueMinimo ? 'BAIXO' : 'OK'}}
                </span>
              </td>
              <td style="white-space:nowrap;">
                <button class="btn btn-info btn-sm" (click)="verCotacao(i)" title="Cotacao"><i class="fas fa-search-dollar"></i></button>
                <button class="btn btn-purple btn-sm" (click)="verHistorico(i)" title="Historico Precos" style="background:#7C3AED;"><i class="fas fa-chart-line"></i></button>
                <button class="btn btn-warning btn-sm" (click)="abrirSaida(i)" title="Saida Manual"><i class="fas fa-arrow-down"></i></button>
                <button class="btn btn-warning btn-sm" (click)="editar(i)" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" (click)="excluir(i.id)" title="Excluir"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="insumos.length === 0"><td colspan="8" style="text-align:center;color:var(--gray-500);">Nenhum insumo encontrado</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
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
          <div class="form-group"><label>Nome</label><input type="text" class="form-control" formControlName="nome"></div>
          <div class="form-group">
            <label>Unidade de Medida</label>
            <select class="form-control" formControlName="unidadeMedida">
              <option value="">Selecione...</option>
              <option value="KG">KG</option><option value="G">G</option>
              <option value="L">L</option><option value="ML">ML</option><option value="UN">UN</option>
            </select>
          </div>
          <div class="form-group"><label>Estoque Minimo</label><input type="number" class="form-control" formControlName="estoqueMinimo" step="0.001"></div>
          <div class="form-group"><label>Custo Medio (R$)</label><input type="number" class="form-control" formControlName="custoMedio" step="0.01"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Saida Manual -->
    <div class="modal-overlay" *ngIf="showSaidaModal" (click)="showSaidaModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:400px;">
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
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:600px;">
        <div class="modal-header">
          <h3><i class="fas fa-search-dollar"></i> Cotacao - {{cotacaoInsumoNome}}</h3>
          <button class="modal-close" (click)="showCotacaoModal=false">&times;</button>
        </div>
        <table *ngIf="cotacaoItens.length > 0">
          <thead><tr><th>#</th><th>Fornecedor</th><th>Preco</th><th>Unidade</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of cotacaoItens; let idx = index">
              <td><span class="badge" [ngClass]="idx === 0 ? 'badge-success' : ''">{{idx + 1}}</span></td>
              <td>{{c.fornecedorNome}}</td>
              <td><strong>R$ {{c.preco | number:'1.4-4'}}</strong></td>
              <td>{{c.unidadeVenda}}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="cotacaoItens.length === 0" style="text-align:center;color:var(--gray-500);padding:20px;">Nenhum fornecedor cadastrado para este insumo</p>
      </div>
    </div>

    <!-- Modal Historico de Precos -->
    <div class="modal-overlay" *ngIf="showHistoricoModal" (click)="showHistoricoModal=false">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3><i class="fas fa-chart-line"></i> Historico de Precos - {{historicoInsumoNome}}</h3>
          <button class="modal-close" (click)="showHistoricoModal=false">&times;</button>
        </div>
        <canvas #historicoChart></canvas>
        <table *ngIf="historicoItens.length > 0" style="margin-top:16px;">
          <thead><tr><th>Data</th><th>Fornecedor</th><th>Preco</th></tr></thead>
          <tbody>
            <tr *ngFor="let h of historicoItens">
              <td>{{h.dataRegistro}}</td>
              <td>{{h.fornecedorNome}}</td>
              <td><strong>R$ {{h.preco | number:'1.4-4'}}</strong></td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="historicoItens.length === 0" style="text-align:center;color:var(--gray-500);padding:20px;">Nenhum historico de precos disponivel</p>
      </div>
    </div>
  `
})
export class InsumosComponent implements OnInit {
  @ViewChild('historicoChart') historicoRef!: ElementRef<HTMLCanvasElement>;

  insumos: Insumo[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  // Saida Manual
  showSaidaModal = false;
  saidaInsumoId = 0;
  saidaInsumoNome = '';
  saidaQtd = 0;
  saidaMotivo = '';

  // Cotacao
  showCotacaoModal = false;
  cotacaoInsumoNome = '';
  cotacaoItens: CatalogoFornecedor[] = [];

  // Historico
  showHistoricoModal = false;
  historicoInsumoNome = '';
  historicoItens: HistoricoPreco[] = [];
  private histChart: Chart | null = null;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], unidadeMedida: ['', Validators.required],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]], custoMedio: [null]
    });
  }

  ngOnInit(): void { this.carregar(0); }

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
    this.form.patchValue({ nome: i.nome, unidadeMedida: i.unidadeMedida, estoqueMinimo: i.estoqueMinimo, custoMedio: i.custoMedio });
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

  // Saida Manual
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

  // Cotacao Comparativa
  verCotacao(i: Insumo): void {
    this.cotacaoInsumoNome = i.nome;
    this.api.getCotacaoInsumo(i.id).subscribe({
      next: (data) => { this.cotacaoItens = data; this.showCotacaoModal = true; }
    });
  }

  // Historico de Precos
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
          backgroundColor: 'rgba(124,58,237,0.1)',
          fill: true, tension: 0.3, pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, ticks: { color: '#6B7280' }, grid: { color: '#222' } },
          x: { ticks: { color: '#6B7280' }, grid: { color: '#222' } }
        }
      }
    });
  }
}
