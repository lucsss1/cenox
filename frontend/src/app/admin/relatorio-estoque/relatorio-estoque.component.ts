import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Insumo, IngredienteMaisUsado } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-relatorio-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="filter-bar">
      <input type="date" class="form-control" style="width:auto;" [(ngModel)]="inicio">
      <span style="color:#555;font-size:12px;">&mdash;</span>
      <input type="date" class="form-control" style="width:auto;" [(ngModel)]="fim">
      <button class="btn btn-primary btn-sm" (click)="load()"><i class="fas fa-filter"></i> Aplicar</button>
    </div>

    <div *ngIf="loading" class="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

      <!-- Ingredientes mais usados -->
      <div class="card" style="padding:20px;">
        <div class="card-header"><i class="fas fa-fire-alt"></i> Ingredientes Mais Usados</div>
        <canvas #usadosCanvas *ngIf="ingredientes.length > 0" height="140"></canvas>
        <p *ngIf="ingredientes.length === 0" style="text-align:center;color:#6B7280;padding:20px;">Sem dados no período</p>
      </div>

      <!-- Estoque Baixo -->
      <div class="card">
        <div class="card-header" style="color:#93C5FD;"><i class="fas fa-exclamation-circle"></i> Estoque Baixo ({{estoqueBaixo.length}})</div>
        <table *ngIf="estoqueBaixo.length > 0">
          <thead><tr><th>Insumo</th><th>Qtd</th><th>Mínimo</th></tr></thead>
          <tbody>
            <tr *ngFor="let i of estoqueBaixo">
              <td style="color:#E5E7EB;">{{i.nome}}</td>
              <td><span class="badge badge-danger">{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</span></td>
              <td style="color:#6B7280;">{{i.estoqueMinimo | number:'1.0-3'}} {{i.unidadeMedida}}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="estoqueBaixo.length === 0" style="text-align:center;color:#10B981;padding:20px;">
          <i class="fas fa-check-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i>
          Todos os insumos em estoque adequado
        </div>
      </div>

      <!-- Vencidos -->
      <div class="card" *ngIf="vencidos.length > 0">
        <div class="card-header" style="color:#FCA5A5;"><i class="fas fa-skull-crossbones"></i> Produtos Vencidos</div>
        <table>
          <thead><tr><th>Produto</th><th>Validade</th><th>Estoque</th></tr></thead>
          <tbody>
            <tr *ngFor="let i of vencidos">
              <td style="color:#E5E7EB;">{{i.nome}}</td>
              <td style="color:#EF4444;font-weight:600;">{{i.dataValidade}}</td>
              <td>{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
  styles: [`
    .filter-bar { display:flex;gap:8px;align-items:center;margin-bottom:20px;flex-wrap:wrap; }
  `]
})
export class RelatorioEstoqueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('usadosCanvas') usadosCanvas!: ElementRef<HTMLCanvasElement>;
  ingredientes: IngredienteMaisUsado[] = [];
  estoqueBaixo: Insumo[] = [];
  vencidos: Insumo[] = [];
  loading = false;
  inicio = '';
  fim = '';
  private chart: Chart | null = null;
  private viewReady = false;
  private pendingDraw = false;

  constructor(private api: ApiService) {
    const now = new Date();
    this.fim = now.toISOString().split('T')[0];
    this.inicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  ngOnInit(): void { this.load(); }
  ngAfterViewInit(): void { this.viewReady = true; if (this.pendingDraw) this.drawChart(); }
  ngOnDestroy(): void { this.chart?.destroy(); }

  load(): void {
    this.loading = true;
    let done = 0;
    const check = () => { if (++done === 3) { this.loading = false; if (this.viewReady) setTimeout(() => this.drawChart(), 0); else this.pendingDraw = true; } };
    this.api.getIngredientesMaisUsados(this.inicio, this.fim).subscribe({ next: d => { this.ingredientes = d; check(); }, error: () => check() });
    this.api.getDashboardEstoqueBaixo().subscribe({ next: d => { this.estoqueBaixo = d; check(); }, error: () => check() });
    this.api.getDashboardVencidos().subscribe({ next: d => { this.vencidos = d; check(); }, error: () => check() });
  }

  private drawChart(): void {
    if (!this.usadosCanvas || this.ingredientes.length === 0) return;
    this.chart?.destroy();
    const labels = this.ingredientes.map(i => i.insumoNome);
    const values = this.ingredientes.map(i => i.quantidadeTotal);
    this.chart = new Chart(this.usadosCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Qty consumida',
          data: values,
          backgroundColor: '#6366F1',
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#6B7280' }, grid: { color: '#1A1A1A' } },
          y: { ticks: { color: '#D1D5DB' }, grid: { color: '#1A1A1A' } }
        }
      }
    });
  }
}
