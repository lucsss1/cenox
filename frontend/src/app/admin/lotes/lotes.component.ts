import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Lote, Page, Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Controle de Lotes (FIFO)</h2>
        <div class="header-actions">
          <select [(ngModel)]="filtro" (change)="aplicarFiltro()" class="filtro-select">
            <option value="todos">Todos os Lotes</option>
            <option value="vencidos">Vencidos</option>
            <option value="proximos">Prox. Vencimento (7 dias)</option>
          </select>
          <button class="btn-primary" (click)="abrirModal()">+ Novo Lote</button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card-summary red" (click)="filtro='vencidos'; aplicarFiltro()">
          <span class="card-number">{{lotesVencidos.length}}</span>
          <span class="card-label">Vencidos</span>
        </div>
        <div class="card-summary yellow" (click)="filtro='proximos'; aplicarFiltro()">
          <span class="card-number">{{lotesProximos.length}}</span>
          <span class="card-label">Prox. Vencimento</span>
        </div>
        <div class="card-summary green">
          <span class="card-number">{{totalLotes}}</span>
          <span class="card-label">Lotes Ativos</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Lote</th>
              <th>Insumo</th>
              <th>Qtd. Atual</th>
              <th>Qtd. Inicial</th>
              <th>Validade</th>
              <th>Dias</th>
              <th>Fornecedor</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lote of lotesExibidos">
              <td><strong>{{lote.numeroLote}}</strong></td>
              <td>{{lote.insumoNome}}</td>
              <td>{{lote.quantidade | number:'1.3-3'}} {{lote.unidadeMedida}}</td>
              <td>{{lote.quantidadeInicial | number:'1.3-3'}}</td>
              <td>{{lote.dataValidade || 'N/A'}}</td>
              <td>
                <span *ngIf="lote.dataValidade" [class]="getClasseDias(lote)">
                  {{formatDias(lote)}}
                </span>
                <span *ngIf="!lote.dataValidade" class="badge neutral">-</span>
              </td>
              <td>{{lote.fornecedorNome || '-'}}</td>
              <td>
                <span class="badge" [class.red]="lote.vencido" [class.yellow]="lote.proximoVencimento" [class.green]="!lote.vencido && !lote.proximoVencimento">
                  {{lote.vencido ? 'VENCIDO' : lote.proximoVencimento ? 'PROXIMO' : 'OK'}}
                </span>
              </td>
              <td>
                <button class="btn-sm danger" (click)="desativar(lote.id)" title="Desativar">X</button>
              </td>
            </tr>
            <tr *ngIf="lotesExibidos.length === 0">
              <td colspan="9" class="empty">Nenhum lote encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="irParaPagina(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <span>Pagina {{currentPage + 1}} de {{totalPages}}</span>
        <button (click)="irParaPagina(currentPage + 1)" [disabled]="currentPage >= totalPages - 1">Proxima</button>
      </div>

      <!-- Modal Novo Lote -->
      <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Novo Lote</h3>
          <form (ngSubmit)="salvarLote()">
            <div class="form-group">
              <label>Insumo *</label>
              <select [(ngModel)]="novoLote.insumoId" name="insumoId" required>
                <option [ngValue]="null">Selecione...</option>
                <option *ngFor="let i of insumos" [ngValue]="i.id">{{i.nome}} ({{i.unidadeMedida}})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Numero do Lote *</label>
              <input type="text" [(ngModel)]="novoLote.numeroLote" name="numeroLote" required placeholder="Ex: LT-001">
            </div>
            <div class="form-group">
              <label>Quantidade *</label>
              <input type="number" [(ngModel)]="novoLote.quantidade" name="quantidade" required min="0.001" step="0.001">
            </div>
            <div class="form-group">
              <label>Data de Validade</label>
              <input type="date" [(ngModel)]="novoLote.dataValidade" name="dataValidade">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="fecharModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="loading">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    .header h2 { color: #e0e0e0; margin: 0; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .filtro-select { background: #2d2d2d; color: #e0e0e0; border: 1px solid #444; padding: 8px 12px; border-radius: 6px; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .card-summary { background: #2d2d2d; padding: 20px; border-radius: 10px; text-align: center; cursor: pointer; transition: transform 0.2s; border-left: 4px solid; }
    .card-summary:hover { transform: translateY(-2px); }
    .card-summary.red { border-color: #e74c3c; }
    .card-summary.yellow { border-color: #f39c12; }
    .card-summary.green { border-color: #27ae60; }
    .card-number { display: block; font-size: 2rem; font-weight: bold; color: #fff; }
    .card-label { color: #aaa; font-size: 0.85rem; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: #2d2d2d; border-radius: 8px; overflow: hidden; }
    th { background: #363636; color: #aaa; padding: 12px; text-align: left; font-size: 0.8rem; text-transform: uppercase; }
    td { padding: 12px; color: #e0e0e0; border-bottom: 1px solid #3a3a3a; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .badge.red { background: rgba(231,76,60,0.2); color: #e74c3c; }
    .badge.yellow { background: rgba(243,156,18,0.2); color: #f39c12; }
    .badge.green { background: rgba(39,174,96,0.2); color: #27ae60; }
    .badge.neutral { background: rgba(150,150,150,0.2); color: #999; }
    .empty { text-align: center; color: #888; padding: 30px !important; }
    .btn-primary { background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .btn-primary:hover { background: #2980b9; }
    .btn-secondary { background: #555; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .btn-sm { padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
    .btn-sm.danger { background: rgba(231,76,60,0.2); color: #e74c3c; }
    .btn-sm.danger:hover { background: rgba(231,76,60,0.4); }
    .pagination { display: flex; justify-content: center; gap: 15px; align-items: center; margin-top: 15px; color: #aaa; }
    .pagination button { background: #3a3a3a; color: #e0e0e0; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #2d2d2d; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; }
    .modal h3 { color: #e0e0e0; margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; color: #aaa; margin-bottom: 5px; font-size: 0.85rem; }
    .form-group input, .form-group select { width: 100%; background: #1e1e1e; color: #e0e0e0; border: 1px solid #444; padding: 10px; border-radius: 6px; box-sizing: border-box; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  `]
})
export class LotesComponent implements OnInit {
  lotesExibidos: Lote[] = [];
  lotesVencidos: Lote[] = [];
  lotesProximos: Lote[] = [];
  insumos: Insumo[] = [];
  totalLotes = 0;
  totalPages = 0;
  currentPage = 0;
  filtro = 'todos';
  showModal = false;
  loading = false;
  novoLote: any = { insumoId: null, numeroLote: '', quantidade: null, dataValidade: null };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.carregarDados();
    this.api.getInsumosTodos().subscribe(i => this.insumos = i);
  }

  carregarDados() {
    this.api.getLotesVencidos().subscribe(l => this.lotesVencidos = l);
    this.api.getLotesProximosVencimento().subscribe(l => this.lotesProximos = l);
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtro === 'vencidos') {
      this.api.getLotesVencidos().subscribe(l => { this.lotesExibidos = l; this.totalPages = 1; });
    } else if (this.filtro === 'proximos') {
      this.api.getLotesProximosVencimento().subscribe(l => { this.lotesExibidos = l; this.totalPages = 1; });
    } else {
      this.api.getLotes(this.currentPage).subscribe(p => {
        this.lotesExibidos = p.content;
        this.totalPages = p.totalPages;
        this.totalLotes = p.totalElements;
      });
    }
  }

  irParaPagina(page: number) {
    this.currentPage = page;
    this.aplicarFiltro();
  }

  abrirModal() { this.showModal = true; this.novoLote = { insumoId: null, numeroLote: '', quantidade: null, dataValidade: null }; }
  fecharModal() { this.showModal = false; }

  salvarLote() {
    this.loading = true;
    this.api.createLote(this.novoLote).subscribe({
      next: () => { this.toast.success('Lote criado com sucesso'); this.fecharModal(); this.carregarDados(); this.loading = false; },
      error: () => { this.toast.error('Erro ao criar lote'); this.loading = false; }
    });
  }

  desativar(id: number) {
    if (confirm('Desativar este lote?')) {
      this.api.deleteLote(id).subscribe({
        next: () => { this.toast.success('Lote desativado'); this.carregarDados(); },
        error: () => this.toast.error('Erro ao desativar lote')
      });
    }
  }

  getClasseDias(lote: Lote): string {
    if (lote.vencido) return 'badge red';
    if (lote.proximoVencimento) return 'badge yellow';
    return 'badge green';
  }

  formatDias(lote: Lote): string {
    if (lote.diasParaVencimento < 0) return `${Math.abs(lote.diasParaVencimento)}d atrasado`;
    if (lote.diasParaVencimento === 0) return 'Vence hoje';
    return `${lote.diasParaVencimento}d`;
  }
}
