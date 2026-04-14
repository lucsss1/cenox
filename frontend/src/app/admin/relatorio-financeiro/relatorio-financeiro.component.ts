import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { RelatorioFinanceiro } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-relatorio-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <input type="date" class="form-control" style="width:auto;" [(ngModel)]="inicio">
      <span style="color:#555;font-size:12px;">&mdash;</span>
      <input type="date" class="form-control" style="width:auto;" [(ngModel)]="fim">
      <button class="btn btn-primary btn-sm" (click)="load()"><i class="fas fa-filter"></i> Aplicar</button>
    </div>

    <div *ngIf="loading" class="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading && data">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Faturamento</div>
          <div class="kpi-value" style="color:#10B981;">R$ {{data.faturamentoTotal | number:'1.2-2'}}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pedidos Entregues</div>
          <div class="kpi-value">{{data.totalPedidos}}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Ticket Médio</div>
          <div class="kpi-value" style="color:#3B82F6;">R$ {{data.ticketMedio | number:'1.2-2'}}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Custo de Compras</div>
          <div class="kpi-value" style="color:#F59E0B;">R$ {{data.totalCompras | number:'1.2-2'}}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Lucro Estimado</div>
          <div class="kpi-value" [style.color]="data.lucroEstimado >= 0 ? '#10B981' : '#EF4444'">
            R$ {{data.lucroEstimado | number:'1.2-2'}}
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="card" style="padding:20px;margin-bottom:16px;">
        <div class="card-header"><i class="fas fa-chart-area"></i> Faturamento Diário</div>
        <canvas #chartCanvas height="100"></canvas>
      </div>

      <!-- Tables -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="card">
          <div class="card-header" style="color:#FCD34D;"><i class="fas fa-trophy"></i> Top 5 Pratos</div>
          <table>
            <thead><tr><th>#</th><th>Prato</th><th>Vendas</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of data.topPratos; let i=index">
                <td style="color:#F59E0B;font-weight:700;">{{i+1}}</td>
                <td><strong style="color:var(--text-primary);">{{t.pratoNome}}</strong></td>
                <td>{{t.quantidadeVendida}}</td>
              </tr>
              <tr *ngIf="data.topPratos.length === 0"><td colspan="3" style="text-align:center;color:#6B7280;">Sem dados</td></tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <div class="card-header" style="color:#FCA5A5;"><i class="fas fa-arrow-down"></i> Menos Vendidos</div>
          <table>
            <thead><tr><th>Prato</th><th>Vendas</th></tr></thead>
            <tbody>
              <tr *ngFor="let t of data.pioresPratos">
                <td><strong style="color:var(--text-primary);">{{t.pratoNome}}</strong></td>
                <td>{{t.quantidadeVendida}}</td>
              </tr>
              <tr *ngIf="data.pioresPratos.length === 0"><td colspan="2" style="text-align:center;color:#6B7280;">Sem dados</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./relatorio-financeiro.component.css']
})
export class RelatorioFinanceiroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  data: RelatorioFinanceiro | null = null;
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
    this.api.getRelatorioFinanceiro(this.inicio, this.fim).subscribe({
      next: d => {
        this.data = d;
        this.loading = false;
        if (this.viewReady) setTimeout(() => this.drawChart(), 0);
        else this.pendingDraw = true;
      },
      error: () => { this.loading = false; }
    });
  }

  private drawChart(): void {
    if (!this.data || !this.chartCanvas) return;
    this.chart?.destroy();
    const labels = this.data.faturamentoDiario.map(r => {
      const [, m, d] = r.data.split('-');
      return `${d}/${m}`;
    });
    const values = this.data.faturamentoDiario.map(r => r.valor);
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Faturamento',
          data: values,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#6B7280' }, grid: { color: '#1A1A1A' } },
          y: { ticks: { color: '#6B7280', callback: (v) => 'R$ ' + v }, grid: { color: '#1A1A1A' } }
        }
      }
    });
  }
}
