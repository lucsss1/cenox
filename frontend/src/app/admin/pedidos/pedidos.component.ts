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
      <h2><i class="fas fa-clipboard-list"></i> Gestao de Pedidos</h2>
      <div style="display:flex;gap:8px;">
        <select class="form-control" [(ngModel)]="filtroStatus" (change)="carregar(0)" style="width:auto;">
          <option value="">Todos</option>
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
              <td><strong>{{p.id}}</strong></td>
              <td>{{p.clienteNome}}</td>
              <td>
                <div *ngFor="let i of p.itens" style="font-size:12px;">{{i.quantidade}}x {{i.pratoNome}}</div>
              </td>
              <td><strong>R$ {{p.total | number:'1.2-2'}}</strong></td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-warning': p.statusPedido === 'PENDENTE',
                  'badge-info': p.statusPedido === 'EM_PREPARO',
                  'badge-success': p.statusPedido === 'PRONTO' || p.statusPedido === 'ENTREGUE',
                  'badge-danger': p.statusPedido === 'CANCELADO'
                }">{{p.statusPedido}}</span>
                <div *ngIf="p.motivoCancelamento" style="font-size:11px;color:#FCA5A5;margin-top:4px;">
                  <i class="fas fa-info-circle"></i> {{p.motivoCancelamento}}
                </div>
              </td>
              <td style="font-size:12px;">{{p.createdAt | date:'dd/MM/yy HH:mm'}}</td>
              <td style="white-space:nowrap;">
                <button *ngIf="p.statusPedido === 'PENDENTE'" class="btn btn-info btn-sm" (click)="alterarStatus(p.id, 'EM_PREPARO')" title="Iniciar Preparo">
                  <i class="fas fa-fire"></i> Preparar
                </button>
                <button *ngIf="p.statusPedido === 'EM_PREPARO'" class="btn btn-success btn-sm" (click)="alterarStatus(p.id, 'PRONTO')" title="Marcar Pronto">
                  <i class="fas fa-check"></i> Pronto
                </button>
                <button *ngIf="p.statusPedido === 'PRONTO'" class="btn btn-success btn-sm" (click)="alterarStatus(p.id, 'ENTREGUE')" title="Entregar">
                  <i class="fas fa-hand-holding"></i> Entregar
                </button>
                <button *ngIf="canCancel(p)" class="btn btn-danger btn-sm" (click)="abrirCancelamento(p)" title="Cancelar">
                  <i class="fas fa-times"></i> Cancelar
                </button>
              </td>
            </tr>
            <tr *ngIf="pedidos.length === 0"><td colspan="7" style="text-align:center;color:var(--gray-500);">Nenhum pedido encontrado</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let pg of pages" (click)="carregar(pg)" [class.active]="pg === currentPage">{{pg + 1}}</button>
        <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
      </div>
    </div>

    <!-- Modal de Cancelamento -->
    <div class="modal-overlay" *ngIf="showCancelModal" (click)="fecharCancelamento()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:450px;">
        <div class="modal-header">
          <h3>Cancelar Pedido #{{cancelPedidoId}}</h3>
          <button class="modal-close" (click)="fecharCancelamento()">&times;</button>
        </div>
        <div class="form-group">
          <label>Motivo do cancelamento *</label>
          <textarea class="form-control" [(ngModel)]="motivoCancelamento" rows="3"
                    placeholder="Informe o motivo do cancelamento..."></textarea>
        </div>
        <p *ngIf="cancelEstorno" style="font-size:0.85em;color:#FCD34D;margin:8px 0;">
          <i class="fas fa-exclamation-triangle"></i> O estoque dos insumos sera estornado automaticamente.
        </p>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="fecharCancelamento()">Voltar</button>
          <button class="btn btn-danger" [disabled]="!motivoCancelamento.trim()" (click)="confirmarCancelamento()">Confirmar Cancelamento</button>
        </div>
      </div>
    </div>
  `
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
    // Antes de EM_PREPARO: qualquer um. Depois: so ADMIN/GERENTE
    if (p.statusPedido === 'PENDENTE') return true;
    return this.auth.hasAnyRole(['ADMIN', 'GERENTE']);
  }

  abrirCancelamento(p: Pedido): void {
    this.cancelPedidoId = p.id;
    this.cancelEstorno = p.statusPedido === 'EM_PREPARO' || p.statusPedido === 'PRONTO';
    this.motivoCancelamento = '';
    this.showCancelModal = true;
  }

  fecharCancelamento(): void {
    this.showCancelModal = false;
  }

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
