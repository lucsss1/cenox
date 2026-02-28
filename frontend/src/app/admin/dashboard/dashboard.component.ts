import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { Dashboard } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 style="margin-bottom:20px;"><i class="fas fa-chart-line"></i> Dashboard</h2>

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

      <!-- Alerts -->
      <div class="alerts-grid">
        <div class="card" *ngIf="data.pratosFoodCostAlto.length > 0">
          <div class="card-header" style="color:var(--danger);"><i class="fas fa-exclamation-circle"></i> Pratos com Food Cost > 35%</div>
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

        <div class="card" *ngIf="data.insumosEstoqueBaixo.length > 0">
          <div class="card-header" style="color:var(--warning);"><i class="fas fa-boxes"></i> Insumos com Estoque Baixo</div>
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
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .kpi-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; color: white; }
    .kpi-green { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .kpi-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .kpi-purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .kpi-red { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .kpi-icon { font-size: 28px; opacity: 0.8; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-label { font-size: 12px; opacity: 0.9; }
    .kpi-value { font-size: 24px; font-weight: 700; }

    .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px; }
    .alerts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    @media (max-width: 768px) {
      .charts-grid, .alerts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('faturamentoChart') faturamentoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusRef!: ElementRef<HTMLCanvasElement>;

  data: Dashboard | null = null;
  loading = true;
  private chartsReady = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
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
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
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
    const colors = ['#f59e0b', '#3b82f6', '#22c55e', '#10b981', '#ef4444'];

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
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
