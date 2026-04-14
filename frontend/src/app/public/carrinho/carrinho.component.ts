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
                <td><strong style="color:var(--text-dark);">{{item.prato.nome}}</strong></td>
                <td style="color:var(--text-body);">R$ {{item.prato.precoVenda | number:'1.2-2'}}</td>
                <td style="width:80px;">
                  <input type="number" class="form-control" min="1" [(ngModel)]="item.quantidade"
                    (change)="atualizar()" style="width:60px;padding:6px 8px;">
                </td>
                <td><strong style="color:var(--brand);">R$ {{item.prato.precoVenda * item.quantidade | number:'1.2-2'}}</strong></td>
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
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    :host {
      --brand:        #D4531A;
      --brand-hover:  #B84412;
      --brand-shadow: rgba(212, 83, 26, 0.28);
      --brand-subtle: rgba(212, 83, 26, 0.08);
      --brand-muted:  rgba(212, 83, 26, 0.18);
      --card-bg:      #FFFFFF;
      --input-bg:     #F5F0EB;
      --text-dark:    #1A1A1A;
      --text-body:    #4A4A4A;
      --text-muted:   #9A9A9A;
      --border:       #E0D8D0;
      font-family: 'Poppins', sans-serif;
      display: block;
      background: #EDE8E0;
      min-height: calc(100vh - 58px);
      padding-bottom: 64px;
    }

    /* ── Override global BRIGADE classes ─────────── */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    table { border-color: var(--border); }
    th {
      background: var(--input-bg);
      color: var(--text-muted);
      border-color: var(--border);
      font-family: 'Poppins', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    td {
      color: var(--text-body);
      border-color: var(--border);
      font-family: 'Poppins', sans-serif;
    }
    .form-control {
      background: var(--input-bg);
      border: 1.5px solid var(--border);
      color: var(--text-dark);
      font-family: 'Poppins', sans-serif;
    }
    .form-control:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-subtle);
    }
    .form-control::placeholder { color: var(--text-muted); }
    label { color: var(--text-body); font-family: 'Poppins', sans-serif; }

    .empty-state-icon {
      background: var(--input-bg);
      border: 1.5px solid var(--border);
    }
    .empty-state-icon i { color: var(--brand); }
    .empty-state h3 { color: var(--text-dark); font-family: 'Poppins', sans-serif; }
    .empty-state p { color: var(--text-muted); }

    .btn-primary {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--brand-hover);
      box-shadow: 0 4px 16px var(--brand-shadow);
    }
    .btn-success {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
      font-family: 'Poppins', sans-serif;
    }
    .btn-success:hover:not(:disabled) {
      background: var(--brand-hover);
      box-shadow: 0 4px 16px var(--brand-shadow);
    }
    .btn-icon-danger {
      background: rgba(212, 83, 26, 0.08);
      border: 1px solid rgba(212, 83, 26, 0.20);
      color: var(--brand);
    }
    .btn-icon-danger:hover {
      background: rgba(212, 83, 26, 0.16);
      border-color: var(--brand);
    }

    /* ── Component styles ────────────────────────── */
    .carrinho { max-width: 900px; margin: 0 auto; padding: 32px 24px 0; font-family: 'Poppins', sans-serif; }
    .carrinho h2 {
      margin-bottom: 24px; color: var(--text-dark); font-weight: 700;
      display: flex; align-items: center; gap: 10px;
      font-family: 'Poppins', sans-serif; font-size: 24px;
    }
    .carrinho h2 i { color: var(--brand); font-size: 18px; }
    .cart-summary { margin-top: 16px; }
    .cart-total {
      display: flex; justify-content: space-between; align-items: center;
      margin: 16px 0; padding-top: 16px; border-top: 2px solid var(--border);
    }
    .cart-total span:first-child { font-size: 16px; font-weight: 600; color: var(--text-muted); }
    .total-valor { font-size: 26px; font-weight: 700; color: var(--brand); font-family: 'Poppins', sans-serif; }
    .btn-block { width: 100%; justify-content: center; padding: 14px; font-size: 16px; }
    .btn-success.btn-block:hover { box-shadow: 0 4px 20px var(--brand-shadow); }
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
