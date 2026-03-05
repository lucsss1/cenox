import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { CartItem } from '../../shared/models/models';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="carrinho">
      <h2><i class="fas fa-shopping-cart"></i> Meu Carrinho</h2>

      <div *ngIf="itens.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Seu carrinho esta vazio</h3>
        <p>Adicione pratos do cardapio para comecar seu pedido.</p>
        <a routerLink="/cardapio" class="btn btn-primary" style="margin-top:16px;">Ver Cardapio</a>
      </div>

      <div *ngIf="itens.length > 0">
        <div class="card" style="margin-bottom:16px;">
          <table>
            <thead>
              <tr>
                <th>Prato</th>
                <th>Preco</th>
                <th>Qtd</th>
                <th>Subtotal</th>
                <th>Obs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of itens">
                <td><strong style="color:#F3F4F6;">{{item.prato.nome}}</strong></td>
                <td>R$ {{item.prato.precoVenda | number:'1.2-2'}}</td>
                <td style="width:80px;">
                  <input type="number" class="form-control" min="1" [(ngModel)]="item.quantidade"
                    (change)="atualizar()" style="width:60px;padding:6px 8px;">
                </td>
                <td><strong style="color:#4ADE80;">R$ {{item.prato.precoVenda * item.quantidade | number:'1.2-2'}}</strong></td>
                <td style="width:150px;">
                  <input type="text" class="form-control" [(ngModel)]="item.observacao"
                    placeholder="Sem cebola..." style="padding:6px 8px;font-size:12px;">
                </td>
                <td>
                  <button class="btn-icon btn-icon-danger" (click)="remover(item.prato.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cart-summary card">
          <div class="form-group">
            <label>Observacao geral do pedido</label>
            <input type="text" class="form-control" [(ngModel)]="observacao" placeholder="Ex: Mesa 5, sem pressa...">
          </div>
          <div class="cart-total">
            <span>Total:</span>
            <span class="total-valor">R$ {{auth.getCartTotal() | number:'1.2-2'}}</span>
          </div>
          <button class="btn btn-success btn-block" (click)="finalizar()" [disabled]="loading">
            <span class="spinner" *ngIf="loading" style="width:16px;height:16px;border-width:2px;"></span>
            {{ loading ? 'Enviando...' : 'Finalizar Pedido' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carrinho { max-width: 900px; margin: 0 auto; }
    .carrinho h2 {
      margin-bottom: 24px; color: #F9FAFB; font-weight: 700;
      display: flex; align-items: center; gap: 10px;
    }
    .carrinho h2 i { color: #DC2626; font-size: 18px; }
    .cart-summary { margin-top: 16px; }
    .cart-total {
      display: flex; justify-content: space-between; align-items: center;
      margin: 16px 0; padding-top: 16px; border-top: 2px solid #DC2626;
    }
    .cart-total span:first-child { font-size: 16px; font-weight: 600; color: #9CA3AF; }
    .total-valor { font-size: 26px; font-weight: 700; color: #4ADE80; }
    .btn-block { width: 100%; justify-content: center; padding: 14px; font-size: 16px; }
    .btn-success.btn-block:hover { box-shadow: 0 0 20px rgba(22,163,74,0.3); }
  `]
})
export class CarrinhoComponent {
  itens: CartItem[] = [];
  observacao = '';
  loading = false;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {
    this.itens = this.auth.getCart();
  }

  atualizar(): void {
    localStorage.setItem('carrinho', JSON.stringify(this.itens));
  }

  remover(pratoId: number): void {
    this.auth.removeFromCart(pratoId);
    this.itens = this.auth.getCart();
    this.toast.success('Item removido do carrinho');
  }

  finalizar(): void {
    if (this.itens.length === 0) return;
    this.loading = true;

    const request = {
      observacao: this.observacao,
      itens: this.itens.map(i => ({
        pratoId: i.prato.id,
        quantidade: i.quantidade,
        observacao: i.observacao
      }))
    };

    this.api.createPedido(request).subscribe({
      next: () => {
        this.auth.clearCart();
        this.toast.success('Pedido realizado com sucesso!');
        this.router.navigate(['/meus-pedidos']);
      },
      error: () => { this.loading = false; }
    });
  }
}
