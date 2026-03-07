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
      <div class="kpi-grid" style="margin-bottom:20px;">
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

      <div class="card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <div>
            <h3 style="font-size:15px;font-weight:600;color:#F3F4F6;">Faturamento Diario</h3>
            <span style="font-size:12px;color:#6B7280;">Ultimos 30 dias</span>
          </div>
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#9CA3AF;">
              <span style="width:8px;height:8px;border-radius:50%;background:var(--primary);"></span> Receita
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
    .back-link:hover { color: #E5E7EB; }
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
              ticks: { color: '#555', font: { size: 11 }, callback: (v) => 'R$' + Number(v).toLocaleString('pt-BR') },
              grid: { color: '#1A1A1A' }, border: { display: false }
            },
            x: {
              ticks: { color: '#555', font: { size: 11 }, maxTicksLimit: 8 },
              grid: { display: false }, border: { display: false }
            }
          }
        }
      });
    }, 100);
  }
}
