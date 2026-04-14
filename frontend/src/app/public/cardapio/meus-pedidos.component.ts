import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Pedido } from '../../shared/models/models';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="meus-pedidos">
      <h2><i class="fas fa-clipboard-list"></i> Meus Pedidos</h2>

      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>

      <div *ngIf="!loading && pedidos.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h3>Nenhum pedido ainda</h3>
        <p>Voce ainda nao tem pedidos. Explore nosso cardapio!</p>
      </div>

      <div *ngFor="let pedido of pedidos" class="card pedido-card">
        <div class="pedido-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <strong style="color:var(--text-primary);">Pedido #{{pedido.id}}</strong>
            <span class="badge" [ngClass]="{
              'badge-warning': pedido.statusPedido === 'PENDENTE',
              'badge-info': pedido.statusPedido === 'EM_PREPARO',
              'badge-success': pedido.statusPedido === 'PRONTO' || pedido.statusPedido === 'ENTREGUE',
              'badge-danger': pedido.statusPedido === 'CANCELADO'
            }"><span class="badge-dot"></span> {{pedido.statusPedido}}</span>
          </div>
          <span class="pedido-data">{{pedido.createdAt | date:'dd/MM/yyyy HH:mm'}}</span>
        </div>
        <div class="pedido-itens">
          <div *ngFor="let item of pedido.itens" class="pedido-item">
            <span>{{item.quantidade}}x {{item.pratoNome}}</span>
            <span>R$ {{item.subtotal | number:'1.2-2'}}</span>
          </div>
        </div>
        <div class="pedido-footer">
          <div style="display:flex;align-items:center;gap:12px;flex:1;">
            <span *ngIf="pedido.observacao" class="pedido-obs"><i class="fas fa-comment" style="margin-right:4px;"></i> {{pedido.observacao}}</span>
            <button *ngIf="pedido.statusPedido === 'PENDENTE'" class="btn-cancelar"
                    (click)="abrirCancelamento(pedido)">
              <i class="fas fa-times-circle"></i> Cancelar pedido
            </button>
          </div>
          <strong class="pedido-total">R$ {{pedido.total | number:'1.2-2'}}</strong>
        </div>
      </div>

      <!-- Modal de Cancelamento -->
      <div class="modal-overlay" *ngIf="showCancelModal" (click)="fecharCancelModal()">
        <div class="cancel-modal" (click)="$event.stopPropagation()">
          <div class="cancel-modal-header">
            <div class="cancel-icon-circle">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Cancelar Pedido #{{pedidoCancelando?.id}}</h3>
            <p>Esta acao nao pode ser desfeita. Informe o motivo do cancelamento.</p>
          </div>
          <div class="form-group">
            <label>Motivo do cancelamento</label>
            <textarea class="form-control" [(ngModel)]="motivoCancelamento" rows="3"
                      placeholder="Ex: Pedi errado, mudei de ideia, demora excessiva..."></textarea>
          </div>
          <div class="cancel-modal-footer">
            <button class="btn btn-secondary" (click)="fecharCancelModal()">Voltar</button>
            <button class="btn btn-danger" (click)="confirmarCancelamento()"
                    [disabled]="!motivoCancelamento.trim() || cancelando">
              <i class="fas fa-times-circle" *ngIf="!cancelando"></i>
              <div class="spinner" style="width:14px;height:14px;border-width:2px;" *ngIf="cancelando"></div>
              {{cancelando ? 'Cancelando...' : 'Confirmar cancelamento'}}
            </button>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregarPagina(currentPage - 1)" [disabled]="currentPage === 0">&laquo; Anterior</button>
        <button *ngFor="let p of pages" (click)="carregarPagina(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregarPagina(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo &raquo;</button>
      </div>
    </div>
  `,
  styles: [`
    .meus-pedidos { max-width: 800px; margin: 0 auto; }
    .meus-pedidos h2 {
      margin-bottom: 24px; color: var(--text-primary); font-weight: 700;
      display: flex; align-items: center; gap: 10px;
    }
    .meus-pedidos h2 i { color: var(--primary); font-size: 18px; }
    .pedido-card { margin-bottom: 12px; }
    .pedido-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
    }
    .pedido-data { font-size: 13px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pedido-itens { border-top: 1px solid var(--border); padding-top: 10px; }
    .pedido-item {
      display: flex; justify-content: space-between; padding: 5px 0;
      font-size: 14px; color: var(--text-secondary);
    }
    .pedido-footer {
      display: flex; justify-content: space-between; align-items: center;
      border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px;
    }
    .pedido-obs { font-size: 13px; color: var(--text-muted); }
    .pedido-total {
      font-size: 17px; color: var(--success-light);
      font-family: 'JetBrains Mono', monospace; font-weight: 700;
    }

    .btn-cancelar {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; min-height: 44px;
      border: 1px solid rgba(220,38,38,0.3);
      background: rgba(220,38,38,0.06); border-radius: var(--radius);
      color: #FCA5A5; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-cancelar:hover {
      background: rgba(220,38,38,0.14); border-color: rgba(220,38,38,0.5);
      color: #FEE2E2;
    }
    .btn-cancelar i { font-size: 12px; }

    .cancel-modal {
      background: var(--bg-surface); border-radius: var(--radius-xl); padding: 28px;
      width: 440px; max-width: 90vw;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid var(--border-light);
    }
    .cancel-modal-header { text-align: center; margin-bottom: 20px; }
    .cancel-icon-circle {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(220,38,38,0.1); display: flex;
      align-items: center; justify-content: center;
      margin: 0 auto 14px;
    }
    .cancel-icon-circle i { font-size: 24px; color: var(--danger); }
    .cancel-modal-header h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .cancel-modal-header p { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
    .cancel-modal-footer {
      display: flex; gap: 8px; justify-content: flex-end;
      margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);
    }
  `]
})
export class MeusPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];

  showCancelModal = false;
  pedidoCancelando: Pedido | null = null;
  motivoCancelamento = '';
  cancelando = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.loading = true;
    this.api.getMeusPedidos(this.currentPage).subscribe({
      next: (page) => {
        this.pedidos = page.content;
        this.totalPages = page.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  carregarPagina(page: number): void {
    this.currentPage = page;
    this.carregar();
  }

  abrirCancelamento(pedido: Pedido): void {
    this.pedidoCancelando = pedido;
    this.motivoCancelamento = '';
    this.cancelando = false;
    this.showCancelModal = true;
  }

  fecharCancelModal(): void {
    this.showCancelModal = false;
    this.pedidoCancelando = null;
    this.motivoCancelamento = '';
  }

  confirmarCancelamento(): void {
    if (!this.pedidoCancelando || !this.motivoCancelamento.trim()) return;
    this.cancelando = true;
    this.api.alterarStatusPedido(this.pedidoCancelando.id, 'CANCELADO', this.motivoCancelamento.trim()).subscribe({
      next: () => {
        this.toast.success('Pedido cancelado com sucesso.');
        this.fecharCancelModal();
        this.carregar();
      },
      error: () => {
        this.cancelando = false;
      }
    });
  }
}
