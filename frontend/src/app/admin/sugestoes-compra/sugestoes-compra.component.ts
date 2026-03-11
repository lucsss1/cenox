import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { SugestaoCompra } from '../../shared/models/models';

@Component({
  selector: 'app-sugestoes-compra',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Sugestoes de Compra</h2>
        <button class="btn-primary" (click)="calcular()" [disabled]="loading">
          {{loading ? 'Calculando...' : 'Recalcular Sugestoes'}}
        </button>
      </div>

      <p class="subtitle">
        Sugestoes automaticas baseadas no consumo medio diario, prazo de entrega do fornecedor e estoque de seguranca.
      </p>

      <!-- Summary -->
      <div class="summary-cards">
        <div class="card-summary" [class]="getPrioridadeClass('CRITICA')">
          <span class="card-number">{{contarPrioridade('CRITICA')}}</span>
          <span class="card-label">Critica</span>
        </div>
        <div class="card-summary" [class]="getPrioridadeClass('ALTA')">
          <span class="card-number">{{contarPrioridade('ALTA')}}</span>
          <span class="card-label">Alta</span>
        </div>
        <div class="card-summary" [class]="getPrioridadeClass('MEDIA')">
          <span class="card-number">{{contarPrioridade('MEDIA')}}</span>
          <span class="card-label">Media</span>
        </div>
        <div class="card-summary" [class]="getPrioridadeClass('BAIXA')">
          <span class="card-number">{{contarPrioridade('BAIXA')}}</span>
          <span class="card-label">Baixa</span>
        </div>
      </div>

      <!-- Custo Total Estimado -->
      <div class="custo-total" *ngIf="sugestoes.length > 0">
        Custo Total Estimado: <strong>R$ {{custoTotalEstimado | number:'1.2-2'}}</strong>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Prior.</th>
              <th>Insumo</th>
              <th>Estoque Atual</th>
              <th>Est. Minimo</th>
              <th>Consumo/Dia</th>
              <th>Cobertura</th>
              <th>Qtd. Sugerida</th>
              <th>Fornecedor</th>
              <th>Custo Est.</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sugestoes">
              <td>
                <span class="badge-prioridade" [class]="getPrioridadeBadge(s.prioridade)">
                  {{s.prioridade}}
                </span>
              </td>
              <td><strong>{{s.insumoNome}}</strong></td>
              <td>
                <span [class]="getEstoqueClass(s)">{{s.estoqueAtual | number:'1.3-3'}} {{s.unidadeMedida}}</span>
              </td>
              <td>{{s.estoqueMinimo | number:'1.3-3'}}</td>
              <td>{{s.consumoMedioDiario | number:'1.3-3'}}</td>
              <td>
                <span [class]="getCoberturaClass(s)">{{s.diasCobertura}} dias</span>
              </td>
              <td><strong>{{s.quantidadeSugerida | number:'1.3-3'}} {{s.unidadeMedida}}</strong></td>
              <td>{{s.fornecedorNome || '-'}}</td>
              <td>R$ {{s.custoEstimado | number:'1.2-2'}}</td>
            </tr>
            <tr *ngIf="sugestoes.length === 0">
              <td colspan="9" class="empty">
                {{loading ? 'Calculando sugestoes...' : 'Nenhuma sugestao pendente. Clique em "Recalcular" para gerar.'}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; }
    .header h2 { color: #e0e0e0; margin: 0; }
    .subtitle { color: #888; margin-bottom: 20px; font-size: 0.9rem; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .card-summary { background: #2d2d2d; padding: 16px; border-radius: 10px; text-align: center; border-left: 4px solid; }
    .card-summary.critica { border-color: #e74c3c; }
    .card-summary.alta { border-color: #e67e22; }
    .card-summary.media { border-color: #f39c12; }
    .card-summary.baixa { border-color: #27ae60; }
    .card-number { display: block; font-size: 1.8rem; font-weight: bold; color: #fff; }
    .card-label { color: #aaa; font-size: 0.8rem; }
    .custo-total { background: #2d2d2d; padding: 15px 20px; border-radius: 8px; color: #e0e0e0; margin-bottom: 20px; font-size: 1.1rem; }
    .custo-total strong { color: #27ae60; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: #2d2d2d; border-radius: 8px; overflow: hidden; }
    th { background: #363636; color: #aaa; padding: 12px; text-align: left; font-size: 0.8rem; text-transform: uppercase; }
    td { padding: 12px; color: #e0e0e0; border-bottom: 1px solid #3a3a3a; }
    .badge-prioridade { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; }
    .badge-prioridade.critica { background: rgba(231,76,60,0.2); color: #e74c3c; }
    .badge-prioridade.alta { background: rgba(230,126,34,0.2); color: #e67e22; }
    .badge-prioridade.media { background: rgba(243,156,18,0.2); color: #f39c12; }
    .badge-prioridade.baixa { background: rgba(39,174,96,0.2); color: #27ae60; }
    .estoque-critico { color: #e74c3c; font-weight: 600; }
    .estoque-baixo { color: #f39c12; font-weight: 600; }
    .estoque-ok { color: #27ae60; }
    .cobertura-critica { color: #e74c3c; font-weight: 600; }
    .cobertura-baixa { color: #f39c12; }
    .cobertura-ok { color: #27ae60; }
    .empty { text-align: center; color: #888; padding: 30px !important; }
    .btn-primary { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-primary:hover { background: #2980b9; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class SugestaoCompraComponent implements OnInit {
  sugestoes: SugestaoCompra[] = [];
  loading = false;
  custoTotalEstimado = 0;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.carregarSugestoes();
  }

  carregarSugestoes() {
    this.api.getSugestoesPendentes().subscribe(s => {
      this.sugestoes = s;
      this.calcularCustoTotal();
    });
  }

  calcular() {
    this.loading = true;
    this.api.calcularSugestoes().subscribe({
      next: (s) => {
        this.sugestoes = s;
        this.calcularCustoTotal();
        this.toast.success(`${s.length} sugestoes calculadas`);
        this.loading = false;
      },
      error: () => { this.toast.error('Erro ao calcular sugestoes'); this.loading = false; }
    });
  }

  calcularCustoTotal() {
    this.custoTotalEstimado = this.sugestoes.reduce((sum, s) => sum + (s.custoEstimado || 0), 0);
  }

  contarPrioridade(p: string): number {
    return this.sugestoes.filter(s => s.prioridade === p).length;
  }

  getPrioridadeClass(p: string): string {
    return p.toLowerCase();
  }

  getPrioridadeBadge(p: string): string {
    return p.toLowerCase();
  }

  getEstoqueClass(s: SugestaoCompra): string {
    if (s.estoqueAtual <= 0) return 'estoque-critico';
    if (s.estoqueAtual <= s.estoqueMinimo) return 'estoque-baixo';
    return 'estoque-ok';
  }

  getCoberturaClass(s: SugestaoCompra): string {
    if (s.diasCobertura <= 1) return 'cobertura-critica';
    if (s.diasCobertura <= 3) return 'cobertura-baixa';
    return 'cobertura-ok';
  }
}
