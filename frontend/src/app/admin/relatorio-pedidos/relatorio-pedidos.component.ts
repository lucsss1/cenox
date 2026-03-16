import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { PicoHorario } from '../../shared/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-relatorio-pedidos',
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

    <div *ngIf="!loading">
      <div class="card" style="padding:20px;margin-bottom:16px;">
        <div class="card-header"><i class="fas fa-clock"></i> Pico de Horário</div>
        <p style="font-size:12px;color:#6B7280;margin-bottom:16px;">
          Volume de pedidos por hora do dia
          <span *ngIf="picoLabel"> — Horário mais movimentado: <strong style="color:#F59E0B;">{{picoLabel}}</strong></span>
        </p>
        <div *ngIf="picoHorario.length === 0" style="text-align:center;color:#6B7280;padding:30px;">Sem dados no período</div>
        <canvas #picoCanvas *ngIf="picoHorario.length > 0" height="120"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar { display:flex;gap:8px;align-items:center;margin-bottom:20px;flex-wrap:wrap; }
  `]
})
export class RelatorioPedidosComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('picoCanvas') picoCanvas!: ElementRef<HTMLCanvasElement>;
  picoHorario: PicoHorario[] = [];
  loading = false;
  inicio = '';
  fim = '';
  picoLabel = '';
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
    this.api.getPicoHorario(this.inicio, this.fim).subscribe({
      next: d => {
        this.picoHorario = d;
        const peak = d.reduce((a, b) => b.quantidade > a.quantidade ? b : a, { hora: 0, quantidade: 0 });
        this.picoLabel = d.length ? `${peak.hora.toString().padStart(2,'0')}:00 – ${(peak.hora+1).toString().padStart(2,'0')}:00` : '';
        this.loading = false;
        if (this.viewReady) setTimeout(() => this.drawChart(), 0);
        else this.pendingDraw = true;
      },
      error: () => { this.loading = false; }
    });
  }

  private drawChart(): void {
    if (!this.picoCanvas || this.picoHorario.length === 0) return;
    this.chart?.destroy();
    const labels = this.picoHorario.map(h => `${h.hora.toString().padStart(2,'0')}:00`);
    const values = this.picoHorario.map(h => h.quantidade);
    const maxQty = Math.max(...values);
    this.chart = new Chart(this.picoCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Pedidos',
          data: values,
          backgroundColor: values.map(v => v === maxQty ? '#F59E0B' : '#3B82F6'),
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
