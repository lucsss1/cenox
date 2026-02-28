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

      <div *ngIf="!loading && pedidos.length === 0" style="text-align:center;padding:40px;color:var(--gray-500);">
        <p>Voce ainda nao tem pedidos.</p>
      </div>

      <div *ngFor="let pedido of pedidos" class="card pedido-card">
        <div class="pedido-header">
          <div>
            <strong>Pedido #{{pedido.id}}</strong>
            <span class="badge" [ngClass]="{
              'badge-warning': pedido.statusPedido === 'PENDENTE',
              'badge-info': pedido.statusPedido === 'EM_PREPARO',
              'badge-success': pedido.statusPedido === 'PRONTO' || pedido.statusPedido === 'ENTREGUE',
              'badge-danger': pedido.statusPedido === 'CANCELADO'
            }">{{pedido.statusPedido}}</span>
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
          <span *ngIf="pedido.observacao" class="pedido-obs">Obs: {{pedido.observacao}}</span>
          <strong class="pedido-total">Total: R$ {{pedido.total | number:'1.2-2'}}</strong>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregarPagina(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let p of pages" (click)="carregarPagina(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregarPagina(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
      </div>
    </div>
  `,
  styles: [`
    .meus-pedidos { max-width: 800px; margin: 0 auto; }
    .meus-pedidos h2 { margin-bottom: 20px; }
    .pedido-card { margin-bottom: 12px; }
    .pedido-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .pedido-header .badge { margin-left: 8px; }
    .pedido-data { font-size: 13px; color: var(--gray-500); }
    .pedido-itens { border-top: 1px solid var(--gray-200); padding-top: 8px; }
    .pedido-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .pedido-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--gray-200); padding-top: 8px; margin-top: 8px; }
    .pedido-obs { font-size: 13px; color: var(--gray-500); }
    .pedido-total { font-size: 16px; color: var(--success); }
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
