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
        <a routerLink="/admin/overview" class="back-link"><i class="fas fa-arrow-left"></i> Overview</a>
        <h2><i class="fas fa-exclamation-triangle"></i> Alertas Operacionais</h2>
        <p class="page-subtitle">Problemas que requerem atencao</p>
      </div>
    </div>

    <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

    <div *ngIf="!loading">
      <!-- Summary -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
        <div class="card" style="border-left:4px solid #EF4444;padding:16px;">
          <div style="font-size:13px;color:#6B7280;">Produtos Vencidos</div>
          <div style="font-size:32px;font-weight:700;color:#EF4444;">{{vencidos.length}}</div>
        </div>
        <div class="card" style="border-left:4px solid #F59E0B;padding:16px;">
          <div style="font-size:13px;color:#6B7280;">Estoque Critico</div>
          <div style="font-size:32px;font-weight:700;color:#F59E0B;">{{estoqueBaixo.length}}</div>
        </div>
        <div class="card" style="border-left:4px solid #A855F7;padding:16px;">
          <div style="font-size:13px;color:#6B7280;">Food Cost Alto (&gt;35%)</div>
          <div style="font-size:32px;font-weight:700;color:#A855F7;">{{foodCostAlto.length}}</div>
        </div>
      </div>

      <!-- No alerts -->
      <div class="card" style="text-align:center;padding:30px;" *ngIf="vencidos.length === 0 && estoqueBaixo.length === 0 && foodCostAlto.length === 0">
        <i class="fas fa-check-circle" style="font-size:36px;color:#10B981;display:block;margin-bottom:12px;"></i>
        <strong style="color:var(--text-primary);font-size:16px;">Tudo certo!</strong>
        <p style="color:#6B7280;margin-top:4px;">Nenhum alerta operacional no momento.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <!-- Vencidos -->
        <div class="card" *ngIf="vencidos.length > 0">
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

        <!-- Estoque Baixo -->
        <div class="card" *ngIf="estoqueBaixo.length > 0">
          <div class="card-header" style="color:#FCD34D;"><i class="fas fa-boxes"></i> Estoque Critico</div>
          <table>
            <thead><tr><th>Insumo</th><th>Estoque</th><th>Minimo</th></tr></thead>
            <tbody>
              <tr *ngFor="let i of estoqueBaixo">
                <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
                <td><span class="badge badge-danger">{{i.quantidadeEstoque | number:'1.3-3'}} {{i.unidadeMedida}}</span></td>
                <td>{{i.estoqueMinimo | number:'1.3-3'}} {{i.unidadeMedida}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Food Cost Alto -->
        <div class="card" *ngIf="foodCostAlto.length > 0">
          <div class="card-header" style="color:#C084FC;"><i class="fas fa-exclamation-circle"></i> Food Cost &gt; 35%</div>
          <table>
            <thead><tr><th>Prato</th><th>Food Cost</th><th>Custo</th><th>Preco</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of foodCostAlto">
                <td><strong style="color:var(--text-primary);">{{p.nome}}</strong></td>
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
    .back-link:hover { color: #E5E7EB; }
    @media (max-width: 768px) {
      div[style*="grid-template-columns:repeat(3"] { grid-template-columns: 1fr !important; }
      div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; }
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
