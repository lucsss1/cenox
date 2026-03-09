import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Dashboard } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-faturamento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/admin/dashboard" class="back-link"><i class="fas fa-arrow-left"></i> Dashboards</a>
        <h2><i class="fas fa-dollar-sign"></i> Faturamento Diario</h2>
        <p class="page-subtitle">Receita dos ultimos 30 dias</p>
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading && data">
      <div class="kpi-grid kpi-grid-mb">
        <div class="kpi-card kpi-card-green">
          <div class="kpi-icon-corner"><i class="fas fa-dollar-sign"></i></div>
          <span class="kpi-label">FATURAMENTO MENSAL</span>
          <span class="kpi-value">R$ {{data.faturamentoMensal | number:'1.2-2'}}</span>
        </div>
        <div class="kpi-card kpi-card-blue">
          <div class="kpi-icon-corner"><i class="fas fa-clipboard-list"></i></div>
          <span class="kpi-label">PEDIDOS NO MES</span>
          <span class="kpi-value">{{data.totalPedidosMes}}</span>
        </div>
        <div class="kpi-card kpi-card-purple">
          <div class="kpi-icon-corner"><i class="fas fa-shopping-bag"></i></div>
          <span class="kpi-label">TOTAL COMPRAS MES</span>
          <span class="kpi-value">R$ {{data.totalComprasMes | number:'1.2-2'}}</span>
        </div>
      </div>

      <div class="card chart-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Faturamento Diario</h3>
            <span class="chart-subtitle">Ultimos 30 dias</span>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot"></span> Receita
            </span>
          </div>
        </div>
        <canvas #faturamentoChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      font-size: 12px; color: #6B7280; text-decoration: none;
      display: inline-flex; align-items: center; gap: 6px;
      margin-bottom: 4px; transition: color 0.2s;
    }
    .back-link:hover { color: var(--text-primary); }
    .kpi-grid-mb { margin-bottom: 20px; }
    .chart-card { padding: 20px; }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .chart-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .chart-subtitle { font-size: 12px; color: var(--text-tertiary); }
    .chart-legend { display: flex; gap: 12px; align-items: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); }
  `]
})
export class DashboardFaturamentoComponent implements OnInit, AfterViewInit {
  @ViewChild('faturamentoChart') chartRef!: ElementRef<HTMLCanvasElement>;
  data: Dashboard | null = null;
  loading = true;
  private chartsReady = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
        if (this.chartsReady) this.renderChart();
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (this.data) this.renderChart();
  }

  private renderChart(): void {
    setTimeout(() => {
      if (!this.chartRef || !this.data) return;
      const ctx = this.chartRef.nativeElement.getContext('2d');
      if (!ctx) return;

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.faturamentoDiario.map(d => d.data),
          datasets: [{
            label: 'Faturamento (R$)',
            data: this.data.faturamentoDiario.map(d => d.valor),
            borderColor: '#DC2626',
            backgroundColor: 'rgba(220,38,38,0.08)',
            fill: true, tension: 0.4, pointRadius: 0,
            pointHoverRadius: 4, borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#52525B', font: { size: 11 }, callback: (v) => 'R$' + Number(v).toLocaleString('pt-BR') },
              grid: { color: '#27272A' }, border: { display: false }
            },
            x: {
              ticks: { color: '#52525B', font: { size: 11 }, maxTicksLimit: 8 },
              grid: { display: false }, border: { display: false }
            }
          }
        }
      });
    }, 100);
  }
}
