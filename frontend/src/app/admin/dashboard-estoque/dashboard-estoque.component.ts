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
        <a routerLink="/admin/overview" class="back-link"><i class="fas fa-arrow-left"></i> Overview</a>
        <h2><i class="fas fa-warehouse"></i> Painel de Estoque</h2>
        <p class="page-subtitle">Visão geral do estoque — atualizado agora</p>
      </div>
      <div style="display:flex;gap:8px;">
        <a routerLink="/admin/estoque/insumos" class="btn btn-primary"><i class="fas fa-cubes"></i> Ir para Insumos</a>
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading">
      <!-- Summary Cards -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
        <div class="card" style="border-left:4px solid #EF4444;padding:16px;cursor:pointer;" (click)="scrollTo('vencidos')">
          <div style="font-size:13px;color:#6B7280;">Produtos Vencidos</div>
          <div style="font-size:32px;font-weight:700;color:#EF4444;">{{vencidos.length}}</div>
          <div style="font-size:12px;color:#6B7280;">requer atencao imediata</div>
        </div>
        <div class="card" style="border-left:4px solid #F59E0B;padding:16px;cursor:pointer;" (click)="scrollTo('proximos')">
          <div style="font-size:13px;color:#6B7280;">Proximos do Vencimento</div>
          <div style="font-size:32px;font-weight:700;color:#F59E0B;">{{proximos.length}}</div>
          <div style="font-size:12px;color:#6B7280;">vencem em ate 3 dias</div>
        </div>
        <div class="card" style="border-left:4px solid #3B82F6;padding:16px;cursor:pointer;" (click)="scrollTo('baixo')">
          <div style="font-size:13px;color:#6B7280;">Estoque Baixo</div>
          <div style="font-size:32px;font-weight:700;color:#3B82F6;">{{estoqueBaixo.length}}</div>
          <div style="font-size:12px;color:#6B7280;">abaixo do minimo</div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

        <!-- Vencidos -->
        <div class="card" id="vencidos" *ngIf="vencidos.length > 0">
          <div class="card-header" style="color:#FCA5A5;"><i class="fas fa-exclamation-triangle"></i> Produtos Vencidos</div>
          <table>
            <thead><tr><th>Produto</th><th>Validade</th><th>Estoque</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of vencidos">
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td style="color:#EF4444;font-weight:600;">{{i.dataValidade}}</td>
                <td>{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Proximos do Vencimento -->
        <div class="card" id="proximos" *ngIf="proximos.length > 0">
          <div class="card-header" style="color:#FCD34D;"><i class="fas fa-clock"></i> Proximos do Vencimento (3 dias)</div>
          <table>
            <thead><tr><th>Produto</th><th>Validade</th><th>Dias</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of proximos">
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td style="color:#F59E0B;font-weight:600;">{{i.dataValidade}}</td>
                <td>{{diasRestantes(i.dataValidade)}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estoque Baixo -->
        <div class="card" id="baixo" *ngIf="estoqueBaixo.length > 0">
          <div class="card-header" style="color:#93C5FD;"><i class="fas fa-arrow-down"></i> Estoque Baixo</div>
          <table>
            <thead><tr><th>Produto</th><th>Estoque</th><th>Minimo</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of estoqueBaixo">
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td><span class="badge badge-danger">{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</span></td>
                <td>{{i.estoqueMinimo | number:'1.0-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Ultimas Entradas -->
        <div class="card">
          <div class="card-header" style="color:#6EE7B7;"><i class="fas fa-truck-loading"></i> Ultimas Entradas</div>
          <table *ngIf="ultimasEntradas.length > 0">
            <thead><tr><th>Produto</th><th>Qtd</th><th>Data</th><th>Obs</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of ultimasEntradas">
                <td><strong style="color:var(--text-primary);">{{e.insumoNome}}</strong></td>
                <td style="color:#10B981;font-weight:600;">+{{e.quantidade | number:'1.0-3'}}</td>
                <td style="font-size:12px;color:#6B7280;">{{formatDate(e.createdAt)}}</td>
                <td style="font-size:12px;color:#6B7280;">{{e.motivo || '&mdash;'}}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="ultimasEntradas.length === 0" style="text-align:center;color:#6B7280;padding:20px;">Nenhuma entrada registrada</p>
        </div>
      </div>

      <!-- All OK message -->
      <div class="card" style="text-align:center;padding:30px;" *ngIf="vencidos.length === 0 && proximos.length === 0 && estoqueBaixo.length === 0">
        <i class="fas fa-check-circle" style="font-size:36px;color:#10B981;display:block;margin-bottom:12px;"></i>
        <strong style="color:var(--text-primary);font-size:16px;">Estoque em ordem!</strong>
        <p style="color:#6B7280;margin-top:4px;">Nenhum produto vencido, proximo do vencimento ou com estoque baixo.</p>
      </div>
    </div>
  `
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
