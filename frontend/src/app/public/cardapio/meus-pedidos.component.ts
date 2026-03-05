import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { Pedido } from '../../shared/models/models';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule],
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
            <strong style="color:#F3F4F6;">Pedido #{{pedido.id}}</strong>
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
          <span *ngIf="pedido.observacao" class="pedido-obs"><i class="fas fa-comment" style="margin-right:4px;"></i> {{pedido.observacao}}</span>
          <strong class="pedido-total">R$ {{pedido.total | number:'1.2-2'}}</strong>
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
      margin-bottom: 24px; color: #F9FAFB; font-weight: 700;
      display: flex; align-items: center; gap: 10px;
    }
    .meus-pedidos h2 i { color: #DC2626; font-size: 18px; }
    .pedido-card { margin-bottom: 12px; }
    .pedido-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
    }
    .pedido-data { font-size: 13px; color: #6B7280; }
    .pedido-itens { border-top: 1px solid #1F1F1F; padding-top: 10px; }
    .pedido-item {
      display: flex; justify-content: space-between; padding: 5px 0;
      font-size: 14px; color: #D1D5DB;
    }
    .pedido-footer {
      display: flex; justify-content: space-between; align-items: center;
      border-top: 1px solid #1F1F1F; padding-top: 10px; margin-top: 10px;
    }
    .pedido-obs { font-size: 13px; color: #6B7280; }
    .pedido-total { font-size: 17px; color: #4ADE80; }
  `]
})
export class MeusPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];

  constructor(private api: ApiService) {}

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
}
