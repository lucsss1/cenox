import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { Dashboard, TopPratos } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-header">
      <div>
        <h2>Dashboard</h2>
        <p class="dash-welcome">Bem-vindo de volta &mdash; {{todayDate}}</p>
      </div>
      <div class="system-status">
        <span class="status-dot"></span> Sistema online
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading && data">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-card-green">
          <div class="kpi-icon-corner"><i class="fas fa-dollar-sign"></i></div>
          <span class="kpi-label">Faturamento Mensal</span>
          <span class="kpi-value">R$ {{data.faturamentoMensal | number:'1.2-2'}}</span>
          <span class="kpi-compare">Periodo atual</span>
        </div>
        <div class="kpi-card kpi-card-blue">
          <div class="kpi-icon-corner"><i class="fas fa-clipboard-list"></i></div>
          <span class="kpi-label">Pedidos no Mes</span>
          <span class="kpi-value">{{data.totalPedidosMes}}</span>
          <span class="kpi-compare">Total acumulado</span>
        </div>
        <div class="kpi-card kpi-card-purple">
          <div class="kpi-icon-corner"><i class="fas fa-hamburger"></i></div>
          <span class="kpi-label">Pratos Ativos</span>
          <span class="kpi-value">{{data.pratosAtivos}}</span>
          <span class="kpi-compare">No cardapio</span>
        </div>
        <div class="kpi-card" [ngClass]="data.insumosAbaixoMinimo > 0 ? 'kpi-card-red' : 'kpi-card-green'">
          <div class="kpi-icon-corner"><i class="fas fa-exclamation-triangle"></i></div>
          <span class="kpi-label">Estoque Baixo</span>
          <span class="kpi-value">{{data.insumosAbaixoMinimo}}</span>
          <span class="kpi-compare">{{data.insumosAbaixoMinimo > 0 ? 'Requer atencao' : 'Tudo em ordem'}}</span>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3>Faturamento Diario</h3>
              <span class="chart-subtitle">Ultimos 30 dias</span>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot legend-red"></span> Receita</span>
            </div>
          </div>
          <canvas #faturamentoChart></canvas>
        </div>
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3>Pedidos por Status</h3>
              <span class="chart-subtitle">Distribuicao atual</span>
            </div>
          </div>
          <canvas #statusChart></canvas>
        </div>
      </div>

      <!-- Top 5 Pratos -->
      <div class="card top-card">
        <div class="top-header">
          <div class="top-title">
            <i class="fas fa-trophy trophy-icon"></i>
            <div>
              <h3>Top 5 Pratos Mais Vendidos</h3>
              <span class="chart-subtitle">Ranking por periodo</span>
            </div>
          </div>
          <div class="top-filters">
            <input type="date" class="form-control date-input" [(ngModel)]="topInicio">
            <span class="date-sep">&mdash;</span>
            <input type="date" class="form-control date-input" [(ngModel)]="topFim">
            <button class="btn btn-primary btn-sm" (click)="carregarTopPratos()">
              <i class="fas fa-filter"></i> Filtrar
            </button>
          </div>
        </div>
        <div class="table-container" *ngIf="topPratos.length > 0">
          <table>
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                <th>Prato</th>
                <th>Vendas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of topPratos; let i = index">
                <td>
                  <span class="rank-number" [ngClass]="{'rank-1': i===0, 'rank-2': i===1}">{{i + 1}}</span>
                </td>
                <td><strong>{{t.pratoNome}}</strong></td>
                <td>
                  <span class="sales-count">
                    <i class="fas fa-chart-line"></i>
                    {{t.quantidadeVendida}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="topPratos.length === 0" class="empty-state compact-empty">
          <p>Nenhum prato vendido no periodo</p>
        </div>
      </div>

      <!-- Alerts Section -->
      <div class="alerts-row" *ngIf="data.pratosFoodCostAlto.length > 0 || data.insumosEstoqueBaixo.length > 0">
        <div class="card" *ngIf="data.pratosFoodCostAlto.length > 0">
          <div class="card-header alert-header-danger"><i class="fas fa-exclamation-circle"></i> Pratos com Food Cost > 35%</div>
          <table>
            <thead><tr><th>Prato</th><th>Food Cost</th><th>Custo</th><th>Preco</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of data.pratosFoodCostAlto">
                <td><strong>{{p.nome}}</strong></td>
                <td><span class="badge badge-danger">{{p.foodCost | number:'1.1-1'}}%</span></td>
                <td>R$ {{p.custoProducao | number:'1.2-2'}}</td>
                <td>R$ {{p.precoVenda | number:'1.2-2'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card" *ngIf="data.insumosEstoqueBaixo.length > 0">
          <div class="card-header alert-header-warning"><i class="fas fa-boxes"></i> Insumos com Estoque Baixo</div>
          <table>
            <thead><tr><th>Insumo</th><th>Estoque</th><th>Minimo</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of data.insumosEstoqueBaixo">
                <td><strong>{{i.nome}}</strong></td>
                <td><span class="badge badge-danger">{{i.quantidadeEstoque | number:'1.3-3'}} {{i.unidadeMedida}}</span></td>
                <td>{{i.estoqueMinimo | number:'1.3-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: var(--space-6);
    }
    .dash-header h2 {
      font-size: 22px; font-weight: 700; color: var(--text-primary);
    }
    .dash-welcome { font-size: 13px; color: var(--text-tertiary); margin-top: 2px; }
    .system-status {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: var(--radius-full);
      border: 1px solid rgba(16,185,129,0.2); background: rgba(16,185,129,0.05);
      font-size: 12px; color: #6EE7B7; font-weight: 500;
    }
    .status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--success); animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .charts-grid {
      display: grid; grid-template-columns: 2fr 1fr;
      gap: var(--space-4); margin-bottom: var(--space-5);
    }
    .chart-card { padding: var(--space-5); }
    .chart-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: var(--space-4);
    }
    .chart-header h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .chart-subtitle { font-size: 12px; color: var(--text-tertiary); }
    .chart-legend { display: flex; gap: 12px; align-items: center; }
    .legend-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-secondary);
    }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-red { background: var(--primary); }

    .top-card { padding: var(--space-5); margin-bottom: var(--space-5); }
    .top-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3);
    }
    .top-title { display: flex; align-items: center; gap: 10px; }
    .top-title h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .trophy-icon { color: #FCD34D; }
    .top-filters { display: flex; gap: var(--space-2); align-items: center; }
    .date-input {
      width: auto; padding: 5px 10px; font-size: 12px;
      background: var(--bg-surface); border-color: var(--border);
    }
    .date-sep { color: var(--text-muted); font-size: 12px; }
    .sales-count {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 13px; color: var(--text-secondary);
    }
    .sales-count i { color: var(--primary); font-size: 11px; }

    .compact-empty { padding: var(--space-8); }

    .alerts-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: var(--space-4); margin-top: var(--space-5);
    }
    .alert-header-danger { color: #FCA5A5; }
    .alert-header-warning { color: #FCD34D; }

    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .top-header { flex-direction: column; align-items: flex-start; }
      .alerts-row { grid-template-columns: 1fr; }
      .dash-header { flex-direction: column; gap: var(--space-3); }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('faturamentoChart') faturamentoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusRef!: ElementRef<HTMLCanvasElement>;

  data: Dashboard | null = null;
  loading = true;
  private chartsReady = false;
  topPratos: TopPratos[] = [];
  topInicio = '';
  topFim = '';
  todayDate = '';

  constructor(private api: ApiService) {
    const now = new Date();
    this.topFim = now.toISOString().split('T')[0];
    this.topInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const dias = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado'];
    const meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    this.todayDate = `${dias[now.getDay()]}, ${now.getDate().toString().padStart(2, '0')} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
  }

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.topPratos = d.topPratos || [];
        this.loading = false;
        if (this.chartsReady) this.renderCharts();
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (this.data) this.renderCharts();
  }

  carregarTopPratos(): void {
    if (!this.topInicio || !this.topFim) return;
    this.api.getTopPratos(this.topInicio, this.topFim).subscribe({
      next: (tp) => { this.topPratos = tp; }
    });
  }

  private renderCharts(): void {
    setTimeout(() => {
      this.renderFaturamentoChart();
      this.renderStatusChart();
    }, 100);
  }

  private renderFaturamentoChart(): void {
    if (!this.faturamentoRef || !this.data) return;
    const ctx = this.faturamentoRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.data.faturamentoDiario.map(d => d.data);
    const valores = this.data.faturamentoDiario.map(d => d.valor);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Faturamento (R$)',
          data: valores,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220,38,38,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#52525B', font: { size: 11 }, callback: (v) => 'R$' + Number(v).toLocaleString('pt-BR') },
            grid: { color: '#27272A' },
            border: { display: false }
          },
          x: {
            ticks: { color: '#52525B', font: { size: 11 }, maxTicksLimit: 8 },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  private renderStatusChart(): void {
    if (!this.statusRef || !this.data) return;
    const ctx = this.statusRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusData = this.data.pedidosPorStatus;
    const labels = Object.keys(statusData);
    const valores = Object.values(statusData);
    const colors = ['#10B981', '#EF4444', '#F59E0B', '#71717A', '#3B82F6'];

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#A1A1AA',
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 12 }
            }
          }
        }
      }
    });
  }
}
