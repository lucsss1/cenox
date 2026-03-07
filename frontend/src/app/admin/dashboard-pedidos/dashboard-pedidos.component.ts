import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Dashboard } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/admin/dashboard" class="back-link"><i class="fas fa-arrow-left"></i> Dashboards</a>
        <h2><i class="fas fa-clipboard-list"></i> Pedidos</h2>
        <p class="page-subtitle">Distribuicao de pedidos por status</p>
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading && data">
      <div class="kpi-grid" style="margin-bottom:20px;">
        <div class="kpi-card kpi-card-blue">
          <div class="kpi-icon-corner"><i class="fas fa-clipboard-list"></i></div>
          <span class="kpi-label">PEDIDOS NO MES</span>
          <span class="kpi-value">{{data.totalPedidosMes}}</span>
        </div>
        <div class="kpi-card kpi-card-green">
          <div class="kpi-icon-corner"><i class="fas fa-dollar-sign"></i></div>
          <span class="kpi-label">FATURAMENTO MENSAL</span>
          <span class="kpi-value">R$ {{data.faturamentoMensal | number:'1.2-2'}}</span>
        </div>
      </div>

      <div class="card" style="padding:20px;">
        <div style="margin-bottom:16px;">
          <h3 style="font-size:15px;font-weight:600;color:#F3F4F6;">Pedidos por Status</h3>
          <span style="font-size:12px;color:#6B7280;">Distribuicao atual</span>
        </div>
        <div style="max-width:400px;margin:0 auto;">
          <canvas #statusChart></canvas>
        </div>
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
export class DashboardPedidosComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') chartRef!: ElementRef<HTMLCanvasElement>;
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

      const statusData = this.data.pedidosPorStatus;
      const labels = Object.keys(statusData);
      const valores = Object.values(statusData);
      const colors = ['#4ADE80', '#DC2626', '#FCD34D', '#6B7280', '#60A5FA'];

      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: valores,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0, spacing: 2
          }]
        },
        options: {
          responsive: true,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#9CA3AF', padding: 16,
                usePointStyle: true, pointStyle: 'circle',
                font: { size: 12 }
              }
            }
          }
        }
      });
    }, 100);
  }
}
