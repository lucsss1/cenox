import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { RelatorioFinanceiro } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-relatorio-cardapio',
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
      <div class="card" style="padding:20px;margin-bottom:16px;">
        <div class="card-header"><i class="fas fa-chart-bar"></i> Top 5 vs Menos Vendidos</div>
        <canvas #chartCanvas height="100"></canvas>
      </div>

      <!-- Food Cost Altos -->
      <div class="card" *ngIf="data.topPratos.length > 0 || data.pioresPratos.length > 0">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
          <div>
            <div class="card-header" style="color:#FCD34D;"><i class="fas fa-star"></i> Mais Vendidos</div>
            <table>
              <thead><tr><th>#</th><th>Prato</th><th>Qtd</th></tr></thead>
              <tbody>
                <tr *ngFor="let t of data.topPratos; let i=index">
                  <td style="color:#F59E0B;font-weight:700;">{{i+1}}</td>
                  <td style="color:#E5E7EB;">{{t.pratoNome}}</td>
                  <td>{{t.quantidadeVendida}}</td>
                </tr>
                <tr *ngIf="data.topPratos.length===0"><td colspan="3" style="color:#6B7280;text-align:center;">Sem dados</td></tr>
              </tbody>
            </table>
          </div>
          <div style="border-left:1px solid #1A1A1A;">
            <div class="card-header" style="color:#FCA5A5;"><i class="fas fa-exclamation-triangle"></i> Menos Vendidos</div>
            <table>
              <thead><tr><th>Prato</th><th>Qtd</th></tr></thead>
              <tbody>
                <tr *ngFor="let t of data.pioresPratos">
                  <td style="color:#E5E7EB;">{{t.pratoNome}}</td>
                  <td>{{t.quantidadeVendida}}</td>
                </tr>
                <tr *ngIf="data.pioresPratos.length===0"><td colspan="2" style="color:#6B7280;text-align:center;">Sem dados</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar { display:flex;gap:8px;align-items:center;margin-bottom:20px;flex-wrap:wrap; }
  `]
})
export class RelatorioCardapioComponent implements OnInit, AfterViewInit, OnDestroy {
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
    const all = [...this.data.topPratos, ...this.data.pioresPratos.filter(p => !this.data!.topPratos.some(t => t.pratoId === p.pratoId))];
    const labels = all.map(t => t.pratoNome);
    const values = all.map(t => t.quantidadeVendida);
    const topIds = new Set(this.data.topPratos.map(t => t.pratoId));
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vendas',
          data: values,
          backgroundColor: all.map(t => topIds.has(t.pratoId) ? '#10B981' : '#EF4444'),
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#6B7280' }, grid: { color: '#1A1A1A' } },
          y: { ticks: { color: '#6B7280', stepSize: 1 }, grid: { color: '#1A1A1A' } }
        }
      }
    });
  }
}
