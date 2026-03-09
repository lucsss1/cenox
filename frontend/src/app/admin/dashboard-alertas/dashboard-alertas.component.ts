import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Dashboard, Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard-alertas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/admin/dashboard" class="back-link"><i class="fas fa-arrow-left"></i> Dashboards</a>
        <h2><i class="fas fa-exclamation-triangle"></i> Alertas Operacionais</h2>
        <p class="page-subtitle">Problemas que requerem atencao</p>
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading">
      <!-- Summary -->
      <div class="summary-grid">
        <div class="card summary-card summary-danger">
          <div class="summary-label">Produtos Vencidos</div>
          <div class="summary-value text-danger">{{vencidos.length}}</div>
        </div>
        <div class="card summary-card summary-warning">
          <div class="summary-label">Estoque Critico</div>
          <div class="summary-value text-warning">{{estoqueBaixo.length}}</div>
        </div>
        <div class="card summary-card summary-purple">
          <div class="summary-label">Food Cost Alto (&gt;35%)</div>
          <div class="summary-value text-purple">{{foodCostAlto.length}}</div>
        </div>
      </div>

      <!-- No alerts -->
      <div class="card all-ok-card" *ngIf="vencidos.length === 0 && estoqueBaixo.length === 0 && foodCostAlto.length === 0">
        <i class="fas fa-check-circle all-ok-icon"></i>
        <strong class="all-ok-title">Tudo certo!</strong>
        <p class="all-ok-text">Nenhum alerta operacional no momento.</p>
      </div>

      <div class="two-col-grid">
        <!-- Vencidos -->
        <div class="card" *ngIf="vencidos.length > 0">
          <div class="card-header text-danger-light"><i class="fas fa-exclamation-triangle"></i> Produtos Vencidos</div>
          <table>
            <thead><tr><th>Produto</th><th>Validade</th><th>Estoque</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of vencidos">
                <td><strong>{{i.nome}}</strong></td>
                <td class="text-danger font-semibold">{{i.dataValidade}}</td>
                <td>{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estoque Baixo -->
        <div class="card" *ngIf="estoqueBaixo.length > 0">
          <div class="card-header text-warning-light"><i class="fas fa-boxes"></i> Estoque Critico</div>
          <table>
            <thead><tr><th>Insumo</th><th>Estoque</th><th>Minimo</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of estoqueBaixo">
                <td><strong>{{i.nome}}</strong></td>
                <td><span class="badge badge-danger">{{i.quantidadeEstoque | number:'1.3-3'}} {{i.unidadeMedida}}</span></td>
                <td>{{i.estoqueMinimo | number:'1.3-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Food Cost Alto -->
        <div class="card" *ngIf="foodCostAlto.length > 0">
          <div class="card-header text-purple-light"><i class="fas fa-exclamation-circle"></i> Food Cost &gt; 35%</div>
          <table>
            <thead><tr><th>Prato</th><th>Food Cost</th><th>Custo</th><th>Preco</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of foodCostAlto">
                <td><strong>{{p.nome}}</strong></td>
                <td><span class="badge badge-danger">{{p.foodCost | number:'1.1-1'}}%</span></td>
                <td>R$ {{p.custoProducao | number:'1.2-2'}}</td>
                <td>R$ {{p.precoVenda | number:'1.2-2'}}</td>
              </tr>
            </tbody>
          </table>
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
    .back-link:hover { color: var(--text-primary); }
    .summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 20px; }
    .summary-card { border-left-width: 4px; border-left-style: solid; padding: 16px; }
    .summary-danger { border-left-color: var(--danger); }
    .summary-warning { border-left-color: var(--warning); }
    .summary-purple { border-left-color: #A855F7; }
    .summary-label { font-size: 13px; color: var(--text-tertiary); }
    .summary-value { font-size: 32px; font-weight: 700; }
    .text-danger { color: var(--danger); }
    .text-warning { color: var(--warning); }
    .text-purple { color: #A855F7; }
    .font-semibold { font-weight: 600; }
    .text-danger-light { color: #FCA5A5; }
    .text-warning-light { color: #FCD34D; }
    .text-purple-light { color: #C084FC; }
    .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .all-ok-card { text-align: center; padding: 30px; }
    .all-ok-icon { font-size: 36px; color: var(--success); display: block; margin-bottom: 12px; }
    .all-ok-title { color: var(--text-primary); font-size: 16px; }
    .all-ok-text { color: var(--text-tertiary); margin-top: 4px; }
    @media (max-width: 768px) {
      .summary-grid { grid-template-columns: 1fr; }
      .two-col-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardAlertasComponent implements OnInit {
  loading = true;
  vencidos: Insumo[] = [];
  estoqueBaixo: Insumo[] = [];
  foodCostAlto: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    let loaded = 0;
    const check = () => { loaded++; if (loaded === 3) this.loading = false; };

    this.api.getDashboardVencidos().subscribe({ next: (d) => { this.vencidos = d; check(); }, error: () => check() });
    this.api.getDashboardEstoqueBaixo().subscribe({ next: (d) => { this.estoqueBaixo = d; check(); }, error: () => check() });
    this.api.getDashboard().subscribe({
      next: (d) => { this.foodCostAlto = d.pratosFoodCostAlto || []; check(); },
      error: () => check()
    });
  }
}
