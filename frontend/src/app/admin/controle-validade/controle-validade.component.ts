import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-controle-validade',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-calendar-check"></i> Controle de Validade</h2>
        <p class="page-subtitle">FIFO — produtos ordenados pela validade mais proxima</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn" [class.btn-danger]="filtro === 'vencidos'" [class.btn-secondary]="filtro !== 'vencidos'" (click)="mudarFiltro('vencidos')">
          <i class="fas fa-exclamation-triangle"></i> Vencidos <span *ngIf="totalVencidos > 0" style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:10px;margin-left:4px;">{{totalVencidos}}</span>
        </button>
        <button class="btn" [class.btn-primary]="filtro === 'proximos'" [class.btn-secondary]="filtro !== 'proximos'" (click)="mudarFiltro('proximos')">
          <i class="fas fa-clock"></i> Proximos (3 dias) <span *ngIf="totalProximos > 0" style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:10px;margin-left:4px;">{{totalProximos}}</span>
        </button>
        <button class="btn" [class.btn-primary]="filtro === 'todos'" [class.btn-secondary]="filtro !== 'todos'" (click)="mudarFiltro('todos')">
          <i class="fas fa-list"></i> Todos
        </button>
      </div>
    </div>

    <!-- Resumo rapido -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
      <div class="card" style="border-left:4px solid #EF4444;padding:16px;">
        <div style="font-size:13px;color:#6B7280;">Vencidos</div>
        <div style="font-size:28px;font-weight:700;color:#EF4444;">{{totalVencidos}}</div>
      </div>
      <div class="card" style="border-left:4px solid #F59E0B;padding:16px;">
        <div style="font-size:13px;color:#6B7280;">Vencem em ate 3 dias</div>
        <div style="font-size:28px;font-weight:700;color:#F59E0B;">{{totalProximos}}</div>
      </div>
      <div class="card" style="border-left:4px solid #10B981;padding:16px;">
        <div style="font-size:13px;color:#6B7280;">Com validade registrada</div>
        <div style="font-size:28px;font-weight:700;color:#10B981;">{{totalTodos}}</div>
      </div>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Validade</th>
              <th>Dias restantes</th>
              <th>Estoque</th>
              <th>Fornecedor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of itensExibidos">
              <td><strong style="color:var(--text-primary);">{{i.nome}}</strong></td>
              <td>{{i.categoria || '&mdash;'}}</td>
              <td [style.color]="corValidade(i)"><strong>{{i.dataValidade}}</strong></td>
              <td>
                <span [style.color]="corValidade(i)" style="font-weight:600;">
                  {{diasRestantes(i.dataValidade)}}
                </span>
              </td>
              <td>{{i.quantidadeEstoque | number:'1.0-3'}} {{i.unidadeMedida}}</td>
              <td>{{i.fornecedorNome || '&mdash;'}}</td>
              <td>
                <span *ngIf="isVencido(i.dataValidade)" class="badge badge-danger"><span class="badge-dot"></span>VENCIDO</span>
                <span *ngIf="!isVencido(i.dataValidade) && isProximo(i.dataValidade)" class="badge badge-warning"><span class="badge-dot"></span>PROXIMO</span>
                <span *ngIf="!isVencido(i.dataValidade) && !isProximo(i.dataValidade)" class="badge badge-success"><span class="badge-dot"></span>OK</span>
              </td>
            </tr>
            <tr *ngIf="itensExibidos.length === 0">
              <td colspan="7" style="text-align:center;color:#6B7280;padding:30px;">
                <i class="fas fa-check-circle" style="font-size:24px;color:#10B981;display:block;margin-bottom:8px;"></i>
                {{filtro === 'vencidos' ? 'Nenhum produto vencido' : filtro === 'proximos' ? 'Nenhum produto proximo do vencimento' : 'Nenhum produto com validade registrada'}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ControleValidadeComponent implements OnInit {
  loading = true;
  filtro: 'vencidos' | 'proximos' | 'todos' = 'proximos';

  vencidos: Insumo[] = [];
  proximos: Insumo[] = [];
  todos: Insumo[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    let loaded = 0;
    const check = () => { loaded++; if (loaded === 3) this.loading = false; };

    this.api.getVencidos().subscribe({ next: (d) => { this.vencidos = d; check(); }, error: () => check() });
    this.api.getProximosVencimento().subscribe({ next: (d) => { this.proximos = d; check(); }, error: () => check() });
    this.api.getOrdenadoValidade().subscribe({ next: (d) => { this.todos = d; check(); }, error: () => check() });
  }

  get totalVencidos(): number { return this.vencidos.length; }
  get totalProximos(): number { return this.proximos.length; }
  get totalTodos(): number { return this.todos.length; }

  get itensExibidos(): Insumo[] {
    switch (this.filtro) {
      case 'vencidos': return this.vencidos;
      case 'proximos': return this.proximos;
      case 'todos': return this.todos;
    }
  }

  mudarFiltro(f: 'vencidos' | 'proximos' | 'todos'): void {
    this.filtro = f;
  }

  diasRestantes(dataValidade: string): string {
    if (!dataValidade) return '—';
    const diff = Math.ceil((new Date(dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} dia(s) atrasado`;
    if (diff === 0) return 'Vence hoje';
    return `${diff} dia(s)`;
  }

  isVencido(dataValidade: string): boolean {
    return new Date(dataValidade) < new Date(new Date().toISOString().split('T')[0]);
  }

  isProximo(dataValidade: string): boolean {
    const hoje = new Date(new Date().toISOString().split('T')[0]);
    const validade = new Date(dataValidade);
    const diffDias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 0 && diffDias <= 3;
  }

  corValidade(i: Insumo): string {
    if (this.isVencido(i.dataValidade)) return '#EF4444';
    if (this.isProximo(i.dataValidade)) return '#F59E0B';
    return '#6B7280';
  }
}
