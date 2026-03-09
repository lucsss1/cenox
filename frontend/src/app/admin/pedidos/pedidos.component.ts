import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../shared/services/auth.service';
import { Pedido } from '../../shared/models/models';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-clipboard-list"></i> Gestao de Pedidos</h2>
        <p class="page-subtitle">Gerencie todos os pedidos do restaurante</p>
      </div>
      <div class="filter-bar filter-inline">
        <select class="form-control status-select" [(ngModel)]="filtroStatus" (change)="carregar(0)">
          <option value="">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="EM_PREPARO">Em Preparo</option>
          <option value="PRONTO">Pronto</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>#</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th>Data</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of pedidos">
              <td><span class="id-col">#{{p.id}}</span></td>
              <td><strong>{{p.clienteNome}}</strong></td>
              <td>
                <div *ngFor="let i of p.itens" class="item-line">{{i.quantidade}}x {{i.pratoNome}}</div>
              </td>
              <td><strong>R$ {{p.total | number:'1.2-2'}}</strong></td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-warning': p.statusPedido === 'PENDENTE',
                  'badge-info': p.statusPedido === 'EM_PREPARO',
                  'badge-success': p.statusPedido === 'PRONTO' || p.statusPedido === 'ENTREGUE',
                  'badge-danger': p.statusPedido === 'CANCELADO'
                }"><span class="badge-dot"></span> {{p.statusPedido}}</span>
                <div *ngIf="p.motivoCancelamento" class="cancel-reason">
                  <i class="fas fa-info-circle"></i> {{p.motivoCancelamento}}
                </div>
              </td>
              <td class="date-col">{{p.createdAt | date:'dd/MM/yy HH:mm'}}</td>
              <td>
                <div class="action-bar">
                  <button *ngIf="p.statusPedido === 'PENDENTE'" class="btn btn-info btn-sm" (click)="alterarStatus(p.id, 'EM_PREPARO')">
                    <i class="fas fa-fire"></i> Preparar
                  </button>
                  <button *ngIf="p.statusPedido === 'EM_PREPARO'" class="btn btn-success btn-sm" (click)="alterarStatus(p.id, 'PRONTO')">
                    <i class="fas fa-check"></i> Pronto
                  </button>
                  <button *ngIf="p.statusPedido === 'PRONTO'" class="btn btn-success btn-sm" (click)="alterarStatus(p.id, 'ENTREGUE')">
                    <i class="fas fa-hand-holding"></i> Entregar
                  </button>
                  <button *ngIf="canCancel(p)" class="btn btn-danger btn-sm" (click)="abrirCancelamento(p)">
                    <i class="fas fa-times"></i> Cancelar
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="pedidos.length === 0">
              <td colspan="7" class="empty-row">Nenhum pedido encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer" *ngIf="!loading && totalPages > 1">
        <span class="pagination-info">Exibindo {{pedidos.length}} pedidos</span>
        <div class="pagination">
          <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
          <button *ngFor="let pg of pages" (click)="carregar(pg)" [class.active]="pg === currentPage">{{pg + 1}}</button>
          <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelamento -->
    <div class="modal-overlay" *ngIf="showCancelModal" (click)="fecharCancelamento()">
      <div class="modal-content modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Cancelar Pedido #{{cancelPedidoId}}</h3>
          <button class="modal-close" (click)="fecharCancelamento()">&times;</button>
        </div>
        <div class="form-group">
          <label>Motivo do cancelamento *</label>
          <textarea class="form-control" [(ngModel)]="motivoCancelamento" rows="3"
                    placeholder="Informe o motivo do cancelamento..."></textarea>
        </div>
        <p *ngIf="cancelEstorno" class="estorno-notice">
          <i class="fas fa-exclamation-triangle"></i> O estoque dos insumos sera estornado automaticamente.
        </p>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="fecharCancelamento()">Voltar</button>
          <button class="btn btn-danger" [disabled]="!motivoCancelamento.trim()" (click)="confirmarCancelamento()">Confirmar Cancelamento</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-row { text-align: center; color: var(--text-tertiary); padding: 32px !important; }
    .table-footer { display: flex; align-items: center; margin-top: var(--space-4); }
    .table-footer .pagination { margin-top: 0; }
    .filter-inline { margin-bottom: 0; }
    .status-select { width: auto; padding: 7px 12px; font-size: 13px; }
    .item-line { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .cancel-reason { font-size: 11px; color: #FCA5A5; margin-top: 4px; }
    .date-col { font-size: 12px; color: var(--text-tertiary); }
    .modal-sm { max-width: 450px; }
    .estorno-notice { font-size: 13px; color: #FCD34D; margin: var(--space-2) 0; }
  `]
})
export class PedidosAdminComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  filtroStatus = '';
  currentPage = 0; totalPages = 0; pages: number[] = [];

  showCancelModal = false;
  cancelPedidoId = 0;
  cancelEstorno = false;
  motivoCancelamento = '';

  constructor(private api: ApiService, private toast: ToastService, private auth: AuthService) {}

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    const obs = this.filtroStatus
      ? this.api.getPedidosPorStatus(this.filtroStatus, page)
      : this.api.getPedidos(page);
    obs.subscribe({
      next: (p) => { this.pedidos = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  alterarStatus(id: number, status: string): void {
    this.api.alterarStatusPedido(id, status).subscribe({
      next: () => { this.toast.success('Status atualizado!'); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  canCancel(p: Pedido): boolean {
    if (p.statusPedido === 'ENTREGUE' || p.statusPedido === 'CANCELADO') return false;
    if (p.statusPedido === 'PENDENTE') return true;
    return this.auth.hasAnyRole(['ADMIN', 'GERENTE']);
  }

  abrirCancelamento(p: Pedido): void {
    this.cancelPedidoId = p.id;
    this.cancelEstorno = p.statusPedido === 'EM_PREPARO' || p.statusPedido === 'PRONTO';
    this.motivoCancelamento = '';
    this.showCancelModal = true;
  }

  fecharCancelamento(): void { this.showCancelModal = false; }

  confirmarCancelamento(): void {
    if (!this.motivoCancelamento.trim()) return;
    this.api.alterarStatusPedido(this.cancelPedidoId, 'CANCELADO', this.motivoCancelamento).subscribe({
      next: () => {
        this.toast.success('Pedido cancelado com estorno de estoque!');
        this.fecharCancelamento();
        this.carregar(this.currentPage);
      },
      error: () => {}
    });
  }
}
