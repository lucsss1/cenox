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
    <h2 class="dash-title"><i class="fas fa-chart-line"></i> Dashboard</h2>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading && data">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-green">
          <div class="kpi-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Faturamento Mensal</span>
            <span class="kpi-value">R$ {{data.faturamentoMensal | number:'1.2-2'}}</span>
          </div>
        </div>
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon"><i class="fas fa-clipboard-list"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Pedidos no Mes</span>
            <span class="kpi-value">{{data.totalPedidosMes}}</span>
          </div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-icon"><i class="fas fa-hamburger"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Pratos Ativos</span>
            <span class="kpi-value">{{data.pratosAtivos}}</span>
          </div>
        </div>
        <div class="kpi-card" [class]="data.insumosAbaixoMinimo > 0 ? 'kpi-red' : 'kpi-green'">
          <div class="kpi-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Insumos Estoque Baixo</span>
            <span class="kpi-value">{{data.insumosAbaixoMinimo}}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <div class="card">
          <div class="card-header">Faturamento Diario (ultimos 30 dias)</div>
          <canvas #faturamentoChart></canvas>
        </div>
        <div class="card">
          <div class="card-header">Pedidos por Status</div>
          <canvas #statusChart></canvas>
        </div>
      </div>

      <!-- Top 5 + Alerts Row -->
      <div class="charts-grid">
        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
            <span><i class="fas fa-trophy" style="color:#FCD34D;"></i> Top 5 Pratos Mais Vendidos</span>
            <div style="display:flex;gap:6px;align-items:center;">
              <input type="date" class="form-control" [(ngModel)]="topInicio" style="width:auto;padding:4px 8px;font-size:12px;">
              <input type="date" class="form-control" [(ngModel)]="topFim" style="width:auto;padding:4px 8px;font-size:12px;">
              <button class="btn btn-primary btn-sm" (click)="carregarTopPratos()">Filtrar</button>
            </div>
          </div>
          <canvas #topPratosChart></canvas>
          <p *ngIf="topPratos.length === 0" style="text-align:center;color:var(--gray-500);padding:20px;">Nenhum prato vendido no periodo</p>
        </div>
        <div class="card" *ngIf="data.pratosFoodCostAlto.length > 0">
          <div class="card-header alert-header-danger"><i class="fas fa-exclamation-circle"></i> Pratos com Food Cost > 35%</div>
          <table>
            <thead><tr><th>Prato</th><th>Food Cost</th><th>Custo</th><th>Preco</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of data.pratosFoodCostAlto">
                <td>{{p.nome}}</td>
                <td><span class="badge badge-danger">{{p.foodCost | number:'1.1-1'}}%</span></td>
                <td>R$ {{p.custoProducao | number:'1.2-2'}}</td>
                <td>R$ {{p.precoVenda | number:'1.2-2'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alerts -->
      <div class="alerts-grid" *ngIf="data.insumosEstoqueBaixo.length > 0">
        <div class="card">
          <div class="card-header alert-header-warning"><i class="fas fa-boxes"></i> Insumos com Estoque Baixo</div>
          <table>
            <thead><tr><th>Insumo</th><th>Estoque</th><th>Minimo</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of data.insumosEstoqueBaixo">
                <td>{{i.nome}}</td>
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
    .dash-title { margin-bottom: 24px; color: #F9FAFB; font-weight: 700; }
    .dash-title i { color: #DC2626; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      display: flex; align-items: center; gap: 16px; padding: 22px;
      border-radius: 14px; color: white; border: 1px solid #222;
    }
    .kpi-green { background: linear-gradient(135deg, #111 0%, #0A2E1A 100%); border-color: #16A34A; }
    .kpi-green .kpi-icon { color: #4ADE80; }
    .kpi-blue { background: linear-gradient(135deg, #111 0%, #0A1A2E 100%); border-color: #2563EB; }
    .kpi-blue .kpi-icon { color: #60A5FA; }
    .kpi-purple { background: linear-gradient(135deg, #111 0%, #1A0A2E 100%); border-color: #7C3AED; }
    .kpi-purple .kpi-icon { color: #A78BFA; }
    .kpi-red { background: linear-gradient(135deg, #111 0%, #2E0A0A 100%); border-color: #DC2626; }
    .kpi-red .kpi-icon { color: #FCA5A5; }
    .kpi-icon { font-size: 30px; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-label { font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-value { font-size: 26px; font-weight: 700; margin-top: 2px; }

    .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
    .alerts-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .alert-header-danger { color: #FCA5A5; }
    .alert-header-warning { color: #FCD34D; }

    @media (max-width: 768px) {
      .charts-grid, .alerts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('faturamentoChart') faturamentoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topPratosChart') topPratosRef!: ElementRef<HTMLCanvasElement>;

  data: Dashboard | null = null;
  loading = true;
  private chartsReady = false;
  private topChart: Chart | null = null;
  topPratos: TopPratos[] = [];
  topInicio = '';
  topFim = '';

  constructor(private api: ApiService) {
    const now = new Date();
    this.topFim = now.toISOString().split('T')[0];
    this.topInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
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
        this.renderTopPratosChart();
      }
    });
  }

  private renderCharts(): void {
    setTimeout(() => {
      this.renderFaturamentoChart();
      this.renderStatusChart();
      this.renderTopPratosChart();
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
          backgroundColor: 'rgba(220,38,38,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#6B7280' }, grid: { color: '#222' } },
          x: { ticks: { color: '#6B7280' }, grid: { color: '#222' } }
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
    const colors = ['#FCD34D', '#60A5FA', '#4ADE80', '#DC2626', '#F87171'];

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: colors.slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF' } } }
      }
    });
  }

  private renderTopPratosChart(): void {
    if (!this.topPratosRef || this.topPratos.length === 0) return;
    const ctx = this.topPratosRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.topChart) this.topChart.destroy();

    const labels = this.topPratos.map(t => t.pratoNome);
    const valores = this.topPratos.map(t => t.quantidadeVendida);
    const colors = ['#DC2626', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'];

    this.topChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Qtd Vendida',
          data: valores,
          backgroundColor: colors.slice(0, labels.length),
          borderRadius: 6,
          barThickness: 40
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { color: '#6B7280', stepSize: 1 }, grid: { color: '#222' } },
          y: { ticks: { color: '#9CA3AF' }, grid: { display: false } }
        }
      }
    });
  }
}
