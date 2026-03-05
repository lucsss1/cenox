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
        <h2><i class="fas fa-chart-line"></i> Dashboard</h2>
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
          <span class="kpi-label">FATURAMENTO MENSAL</span>
          <span class="kpi-value">R$ {{data.faturamentoMensal | number:'1.2-2'}}</span>
          <span class="kpi-compare">&mdash; Sem comparativo</span>
        </div>
        <div class="kpi-card kpi-card-blue">
          <div class="kpi-icon-corner"><i class="fas fa-clipboard-list"></i></div>
          <span class="kpi-label">PEDIDOS NO MES</span>
          <span class="kpi-value">{{data.totalPedidosMes}}</span>
          <span class="kpi-compare">&mdash; Sem comparativo</span>
        </div>
        <div class="kpi-card kpi-card-purple">
          <div class="kpi-icon-corner"><i class="fas fa-hamburger"></i></div>
          <span class="kpi-label">PRATOS ATIVOS</span>
          <span class="kpi-value">{{data.pratosAtivos}}</span>
          <span class="kpi-compare">&mdash; Sem comparativo</span>
        </div>
        <div class="kpi-card" [class]="data.insumosAbaixoMinimo > 0 ? 'kpi-card kpi-card-red' : 'kpi-card kpi-card-green'">
          <div class="kpi-icon-corner"><i class="fas fa-exclamation-triangle"></i></div>
          <span class="kpi-label">INSUMOS ESTOQUE BAIXO</span>
          <span class="kpi-value">{{data.insumosAbaixoMinimo}}</span>
          <span class="kpi-compare">&mdash; Sem comparativo</span>
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
            <i class="fas fa-trophy" style="color:#FCD34D;"></i>
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
                <th>PRATO</th>
                <th>VENDAS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of topPratos; let i = index">
                <td>
                  <span class="rank-number" [ngClass]="{'rank-1': i===0, 'rank-2': i===1}">{{i + 1}}</span>
                </td>
                <td><strong style="color:#F3F4F6;">{{t.pratoNome}}</strong></td>
                <td>
                  <span style="display:inline-flex;align-items:center;gap:4px;">
                    <i class="fas fa-chart-line" style="color:var(--primary);font-size:11px;"></i>
                    {{t.quantidadeVendida}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="topPratos.length === 0" class="empty-state" style="padding:30px;">
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
                <td><strong style="color:#F3F4F6;">{{p.nome}}</strong></td>
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
                <td><strong style="color:#F3F4F6;">{{i.nome}}</strong></td>
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
      margin-bottom: 24px;
    }
    .dash-header h2 {
      font-size: 22px; font-weight: 700; color: #F9FAFB;
      display: flex; align-items: center; gap: 10px;
    }
    .dash-header h2 i { color: var(--primary); font-size: 18px; }
    .dash-welcome { font-size: 13px; color: #6B7280; margin-top: 2px; }
    .system-status {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 20px;
      border: 1px solid rgba(22,163,74,0.2); background: rgba(22,163,74,0.05);
      font-size: 12px; color: #4ADE80; font-weight: 500;
    }
    .status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ADE80; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .charts-grid {
      display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;
    }
    .chart-card { padding: 20px; }
    .chart-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
    }
    .chart-header h3 { font-size: 15px; font-weight: 600; color: #F3F4F6; }
    .chart-subtitle { font-size: 12px; color: #6B7280; }
    .chart-legend { display: flex; gap: 12px; align-items: center; }
    .legend-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: #9CA3AF;
    }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-red { background: var(--primary); }

    .top-card { padding: 20px; margin-bottom: 20px; }
    .top-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
    }
    .top-title { display: flex; align-items: center; gap: 10px; }
    .top-title h3 { font-size: 15px; font-weight: 600; color: #F3F4F6; }
    .top-filters {
      display: flex; gap: 8px; align-items: center;
    }
    .date-input {
      width: auto; padding: 6px 10px; font-size: 12px;
      background: var(--bg-surface); border-color: #2A2A2A;
    }
    .date-sep { color: #555; font-size: 12px; }

    .alerts-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 16px; margin-top: 20px;
    }
    .alert-header-danger { color: #FCA5A5; }
    .alert-header-warning { color: #FCD34D; }

    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .top-header { flex-direction: column; align-items: flex-start; }
      .alerts-row { grid-template-columns: 1fr; }
      .dash-header { flex-direction: column; gap: 12px; }
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
      next: (tp) => {
        this.topPratos = tp;
      }
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
          backgroundColor: 'rgba(220,38,38,0.08)',
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
            ticks: { color: '#555', font: { size: 11 }, callback: (v) => 'R$' + Number(v).toLocaleString('pt-BR') },
            grid: { color: '#1A1A1A' },
            border: { display: false }
          },
          x: {
            ticks: { color: '#555', font: { size: 11 }, maxTicksLimit: 8 },
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
    const colors = ['#4ADE80', '#DC2626', '#FCD34D', '#6B7280', '#60A5FA'];

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
              color: '#9CA3AF',
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
