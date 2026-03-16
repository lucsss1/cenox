import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Dashboard, Insumo, TopPratos } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2><i class="fas fa-chart-pie"></i> Overview</h2>
        <p class="page-subtitle">Visão geral da operação</p>
      </div>
      <div class="header-right">
        <div class="status-pill-live">
          <span class="live-dot"></span>
          Sistema online
        </div>
        <button class="btn btn-ghost btn-sm" (click)="reload()">
          <i class="fas fa-sync" [class.fa-spin]="loading"></i>
          Atualizar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading" *ngIf="loading">
      <div class="spinner"></div>
    </div>

    <ng-container *ngIf="!loading && data">

      <!-- KPI Row -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-card-green">
          <div class="kpi-icon-corner"><i class="fas fa-dollar-sign"></i></div>
          <span class="kpi-label">Faturamento Mensal</span>
          <span class="kpi-value">R$&nbsp;{{data.faturamentoMensal | number:'1.2-2'}}</span>
          <span class="kpi-compare">
            <i class="fas fa-receipt" style="margin-right:4px;"></i>
            {{data.totalPedidosMes}} pedidos no mês
          </span>
        </div>

        <div class="kpi-card kpi-card-blue">
          <div class="kpi-icon-corner"><i class="fas fa-clipboard-list"></i></div>
          <span class="kpi-label">Pedidos Hoje</span>
          <span class="kpi-value">{{pedidosHoje}}</span>
          <span class="kpi-compare">
            <i class="fas fa-calendar" style="margin-right:4px;"></i>
            Total mês: {{data.totalPedidosMes}}
          </span>
        </div>

        <div class="kpi-card"
             [class.kpi-card-red]="alertTotal > 0"
             [class.kpi-card-green]="alertTotal === 0">
          <div class="kpi-icon-corner">
            <i [class]="alertTotal > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-check'"></i>
          </div>
          <span class="kpi-label">Alertas Ativos</span>
          <span class="kpi-value">{{alertTotal}}</span>
          <span class="kpi-compare">
            {{data.insumosAbaixoMinimo}} baixo estoque &bull; {{vencidos.length}} vencidos
          </span>
        </div>

        <div class="kpi-card kpi-card-purple">
          <div class="kpi-icon-corner"><i class="fas fa-shopping-bag"></i></div>
          <span class="kpi-label">Compras no Mês</span>
          <span class="kpi-value">R$&nbsp;{{data.totalComprasMes | number:'1.2-2'}}</span>
          <span class="kpi-compare">
            <i class="fas fa-utensils" style="margin-right:4px;"></i>
            {{data.pratosAtivos}} pratos ativos
          </span>
        </div>
      </div>

      <!-- Main grid -->
      <div class="overview-grid-main">

        <!-- Chart card -->
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="card-section-title">Faturamento Diário</h3>
              <span class="chart-sub">Últimos 30 dias</span>
            </div>
            <div class="chart-legend">
              <span class="legend-dot" style="background:#DC2626;"></span>
              <span>Receita</span>
            </div>
          </div>
          <div class="chart-wrap">
            <canvas #faturamentoChart></canvas>
          </div>
        </div>

        <!-- Alerts card -->
        <div class="card alerts-card">
          <h3 class="card-section-title" style="margin-bottom:16px;">
            <i class="fas fa-bell" style="color:#F59E0B;"></i>
            Alertas Operacionais
          </h3>

          <div class="no-alerts" *ngIf="alertTotal === 0 && data.pratosFoodCostAlto.length === 0">
            <i class="fas fa-check-circle"></i>
            <span>Nenhum alerta no momento</span>
          </div>

          <div class="alert-item alert-danger" *ngIf="vencidos.length > 0">
            <i class="fas fa-times-circle"></i>
            <div>
              <strong>{{vencidos.length}} produto(s) vencido(s)</strong>
              <div class="alert-names">{{vencidosNomes}}</div>
            </div>
            <a routerLink="/admin/estoque/insumos" class="alert-link">Ver</a>
          </div>

          <div class="alert-item alert-warning" *ngIf="data.insumosAbaixoMinimo > 0">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <strong>{{data.insumosAbaixoMinimo}} insumo(s) abaixo do mínimo</strong>
              <div class="alert-names">Reposição necessária</div>
            </div>
            <a routerLink="/admin/estoque/insumos" class="alert-link">Ver</a>
          </div>

          <div class="alert-item alert-purple" *ngIf="data.pratosFoodCostAlto.length > 0">
            <i class="fas fa-percentage"></i>
            <div>
              <strong>{{data.pratosFoodCostAlto.length}} prato(s) com food cost &gt;35%</strong>
              <div class="alert-names">{{foodCostNomes}}</div>
            </div>
            <a routerLink="/admin/cardapio/receitas" class="alert-link">Ver</a>
          </div>
        </div>

      </div>

      <!-- Bottom grid -->
      <div class="overview-grid-bottom">

        <!-- Top Pratos -->
        <div class="card">
          <div class="section-header">
            <h3 class="card-section-title">
              <i class="fas fa-trophy" style="color:#FCD34D;"></i>
              Top 5 Pratos
            </h3>
            <div class="date-range">
              <input type="date" class="form-control date-input" [(ngModel)]="topInicio">
              <span class="date-sep">—</span>
              <input type="date" class="form-control date-input" [(ngModel)]="topFim">
              <button class="btn btn-primary btn-sm icon-btn" (click)="carregarTop()" title="Atualizar">
                <i class="fas fa-sync" [class.fa-spin]="loadingTop"></i>
              </button>
            </div>
          </div>

          <div class="loading" *ngIf="loadingTop" style="padding:24px 0;">
            <div class="spinner"></div>
          </div>

          <div *ngIf="!loadingTop">
            <div class="empty-row" *ngIf="topPratos.length === 0">
              Nenhum prato vendido no período
            </div>
            <div *ngFor="let t of topPratos; let i = index" class="top-row">
              <span class="rank-number" [class.rank-1]="i===0" [class.rank-2]="i===1" [class.rank-3]="i===2">
                {{i+1}}
              </span>
              <span class="top-name">{{t.pratoNome}}</span>
              <span class="top-qty">
                <i class="fas fa-chart-line" style="color:#DC2626;font-size:10px;margin-right:4px;"></i>
                {{t.quantidadeVendida}}
              </span>
            </div>
          </div>
        </div>

        <!-- Pedidos por status -->
        <div class="card">
          <div class="section-header" style="margin-bottom:18px;">
            <h3 class="card-section-title">
              <i class="fas fa-stream" style="color:#3B82F6;"></i>
              Pedidos por Status
            </h3>
          </div>

          <div *ngFor="let s of statusList" class="status-bar-row">
            <span class="status-label">{{s.label}}</span>
            <div class="status-track">
              <div class="status-fill"
                   [style.width]="getStatusPct(s.key) + '%'"
                   [style.background]="s.color">
              </div>
            </div>
            <span class="status-count" [style.color]="s.color">
              {{data.pedidosPorStatus[s.key] || 0}}
            </span>
          </div>

          <div class="card-footer-action">
            <a routerLink="/admin/pedidos" class="btn btn-ghost btn-sm">
              <i class="fas fa-arrow-right"></i> Gerenciar Pedidos
            </a>
            <a routerLink="/admin/kanban" class="btn btn-ghost btn-sm">
              <i class="fas fa-columns"></i> Kanban
            </a>
          </div>
        </div>

      </div>

    </ng-container>
  `,
  styles: [`
    /* Header extras */
    .header-right { display: flex; align-items: center; gap: 10px; }

    .status-pill-live {
      display: flex; align-items: center; gap: 7px;
      padding: 6px 14px; border-radius: 20px;
      border: 1px solid rgba(22,163,74,0.2);
      background: rgba(22,163,74,0.05);
      font-size: 12px; color: #4ADE80;
      font-weight: 500;
    }
    .live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #4ADE80;
      animation: livePulse 2.2s ease-in-out infinite;
    }
    @keyframes livePulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
      50%       { opacity: 0.6; box-shadow: 0 0 0 4px rgba(74,222,128,0); }
    }

    /* Grids */
    .overview-grid-main {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .overview-grid-bottom {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* Chart */
    .chart-card { display: flex; flex-direction: column; }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .chart-sub { font-size: 11.5px; color: #6B7280; margin-top: 2px; display: block; }
    .chart-legend {
      display: flex; align-items: center; gap: 6px;
      font-size: 11.5px; color: #6B7280;
    }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
    .chart-wrap { flex: 1; min-height: 0; }

    /* Alerts */
    .alerts-card {}
    .no-alerts {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 28px 0; gap: 10px; color: #4ADE80;
    }
    .no-alerts i { font-size: 28px; }
    .no-alerts span { font-size: 13px; color: #6B7280; }

    /* Section header */
    .section-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    }
    .date-range { display: flex; align-items: center; gap: 6px; }
    .date-input { width: 130px; padding: 5px 8px !important; font-size: 12px !important; }
    .date-sep { font-size: 11px; color: #4B5563; }
    .icon-btn { width: 30px; height: 30px; padding: 0; justify-content: center; }

    /* Top pratos */
    .empty-row { text-align: center; padding: 24px 0; font-size: 13px; color: #6B7280; }
    .top-row {
      display: flex; align-items: center; gap: 12px;
      padding: 9px 0; border-bottom: 1px solid #141414;
    }
    .top-row:last-child { border-bottom: none; }
    .top-name { flex: 1; font-size: 13.5px; color: #E5E7EB; }
    .top-qty { font-size: 13px; font-weight: 600; color: #9CA3AF; }

    /* Status bars */
    .status-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; }
    .status-label { font-size: 11px; color: #9CA3AF; width: 86px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .status-track { flex: 1; height: 5px; background: #1A1A1A; border-radius: 4px; overflow: hidden; }
    .status-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; min-width: 2px; }
    .status-count { font-size: 13px; font-weight: 600; width: 26px; text-align: right; flex-shrink: 0; }

    .card-footer-action {
      display: flex; gap: 8px; justify-content: flex-end;
      margin-top: 16px; padding-top: 12px;
      border-top: 1px solid #141414;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .overview-grid-main { grid-template-columns: 1fr; }
      .overview-grid-bottom { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .header-right { flex-direction: column; align-items: flex-end; gap: 6px; }
      .date-input { width: 110px; }
    }
  `]
})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('faturamentoChart') chartRef!: ElementRef<HTMLCanvasElement>;

  data: Dashboard | null = null;
  vencidos: Insumo[] = [];
  topPratos: TopPratos[] = [];
  loading = true;
  loadingTop = false;
  topInicio = '';
  topFim = '';

  private chartsReady = false;
  private chart: Chart | null = null;

  statusList = [
    { key: 'PENDENTE',   label: 'Pendente',   color: '#F59E0B' },
    { key: 'EM_PREPARO', label: 'Preparo',    color: '#3B82F6' },
    { key: 'PRONTO',     label: 'Pronto',     color: '#10B981' },
    { key: 'ENTREGUE',   label: 'Entregue',   color: '#6B7280' },
    { key: 'CANCELADO',  label: 'Cancelado',  color: '#DC2626' },
  ];

  constructor(private api: ApiService) {
    const now = new Date();
    this.topFim = now.toISOString().split('T')[0];
    this.topInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  get alertTotal(): number {
    return (this.vencidos?.length ?? 0) + (this.data?.insumosAbaixoMinimo ?? 0);
  }

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (this.data) this.renderChart();
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  reload(): void {
    this.loading = true;
    this.data = null;
    this.load();
  }

  load(): void {
    let done = 0;
    const check = () => {
      done++;
      if (done === 2) {
        this.loading = false;
        if (this.chartsReady) this.renderChart();
      }
    };
    this.api.getDashboard().subscribe({ next: d => { this.data = d; check(); }, error: () => check() });
    this.api.getDashboardVencidos().subscribe({ next: v => { this.vencidos = v; check(); }, error: () => check() });
    this.carregarTop();
  }

  carregarTop(): void {
    if (!this.topInicio || !this.topFim) return;
    this.loadingTop = true;
    this.api.getTopPratos(this.topInicio, this.topFim).subscribe({
      next: tp => { this.topPratos = tp; this.loadingTop = false; },
      error: () => { this.loadingTop = false; }
    });
  }

  get vencidosNomes(): string {
    const names = this.vencidos.slice(0, 3).map(v => v.nome).join(', ');
    return this.vencidos.length > 3 ? names + '…' : names;
  }

  get foodCostNomes(): string {
    if (!this.data) return '';
    const names = this.data.pratosFoodCostAlto.slice(0, 2).map(p => p.nome).join(', ');
    return this.data.pratosFoodCostAlto.length > 2 ? names + '…' : names;
  }

  get pedidosHoje(): number {
    if (!this.data) return 0;
    const hoje = new Date().toISOString().split('T')[0];
    const entry = this.data.faturamentoDiario.find(d => d.data === hoje);
    return entry ? 1 : 0;
  }

  getStatusPct(key: string): number {
    if (!this.data) return 0;
    const total = Object.values(this.data.pedidosPorStatus).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round(((this.data.pedidosPorStatus[key] || 0) / total) * 100);
  }

  private renderChart(): void {
    if (!this.data || !this.chartRef) return;
    setTimeout(() => {
      const ctx = this.chartRef?.nativeElement?.getContext('2d');
      if (!ctx || !this.data) return;
      this.chart?.destroy();

      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(220,38,38,0.15)');
      gradient.addColorStop(1, 'rgba(220,38,38,0)');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.faturamentoDiario.map(d => d.data),
          datasets: [{
            label: 'Faturamento (R$)',
            data: this.data.faturamentoDiario.map(d => d.valor),
            borderColor: '#DC2626',
            backgroundColor: gradient,
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#DC2626',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#161616',
              borderColor: '#262626',
              borderWidth: 1,
              titleColor: '#9CA3AF',
              bodyColor: '#F3F4F6',
              padding: 10,
              callbacks: {
                label: (ctx) => ' R$ ' + Number(ctx.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#4B5563',
                font: { size: 11 },
                callback: (v) => 'R$' + Number(v).toLocaleString('pt-BR')
              },
              grid: { color: '#151515' },
              border: { display: false }
            },
            x: {
              ticks: { color: '#4B5563', font: { size: 11 }, maxTicksLimit: 8 },
              grid: { display: false },
              border: { display: false }
            }
          }
        }
      });
    }, 80);
  }
}
