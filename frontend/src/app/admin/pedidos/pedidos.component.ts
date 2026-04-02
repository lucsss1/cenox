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
  styleUrls: ['./pedidos.component.css'],
  template: `
    <!-- Page Header -->
    <div class="orders-header">
      <div class="orders-header__left">
        <h1 class="orders-title">Pedidos</h1>
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-label">Ao vivo</span>
        </div>
      </div>
      <div class="orders-header__filters">
        <button class="qf" [class.qf--active]="filtroStatus === ''"    (click)="filtroStatus='';carregar(0)">Todos</button>
        <button class="qf" [class.qf--active]="filtroStatus === 'PENDENTE'"   (click)="filtroStatus='PENDENTE';carregar(0)">Novos</button>
        <button class="qf" [class.qf--active]="filtroStatus === 'EM_PREPARO'" (click)="filtroStatus='EM_PREPARO';carregar(0)">Preparando</button>
        <button class="qf" [class.qf--active]="filtroStatus === 'PRONTO'"     (click)="filtroStatus='PRONTO';carregar(0)">Prontos</button>
        <button class="qf" [class.qf--active]="filtroStatus === 'ENTREGUE'"   (click)="filtroStatus='ENTREGUE';carregar(0)">Entregues</button>
        <button class="qf" [class.qf--active]="filtroStatus === 'CANCELADO'"  (click)="filtroStatus='CANCELADO';carregar(0)">Cancelados</button>
      </div>
    </div>

    <!-- Loading state -->
    <div class="orders-loading" *ngIf="loading">
      <div class="sk sk--card"></div>
      <div class="sk sk--card"></div>
      <div class="sk sk--card"></div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-brigade" *ngIf="!loading">

      <!-- NOVO -->
      <div class="kanban-brigade__col kanban-brigade__col--new">
        <div class="kanban-brigade__col-header">
          <i class="fas fa-bell" style="color:var(--info);font-size:12px;"></i>
          <span class="kanban-brigade__col-label">Novo</span>
          <span class="kanban-brigade__col-count">{{pendentes.length}}</span>
        </div>
        <div class="kanban-brigade__cards">
          <div *ngIf="pendentes.length === 0" class="kanban-empty">Nenhum pedido aguardando</div>
          <div *ngFor="let p of pendentes" class="order-card order-card--new">
            <div class="order-card__top">
              <span class="order-card__number">#{{p.id}}</span>
              <span class="order-card__timer" [class.order-card__timer--warning]="isWarning(p.createdAt)" [class.order-card__timer--urgent]="isUrgent(p.createdAt)">
                <i class="fas fa-clock"></i> {{getAge(p.createdAt)}}
              </span>
            </div>
            <div class="order-card__client">{{p.clienteNome}}</div>
            <div class="order-card__items">
              <div *ngFor="let i of p.itens" class="order-card__item">
                <span class="order-card__item-qty">{{i.quantidade}}x</span>
                <span class="order-card__item-name">{{i.pratoNome}}</span>
              </div>
            </div>
            <div class="order-card__obs" *ngIf="p.observacao">
              <i class="fas fa-comment-alt"></i> {{p.observacao}}
            </div>
            <div class="order-card__footer">
              <span class="order-card__total">R$ {{p.total | number:'1.2-2'}}</span>
              <button *ngIf="canCancel(p)" class="order-card__cancel" (click)="abrirCancelamento(p)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button class="order-card__action order-card__action--confirm" (click)="alterarStatus(p.id, 'EM_PREPARO')">
              <i class="fas fa-fire"></i> Iniciar preparo
            </button>
          </div>
        </div>
      </div>

      <!-- PREPARANDO -->
      <div class="kanban-brigade__col kanban-brigade__col--prep">
        <div class="kanban-brigade__col-header">
          <i class="fas fa-fire" style="color:var(--warning);font-size:12px;"></i>
          <span class="kanban-brigade__col-label">Preparando</span>
          <span class="kanban-brigade__col-count">{{emPreparo.length}}</span>
        </div>
        <div class="kanban-brigade__cards">
          <div *ngIf="emPreparo.length === 0" class="kanban-empty">Nenhum pedido em preparo</div>
          <div *ngFor="let p of emPreparo" class="order-card order-card--preparing">
            <div class="order-card__top">
              <span class="order-card__number">#{{p.id}}</span>
              <span class="order-card__timer" [class.order-card__timer--warning]="isWarning(p.createdAt)" [class.order-card__timer--urgent]="isUrgent(p.createdAt)">
                <i class="fas fa-clock"></i> {{getAge(p.createdAt)}}
              </span>
            </div>
            <div class="order-card__client">{{p.clienteNome}}</div>
            <div class="order-card__items">
              <div *ngFor="let i of p.itens" class="order-card__item">
                <span class="order-card__item-qty">{{i.quantidade}}x</span>
                <span class="order-card__item-name">{{i.pratoNome}}</span>
              </div>
            </div>
            <div class="order-card__obs" *ngIf="p.observacao">
              <i class="fas fa-comment-alt"></i> {{p.observacao}}
            </div>
            <div class="order-card__footer">
              <span class="order-card__total">R$ {{p.total | number:'1.2-2'}}</span>
              <button *ngIf="canCancel(p)" class="order-card__cancel" (click)="abrirCancelamento(p)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button class="order-card__action order-card__action--ready" (click)="alterarStatus(p.id, 'PRONTO')">
              <i class="fas fa-check"></i> Marcar como pronto
            </button>
          </div>
        </div>
      </div>

      <!-- PRONTO -->
      <div class="kanban-brigade__col kanban-brigade__col--ready">
        <div class="kanban-brigade__col-header">
          <i class="fas fa-check-circle" style="color:var(--success);font-size:12px;"></i>
          <span class="kanban-brigade__col-label">Pronto</span>
          <span class="kanban-brigade__col-count">{{prontos.length}}</span>
        </div>
        <div class="kanban-brigade__cards">
          <div *ngIf="prontos.length === 0" class="kanban-empty">Nenhum pedido pronto</div>
          <div *ngFor="let p of prontos" class="order-card order-card--ready">
            <div class="order-card__top">
              <span class="order-card__number">#{{p.id}}</span>
              <span class="order-card__timer">
                <i class="fas fa-clock"></i> {{getAge(p.createdAt)}}
              </span>
            </div>
            <div class="order-card__client">{{p.clienteNome}}</div>
            <div class="order-card__items">
              <div *ngFor="let i of p.itens" class="order-card__item">
                <span class="order-card__item-qty">{{i.quantidade}}x</span>
                <span class="order-card__item-name">{{i.pratoNome}}</span>
              </div>
            </div>
            <div class="order-card__footer">
              <span class="order-card__total">R$ {{p.total | number:'1.2-2'}}</span>
              <button *ngIf="canCancel(p)" class="order-card__cancel" (click)="abrirCancelamento(p)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button class="order-card__action order-card__action--deliver" (click)="alterarStatus(p.id, 'ENTREGUE')">
              <i class="fas fa-hand-holding"></i> Confirmar entrega
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Histórico (entregues/cancelados) — visível quando filtrado -->
    <div class="history-section" *ngIf="!loading && (filtroStatus === 'ENTREGUE' || filtroStatus === 'CANCELADO')">
      <div class="card" style="margin-top:16px;">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pedidos">
                <td class="col-id">#{{p.id}}</td>
                <td><strong>{{p.clienteNome}}</strong></td>
                <td>
                  <div *ngFor="let i of p.itens" class="item-row">{{i.quantidade}}x {{i.pratoNome}}</div>
                </td>
                <td class="col-mono">R$ {{p.total | number:'1.2-2'}}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': p.statusPedido === 'ENTREGUE',
                    'badge-danger': p.statusPedido === 'CANCELADO'
                  }"><span class="badge-dot"></span> {{p.statusPedido}}</span>
                  <div *ngIf="p.motivoCancelamento" class="cancel-reason">
                    {{p.motivoCancelamento}}
                  </div>
                </td>
                <td class="col-date">{{p.createdAt | date:'dd/MM HH:mm'}}</td>
              </tr>
              <tr *ngIf="pedidos.length === 0">
                <td colspan="6" class="empty-row">Nenhum pedido encontrado</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pag-row" *ngIf="totalPages > 1">
          <span class="pagination-info">{{pedidos.length}} pedidos</span>
          <div class="pagination" style="margin-top:0;">
            <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">&laquo;</button>
            <button *ngFor="let pg of pages" (click)="carregar(pg)" [class.active]="pg === currentPage">{{pg + 1}}</button>
            <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">&raquo;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelamento -->
    <div class="modal-overlay" *ngIf="showCancelModal" (click)="fecharCancelamento()">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <p class="confirm-modal__title">Cancelar Pedido #{{cancelPedidoId}}</p>
        <div class="form-group" style="margin-bottom:0;">
          <label>Motivo do cancelamento *</label>
          <textarea class="form-control" [(ngModel)]="motivoCancelamento" rows="3"
                    placeholder="Informe o motivo do cancelamento..."></textarea>
        </div>
        <p *ngIf="cancelEstorno" class="estorno-warn">
          <i class="fas fa-exclamation-triangle"></i> O estoque dos insumos sera estornado automaticamente.
        </p>
        <div class="confirm-modal__actions" style="margin-top:20px;">
          <button class="btn btn-secondary" (click)="fecharCancelamento()">Voltar</button>
          <button class="btn btn-danger" [disabled]="!motivoCancelamento.trim()" (click)="confirmarCancelamento()">
            Confirmar cancelamento
          </button>
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

  // UI state only
  get pendentes(): Pedido[] { return this.pedidos.filter(p => p.statusPedido === 'PENDENTE'); }
  get emPreparo(): Pedido[] { return this.pedidos.filter(p => p.statusPedido === 'EM_PREPARO'); }
  get prontos():   Pedido[] { return this.pedidos.filter(p => p.statusPedido === 'PRONTO'); }

  getAge(createdAt: string): string {
    if (!createdAt) return '';
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return diff < 60 ? `${diff}min` : `${Math.floor(diff/60)}h${diff%60}m`;
  }

  isWarning(createdAt: string): boolean {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return diff >= 15 && diff < 25;
  }

  isUrgent(createdAt: string): boolean {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return diff >= 25;
  }

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
