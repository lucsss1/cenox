import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderRealtimeService } from '../../shared/services/order-realtime.service';
import { ApiService } from '../../shared/services/api.service';
import { Pedido } from '../../shared/models/models';

type Col = { status: string; label: string; icon: string; next?: string; nextLabel?: string; };

const COLUMNS: Col[] = [
  { status: 'PENDENTE',   label: 'Pendentes',  icon: 'fa-clock',        next: 'EM_PREPARO', nextLabel: 'Iniciar'  },
  { status: 'EM_PREPARO', label: 'Em Preparo', icon: 'fa-fire',         next: 'PRONTO',     nextLabel: 'Pronto'  },
  { status: 'PRONTO',     label: 'Prontos',    icon: 'fa-check-circle', next: 'ENTREGUE',   nextLabel: 'Entregar' },
  { status: 'ENTREGUE',   label: 'Entregues',  icon: 'fa-truck'         },
];

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./kanban.component.css'],
  template: `
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2><i class="fas fa-fire"></i> Pedidos</h2>
        <p class="page-subtitle" *ngIf="activeView === 'board'">Atualiza automaticamente a cada 30s</p>
        <p class="page-subtitle" *ngIf="activeView === 'historico'">Pedidos finalizados e cancelados</p>
      </div>
      <div class="header-actions">
        <!-- View switcher -->
        <div class="view-tabs">
          <button class="view-tab" [class.active]="activeView === 'board'" (click)="setView('board')">
            <i class="fas fa-columns"></i> Ao vivo
          </button>
          <button class="view-tab" [class.active]="activeView === 'historico'" (click)="setView('historico')">
            <i class="fas fa-history"></i> Histórico
          </button>
        </div>

        <!-- Board actions -->
        <ng-container *ngIf="activeView === 'board'">
          <span *ngIf="newCount > 0" class="kanban-new-pill">
            <i class="fas fa-bell"></i> {{newCount}} novo(s)
          </span>
          <button class="btn btn-secondary btn-sm" (click)="refresh()">
            <i class="fas fa-sync-alt"></i> Atualizar
          </button>
          <button class="btn btn-secondary btn-sm" (click)="requestNotif()" *ngIf="notifStatus !== 'granted'">
            <i class="fas fa-bell"></i> Notificações
          </button>
        </ng-container>

        <!-- History actions -->
        <ng-container *ngIf="activeView === 'historico'">
          <div class="hist-filters">
            <button class="hf" [class.active]="histFiltro === ''"          (click)="histFiltro='';carregarHistorico(0)">Todos</button>
            <button class="hf" [class.active]="histFiltro === 'ENTREGUE'"  (click)="histFiltro='ENTREGUE';carregarHistorico(0)">Entregues</button>
            <button class="hf" [class.active]="histFiltro === 'CANCELADO'" (click)="histFiltro='CANCELADO';carregarHistorico(0)">Cancelados</button>
          </div>
        </ng-container>
      </div>
    </div>

    <!-- ═══ VIEW: BOARD ═══ -->
    <div class="kanban-board" *ngIf="activeView === 'board'">
      <div class="kanban-col" [ngClass]="'kanban-col-' + col.status" *ngFor="let col of columns">

        <div class="kanban-col-header">
          <i class="fas {{col.icon}}"></i>
          <span>{{col.label}}</span>
          <span class="col-count">{{getByStatus(col.status).length}}</span>
        </div>

        <div class="kanban-cards">
          <div *ngIf="getByStatus(col.status).length === 0" class="kanban-empty">
            <i class="fas fa-inbox" style="margin-right:5px;"></i> Nenhum pedido
          </div>

          <div
            *ngFor="let p of getByStatus(col.status)"
            class="kanban-card"
            [class.is-new]="isNew(p.id)"
            [class.urgent]="isUrgent(p)">

            <div class="card-top">
              <span class="order-id">#{{p.id}}</span>
              <span *ngIf="isNew(p.id)" class="new-badge">NOVO</span>
              <span class="order-age" [class.age-warn]="isUrgent(p)">{{age(p.createdAt)}}</span>
            </div>

            <div class="card-client"><i class="fas fa-user"></i> {{p.clienteNome}}</div>

            <div class="card-items">
              <div *ngFor="let it of p.itens" class="card-item">
                <span class="item-qty">{{it.quantidade}}x</span>
                <span class="item-name">{{it.pratoNome}}</span>
                <span *ngIf="it.observacao" class="item-obs">— {{it.observacao}}</span>
              </div>
            </div>

            <div *ngIf="p.observacao" class="card-obs">
              <i class="fas fa-comment-alt"></i> {{p.observacao}}
            </div>

            <div class="card-footer">
              <span class="card-total">R$ {{p.total | number:'1.2-2'}}</span>
              <div style="display:flex;gap:6px;">
                <button
                  *ngIf="col.next"
                  class="btn-advance"
                  [disabled]="advancing[p.id]"
                  (click)="advance(p, col.next!, col)">
                  <i class="fas fa-arrow-right"></i> {{col.nextLabel}}
                </button>
                <button
                  *ngIf="col.status === 'PENDENTE'"
                  class="btn-cancel"
                  (click)="openCancel(p)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ VIEW: HISTÓRICO ═══ -->
    <div class="hist-panel" *ngIf="activeView === 'historico'">

      <!-- Loading skeleton -->
      <div class="hist-skeleton" *ngIf="histLoading">
        <div class="sk-row" *ngFor="let i of [1,2,3,4,5]"></div>
      </div>

      <!-- Table -->
      <div class="hist-card" *ngIf="!histLoading">
        <table class="hist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of histPedidos">
              <td class="col-id">#{{p.id}}</td>
              <td><strong>{{p.clienteNome}}</strong></td>
              <td>
                <div *ngFor="let i of p.itens" class="hist-item">{{i.quantidade}}x {{i.pratoNome}}</div>
              </td>
              <td class="col-mono">R$ {{p.total | number:'1.2-2'}}</td>
              <td>
                <span class="badge" [class.badge-success]="p.statusPedido === 'ENTREGUE'"
                                    [class.badge-danger]="p.statusPedido === 'CANCELADO'">
                  {{p.statusPedido}}
                </span>
                <div *ngIf="p.motivoCancelamento" class="cancel-reason">
                  {{p.motivoCancelamento}}
                </div>
              </td>
              <td class="col-date">{{p.createdAt | date:'dd/MM HH:mm'}}</td>
            </tr>
            <tr *ngIf="histPedidos.length === 0">
              <td colspan="6" class="hist-empty">Nenhum pedido encontrado</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="hist-pag" *ngIf="histTotalPages > 1">
          <span class="pag-info">{{histPedidos.length}} pedidos</span>
          <div class="pag-buttons">
            <button (click)="carregarHistorico(histPage - 1)" [disabled]="histPage === 0">&laquo;</button>
            <button *ngFor="let pg of histPages"
                    (click)="carregarHistorico(pg)"
                    [class.active]="pg === histPage">{{pg + 1}}</button>
            <button (click)="carregarHistorico(histPage + 1)" [disabled]="histPage === histTotalPages - 1">&raquo;</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel modal -->
    <div class="modal-overlay" *ngIf="cancelModal" (click)="cancelModal=null">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Cancelar Pedido #{{cancelModal.id}}</h3>
          <button class="modal-close" (click)="cancelModal=null">&times;</button>
        </div>
        <div class="form-group" style="margin-top:4px;">
          <label>Motivo *</label>
          <textarea class="form-control" rows="3" [(ngModel)]="cancelMotivo"
            placeholder="Informe o motivo do cancelamento"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancelModal=null">Voltar</button>
          <button class="btn btn-danger" (click)="confirmCancel()" [disabled]="!cancelMotivo.trim()">
            Cancelar Pedido
          </button>
        </div>
      </div>
    </div>
  `
})
export class KanbanComponent implements OnInit, OnDestroy {
  columns = COLUMNS;
  pedidos: Pedido[] = [];
  advancing: Record<number, boolean> = {};
  cancelModal: Pedido | null = null;
  cancelMotivo = '';
  notifStatus = 'default';
  private sub: Subscription | null = null;

  // UI state only
  activeView: 'board' | 'historico' = 'board';

  // History state
  histPedidos: Pedido[] = [];
  histLoading = false;
  histFiltro = '';
  histPage = 0;
  histTotalPages = 0;
  histPages: number[] = [];

  constructor(
    private realtime: OrderRealtimeService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    if ('Notification' in window) this.notifStatus = Notification.permission;
    this.realtime.start(30000);
    this.sub = this.realtime.pedidos$.subscribe(p => this.pedidos = p);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.realtime.stop();
  }

  setView(v: 'board' | 'historico'): void {
    this.activeView = v;
    if (v === 'historico' && this.histPedidos.length === 0) {
      this.carregarHistorico(0);
    }
  }

  carregarHistorico(page: number): void {
    this.histPage = page;
    this.histLoading = true;
    const obs = this.histFiltro
      ? this.api.getPedidosPorStatus(this.histFiltro, page)
      : this.api.getPedidos(page);
    obs.subscribe({
      next: (r) => {
        this.histPedidos = (r as any).content;
        this.histTotalPages = (r as any).totalPages;
        this.histPages = Array.from({ length: (r as any).totalPages }, (_, i) => i);
        this.histLoading = false;
      },
      error: () => { this.histLoading = false; }
    });
  }

  getByStatus(status: string): Pedido[] {
    return this.pedidos.filter(p => p.statusPedido === status);
  }

  get newCount(): number { return this.realtime['_newOrderIds$'].value.size; }
  isNew(id: number): boolean { return this.realtime['_newOrderIds$'].value.has(id); }

  isUrgent(p: Pedido): boolean {
    const mins = (Date.now() - new Date(p.createdAt).getTime()) / 60000;
    return mins > 20 && p.statusPedido === 'PENDENTE';
  }

  age(createdAt: string): string {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff === 1) return '1 min';
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }

  advance(p: Pedido, next: string, col: Col): void {
    this.advancing[p.id] = true;
    this.realtime.clearNew(p.id);
    this.api.alterarStatusPedido(p.id, next).subscribe({
      next: () => { this.advancing[p.id] = false; this.realtime.refresh(); },
      error: () => { this.advancing[p.id] = false; }
    });
  }

  openCancel(p: Pedido): void {
    this.cancelModal = p;
    this.cancelMotivo = '';
  }

  confirmCancel(): void {
    if (!this.cancelModal || !this.cancelMotivo.trim()) return;
    this.api.alterarStatusPedido(this.cancelModal.id, 'CANCELADO', this.cancelMotivo).subscribe({
      next: () => { this.cancelModal = null; this.realtime.refresh(); },
      error: () => {}
    });
  }

  refresh(): void { this.realtime.refresh(); }

  requestNotif(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => this.notifStatus = p);
    }
  }
}
