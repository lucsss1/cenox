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
  styleUrls: ['./overview.component.css'],
  template: `
    <!-- Page Header -->
    <div class="ov-header">
      <div class="ov-header__left">
        <h1 class="ov-title">Operação</h1>
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-label">Ao vivo</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" (click)="reload()">
        <i class="fas fa-sync" [class.fa-spin]="loading"></i>
        Atualizar
      </button>
    </div>

    <!-- Loading skeletons -->
    <div class="ov-skeleton" *ngIf="loading">
      <div class="sk-strip"></div>
      <div class="sk-kpis">
        <div class="sk-kpi"></div><div class="sk-kpi"></div>
        <div class="sk-kpi"></div><div class="sk-kpi"></div>
      </div>
      <div class="sk-body">
        <div class="sk-chart"></div>
        <div class="sk-alerts"></div>
      </div>
    </div>

    <ng-container *ngIf="!loading && data">

      <!-- ZONE AGORA — live strip -->
      <div class="zone-agora">
        <div class="zone-agora__head">
          <span class="zone-label">Agora</span>
        </div>
        <div class="zone-agora__stats">
          <div class="zstat zstat--new">
            <span class="zstat__val">{{data.pedidosPorStatus['PENDENTE'] || 0}}</span>
            <span class="zstat__label">Aguardando</span>
          </div>
          <div class="zstat-sep"></div>
          <div class="zstat zstat--prep">
            <span class="zstat__val">{{data.pedidosPorStatus['EM_PREPARO'] || 0}}</span>
            <span class="zstat__label">Preparando</span>
          </div>
          <div class="zstat-sep"></div>
          <div class="zstat zstat--ready">
            <span class="zstat__val">{{data.pedidosPorStatus['PRONTO'] || 0}}</span>
            <span class="zstat__label">Prontos</span>
          </div>
          <div class="zstat-sep"></div>
          <div class="zstat zstat--alert" *ngIf="alertTotal > 0">
            <span class="zstat__val">{{alertTotal}}</span>
            <span class="zstat__label">Alertas</span>
          </div>
          <div class="zone-agora__cta">
            <a routerLink="/admin/kanban" class="btn btn-primary btn-sm">
              Ver pedidos em aberto <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Critical alert banner -->
      <div class="alert-banner alert-banner--critical" *ngIf="vencidos.length > 0">
        <i class="fas fa-times-circle alert-banner__icon"></i>
        <div class="alert-banner__text">
          <strong class="alert-banner__title">{{vencidos.length}} produto(s) vencido(s) — ação necessária</strong>
          <span class="alert-banner__body">{{vencidosNomes}}</span>
        </div>
        <a routerLink="/admin/estoque/insumos" class="alert-banner__cta">Resolver</a>
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid" style="margin-bottom:20px;">
        <div class="kpi-card kpi-card-green">
          <div class="kpi-icon-corner"><i class="fas fa-dollar-sign"></i></div>
          <span class="kpi-label">Faturamento Mensal</span>
          <span class="kpi-value" style="font-family:'Poppins',sans-serif;">R$&nbsp;{{data.faturamentoMensal | number:'1.2-2'}}</span>
          <span class="kpi-compare">{{data.totalPedidosMes}} pedidos no mês</span>
        </div>

        <div class="kpi-card kpi-card-blue">
          <div class="kpi-icon-corner"><i class="fas fa-clipboard-list"></i></div>
          <span class="kpi-label">Pedidos Hoje</span>
          <span class="kpi-value" style="font-family:'Poppins',sans-serif;">{{pedidosHoje}}</span>
          <span class="kpi-compare">Total mês: {{data.totalPedidosMes}}</span>
        </div>

        <div class="kpi-card"
             [class.kpi-card-red]="alertTotal > 0"
             [class.kpi-card-green]="alertTotal === 0">
          <div class="kpi-icon-corner">
            <i [class]="alertTotal > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-check'"></i>
          </div>
          <span class="kpi-label">Alertas Ativos</span>
          <span class="kpi-value" style="font-family:'Poppins',sans-serif;">{{alertTotal}}</span>
          <span class="kpi-compare">{{data.insumosAbaixoMinimo}} baixo estoque &bull; {{vencidos.length}} vencidos</span>
        </div>

        <div class="kpi-card kpi-card-purple">
          <div class="kpi-icon-corner"><i class="fas fa-shopping-bag"></i></div>
          <span class="kpi-label">Compras no Mês</span>
          <span class="kpi-value" style="font-family:'Poppins',sans-serif;">R$&nbsp;{{data.totalComprasMes | number:'1.2-2'}}</span>
          <span class="kpi-compare">{{data.pratosAtivos}} pratos ativos</span>
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
              <span class="legend-dot" style="background:#D4531A;"></span>
              <span>Receita</span>
            </div>
          </div>
          <div class="chart-wrap">
            <canvas #faturamentoChart></canvas>
          </div>
        </div>

        <!-- Alerts card -->
        <div class="card">
          <h3 class="card-section-title" style="margin-bottom:16px;">
            <i class="fas fa-bell" style="color:#F59E0B;"></i>
            Alertas Operacionais
          </h3>

          <div class="no-alerts" *ngIf="alertTotal === 0 && data.pratosFoodCostAlto.length === 0">
            <i class="fas fa-check-circle"></i>
            <span>Operação saudável. Nenhum alerta.</span>
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
              <span class="rank-number" [class.rank-1]="i===0" [class.rank-2]="i===1" [class.rank-3]="i===2">{{i+1}}</span>
              <span class="top-name">{{t.pratoNome}}</span>
              <span class="top-qty">{{t.quantidadeVendida}}</span>
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
              <div class="status-fill" [style.width]="getStatusPct(s.key) + '%'" [style.background]="s.color"></div>
            </div>
            <span class="status-count" [style.color]="s.color" style="font-family:'Poppins',sans-serif;">
              {{data.pedidosPorStatus[s.key] || 0}}
            </span>
          </div>

          <div class="card-footer-action">
            <a routerLink="/admin/kanban" class="btn btn-ghost btn-sm">
              <i class="fas fa-columns"></i> Ver no Kanban
            </a>
          </div>
        </div>

      </div>

    </ng-container>
  `
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
      gradient.addColorStop(0, 'rgba(212,83,26,0.18)');
      gradient.addColorStop(1, 'rgba(212,83,26,0)');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.data.faturamentoDiario.map(d => d.data),
          datasets: [{
            label: 'Faturamento (R$)',
            data: this.data.faturamentoDiario.map(d => d.valor),
            borderColor: '#D4531A',
            backgroundColor: gradient,
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#D4531A',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#FFFFFF',
              borderColor: '#E0D8D0',
              borderWidth: 1,
              titleColor: '#9A9A9A',
              bodyColor: '#1A1A1A',
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
                color: '#9A9A9A',
                font: { size: 11 },
                callback: (v) => 'R$' + Number(v).toLocaleString('pt-BR')
              },
              grid: { color: '#EDE8E0' },
              border: { display: false }
            },
            x: {
              ticks: { color: '#9A9A9A', font: { size: 11 }, maxTicksLimit: 8 },
              grid: { display: false },
              border: { display: false }
            }
          }
        }
      });
    }, 80);
  }
}
