import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { TopPratos } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard-top-pratos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/admin/dashboard" class="back-link"><i class="fas fa-arrow-left"></i> Dashboards</a>
        <h2><i class="fas fa-trophy trophy-icon"></i> Top 5 Pratos Mais Vendidos</h2>
        <p class="page-subtitle">Ranking por periodo</p>
      </div>
    </div>

    <div class="card content-card">
      <div class="filter-row">
        <input type="date" class="form-control date-input" [(ngModel)]="topInicio">
        <span class="date-separator">&mdash;</span>
        <input type="date" class="form-control date-input" [(ngModel)]="topFim">
        <button class="btn btn-primary btn-sm" (click)="carregar()">
          <i class="fas fa-filter"></i> Filtrar
        </button>
      </div>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

      <table *ngIf="!loading && topPratos.length > 0">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>PRATO</th>
            <th>VENDAS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of topPratos; let i = index">
            <td>
              <span class="rank-number" [ngClass]="{'rank-1': i===0, 'rank-2': i===1}">{{i + 1}}</span>
            </td>
            <td><strong>{{t.pratoNome}}</strong></td>
            <td>
              <span class="sales-value">
                <i class="fas fa-chart-line sales-icon"></i>
                {{t.quantidadeVendida}}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!loading && topPratos.length === 0" class="empty-state">
        Nenhum prato vendido no periodo selecionado.
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      font-size: 12px; color: #6B7280; text-decoration: none;
      display: inline-flex; align-items: center; gap: 6px;
      margin-bottom: 4px; transition: color 0.2s;
    }
    .back-link:hover { color: var(--text-primary); }
    .trophy-icon { color: #FCD34D; }
    .content-card { padding: 20px; }
    .filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .date-input { width: auto; padding: 6px 10px; font-size: 13px; }
    .date-separator { color: var(--text-muted); font-size: 12px; }
    .rank-col { width: 50px; }
    .sales-value { display: inline-flex; align-items: center; gap: 4px; }
    .sales-icon { color: var(--primary); font-size: 11px; }
    .empty-state { text-align: center; padding: 30px; color: var(--text-tertiary); }
  `]
})
export class DashboardTopPratosComponent implements OnInit {
  topPratos: TopPratos[] = [];
  topInicio = '';
  topFim = '';
  loading = true;

  constructor(private api: ApiService) {
    const now = new Date();
    this.topFim = now.toISOString().split('T')[0];
    this.topInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    if (!this.topInicio || !this.topFim) return;
    this.loading = true;
    this.api.getTopPratos(this.topInicio, this.topFim).subscribe({
      next: (tp) => { this.topPratos = tp; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
