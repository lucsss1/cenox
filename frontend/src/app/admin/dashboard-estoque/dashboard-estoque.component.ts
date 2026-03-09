import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Insumo, MovimentacaoEstoque } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard-estoque',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/admin/dashboard" class="back-link"><i class="fas fa-arrow-left"></i> Dashboards</a>
        <h2><i class="fas fa-warehouse"></i> Painel de Estoque</h2>
        <p class="page-subtitle">Visao geral do estoque — atualizado agora</p>
      </div>
      <div class="header-actions">
        <a routerLink="/admin/entrada-estoque" class="btn btn-primary"><i class="fas fa-plus"></i> Nova Entrada</a>
        <a routerLink="/admin/controle-validade" class="btn btn-secondary"><i class="fas fa-calendar-check"></i> Validades</a>
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading">
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="card summary-card summary-danger clickable" (click)="scrollTo('vencidos')">
          <div class="summary-label">Produtos Vencidos</div>
          <div class="summary-value text-danger">{{vencidos.length}}</div>
          <div class="summary-hint">requer atencao imediata</div>
        </div>
        <div class="card summary-card summary-warning clickable" (click)="scrollTo('proximos')">
          <div class="summary-label">Proximos do Vencimento</div>
          <div class="summary-value text-warning">{{proximos.length}}</div>
          <div class="summary-hint">vencem em ate 3 dias</div>
        </div>
        <div class="card summary-card summary-info clickable" (click)="scrollTo('baixo')">
          <div class="summary-label">Estoque Baixo</div>
          <div class="summary-value text-info">{{estoqueBaixo.length}}</div>
          <div class="summary-hint">abaixo do minimo</div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="two-col-grid">

        <!-- Vencidos -->
        <div class="card" id="vencidos" *ngIf="vencidos.length > 0">
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

        <!-- Proximos do Vencimento -->
        <div class="card" id="proximos" *ngIf="proximos.length > 0">
          <div class="card-header text-warning-light"><i class="fas fa-clock"></i> Proximos do Vencimento (3 dias)</div>
          <table>
            <thead><tr><th>Produto</th><th>Validade</th><th>Dias</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of proximos">
                <td><strong>{{i.nome}}</strong></td>
                <td class="text-warning font-semibold">{{i.dataValidade}}</td>
                <td>{{diasRestantes(i.dataValidade)}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estoque Baixo -->
        <div class="card" id="baixo" *ngIf="estoqueBaixo.length > 0">
          <div class="card-header text-info-light"><i class="fas fa-arrow-down"></i> Estoque Baixo</div>
          <table>
            <thead><tr><th>Produto</th><th>Estoque</th><th>Minimo</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of estoqueBaixo">
                <td><strong>{{i.nome}}</strong></td>
                <td><span class="badge badge-danger">{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</span></td>
                <td>{{i.estoqueMinimo | number:'1.0-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Ultimas Entradas -->
        <div class="card">
          <div class="card-header text-success-light"><i class="fas fa-truck-loading"></i> Ultimas Entradas</div>
          <table *ngIf="ultimasEntradas.length > 0">
            <thead><tr><th>Produto</th><th>Qtd</th><th>Data</th><th>Obs</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of ultimasEntradas">
                <td><strong>{{e.insumoNome}}</strong></td>
                <td class="text-success font-semibold">+{{e.quantidade | number:'1.0-3'}}</td>
                <td class="text-sm text-tertiary">{{formatDate(e.createdAt)}}</td>
                <td class="text-sm text-tertiary">{{e.motivo || '&mdash;'}}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="ultimasEntradas.length === 0" class="empty-state">Nenhuma entrada registrada</p>
        </div>
      </div>

      <!-- All OK message -->
      <div class="card all-ok-card" *ngIf="vencidos.length === 0 && proximos.length === 0 && estoqueBaixo.length === 0">
        <i class="fas fa-check-circle all-ok-icon"></i>
        <strong class="all-ok-title">Estoque em ordem!</strong>
        <p class="all-ok-text">Nenhum produto vencido, proximo do vencimento ou com estoque baixo.</p>
      </div>
    </div>
  `,
  styles: [`
    .back-link { font-size: 12px; color: var(--text-tertiary); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 4px; transition: color 0.2s; }
    .back-link:hover { color: var(--text-primary); }
    .header-actions { display: flex; gap: 8px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 20px; }
    .summary-card { border-left-width: 4px; border-left-style: solid; padding: 16px; }
    .summary-danger { border-left-color: var(--danger); }
    .summary-warning { border-left-color: var(--warning); }
    .summary-info { border-left-color: var(--info); }
    .clickable { cursor: pointer; }
    .summary-label { font-size: 13px; color: var(--text-tertiary); }
    .summary-value { font-size: 32px; font-weight: 700; }
    .summary-hint { font-size: 12px; color: var(--text-tertiary); }
    .text-danger { color: var(--danger); }
    .text-warning { color: var(--warning); }
    .text-info { color: var(--info); }
    .text-success { color: var(--success); }
    .text-tertiary { color: var(--text-tertiary); }
    .text-sm { font-size: 12px; }
    .font-semibold { font-weight: 600; }
    .text-danger-light { color: #FCA5A5; }
    .text-warning-light { color: #FCD34D; }
    .text-info-light { color: #93C5FD; }
    .text-success-light { color: #6EE7B7; }
    .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .empty-state { text-align: center; color: var(--text-tertiary); padding: 20px; }
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
export class DashboardEstoqueComponent implements OnInit {
  loading = true;
  vencidos: Insumo[] = [];
  proximos: Insumo[] = [];
  estoqueBaixo: Insumo[] = [];
  ultimasEntradas: MovimentacaoEstoque[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    let loaded = 0;
    const check = () => { loaded++; if (loaded === 4) this.loading = false; };

    this.api.getDashboardVencidos().subscribe({ next: (d) => { this.vencidos = d; check(); }, error: () => check() });
    this.api.getDashboardProximosVencimento().subscribe({ next: (d) => { this.proximos = d; check(); }, error: () => check() });
    this.api.getDashboardEstoqueBaixo().subscribe({ next: (d) => { this.estoqueBaixo = d; check(); }, error: () => check() });
    this.api.getDashboardUltimasEntradas().subscribe({ next: (d) => { this.ultimasEntradas = d; check(); }, error: () => check() });
  }

  diasRestantes(dataValidade: string): string {
    if (!dataValidade) return '—';
    const diff = Math.ceil((new Date(dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return '1 dia';
    return `${diff} dias`;
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    const d = new Date(dt);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
