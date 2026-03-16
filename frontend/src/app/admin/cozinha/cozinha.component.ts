import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../shared/services/api.service';
import { Pedido } from '../../shared/models/models';

@Component({
  selector: 'app-cozinha',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cozinha-wrapper">
      <!-- Header -->
      <div class="cozinha-header">
        <div class="header-left">
          <i class="fas fa-fire" style="color:var(--primary);font-size:22px;"></i>
          <div>
            <div class="cozinha-title">Modo Cozinha</div>
            <div class="cozinha-sub">
              {{agora | date:'HH:mm:ss'}} &mdash;
              {{pendentes.length}} aguardando &bull; {{emPreparo.length}} em preparo
            </div>
          </div>
        </div>
        <div class="header-right">
          <span *ngIf="ultimaAtualizacao" class="last-update">
            <i class="fas fa-circle" style="font-size:6px;color:var(--success-light);"></i>
            Atualizado {{ultimaAtualizacao}}
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading" style="padding:60px;"><div class="spinner"></div></div>

      <!-- Board -->
      <div *ngIf="!loading" class="cozinha-board">

        <!-- PENDENTES -->
        <div class="cozinha-col pendente-col">
          <div class="col-title">
            <i class="fas fa-clock"></i> AGUARDANDO ({{pendentes.length}})
          </div>
          <div *ngIf="pendentes.length === 0" class="col-empty">
            <i class="fas fa-check-circle" style="color:var(--success-light);font-size:28px;display:block;margin-bottom:8px;"></i>
            Sem pedidos pendentes
          </div>
          <div *ngFor="let p of pendentes" class="ticket" [class.ticket-urgent]="isUrgent(p)">
            <div class="ticket-header">
              <span class="ticket-id">#{{p.id}}</span>
              <span class="ticket-age" [class.age-red]="isUrgent(p)">{{age(p.createdAt)}}</span>
              <button class="btn-iniciar" (click)="iniciar(p)" [disabled]="advancing[p.id]">
                <i class="fas fa-play"></i> INICIAR
              </button>
            </div>
            <div class="ticket-client">
              <i class="fas fa-user" style="margin-right:4px;opacity:0.5;"></i>{{p.clienteNome}}
            </div>
            <div class="ticket-items">
              <div *ngFor="let it of p.itens" class="ticket-item">
                <span class="tqty">{{it.quantidade}}x</span>
                <span class="tname">{{it.pratoNome}}</span>
                <span *ngIf="it.observacao" class="tobs">{{it.observacao}}</span>
              </div>
            </div>
            <div *ngIf="p.observacao" class="ticket-obs">
              <i class="fas fa-sticky-note"></i> {{p.observacao}}
            </div>
          </div>
        </div>

        <!-- EM PREPARO -->
        <div class="cozinha-col preparo-col">
          <div class="col-title">
            <i class="fas fa-fire"></i> EM PREPARO ({{emPreparo.length}})
          </div>
          <div *ngIf="emPreparo.length === 0" class="col-empty">
            Nenhum pedido em preparo
          </div>
          <div *ngFor="let p of emPreparo" class="ticket ticket-preparo">
            <div class="ticket-header">
              <span class="ticket-id">#{{p.id}}</span>
              <span class="ticket-age">{{age(p.createdAt)}}</span>
              <button class="btn-pronto" (click)="marcarPronto(p)" [disabled]="advancing[p.id]">
                <i class="fas fa-check"></i> PRONTO
              </button>
            </div>
            <div class="ticket-client">
              <i class="fas fa-user" style="margin-right:4px;opacity:0.5;"></i>{{p.clienteNome}}
            </div>
            <div class="ticket-items">
              <div *ngFor="let it of p.itens" class="ticket-item">
                <span class="tqty">{{it.quantidade}}x</span>
                <span class="tname">{{it.pratoNome}}</span>
                <span *ngIf="it.observacao" class="tobs">{{it.observacao}}</span>
              </div>
            </div>
            <div *ngIf="p.observacao" class="ticket-obs">
              <i class="fas fa-sticky-note"></i> {{p.observacao}}
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .cozinha-wrapper {
      background: var(--bg-base);
      margin: -28px -32px;
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 48px);
    }
    @media (max-width: 768px) { .cozinha-wrapper { margin: -20px -16px; } }

    .cozinha-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      gap: 12px;
      flex-shrink: 0;
    }
    .header-left  { display: flex; align-items: center; gap: 12px; }
    .header-right { display: flex; align-items: center; gap: 10px; }
    .cozinha-title { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .cozinha-sub   { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
    .last-update   { font-size: 11px; color: var(--text-faint); display: flex; align-items: center; gap: 5px; }

    .cozinha-board {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 12px;
      flex: 1;
      align-items: start;
    }
    @media (max-width: 700px) { .cozinha-board { grid-template-columns: 1fr; } }

    .cozinha-col {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .pendente-col { --col-border: var(--warning); }
    .preparo-col  { --col-border: var(--info); }

    .col-title {
      padding: 14px 18px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.07em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid var(--col-border, var(--border));
    }
    .col-title i { color: var(--col-border, var(--text-muted)); }
    .col-empty {
      padding: 36px;
      text-align: center;
      color: var(--text-faint);
      font-size: 14px;
    }

    .ticket {
      margin: 8px;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      padding: 16px;
    }
    .ticket-urgent { border-color: var(--primary-light); background: rgba(239,68,68,0.04); }
    .ticket-preparo { border-left: 3px solid var(--info); }

    .ticket-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .ticket-id  { font-size: 26px; font-weight: 800; color: var(--text-primary); }
    .ticket-age { font-size: 12px; color: var(--text-faint); margin-left: auto; }
    .ticket-age.age-red { color: var(--primary-light); font-weight: 700; }
    .ticket-client { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

    .ticket-items {
      border-top: 1px solid var(--border);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .ticket-item { display: flex; gap: 8px; align-items: baseline; }
    .tqty { font-size: 22px; font-weight: 800; color: var(--warning); min-width: 34px; }
    .tname { font-size: 17px; font-weight: 600; color: var(--text-primary); }
    .tobs  { font-size: 12px; color: var(--text-muted); font-style: italic; }
    .ticket-obs {
      margin-top: 10px;
      font-size: 12px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 8px;
    }

    .btn-iniciar {
      background: var(--warning);
      color: #0A0A0A;
      border: none;
      border-radius: var(--radius);
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: var(--transition);
    }
    .btn-iniciar:hover:not(:disabled) { background: #B45309; }
    .btn-iniciar:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-pronto {
      background: var(--success);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: var(--transition);
    }
    .btn-pronto:hover:not(:disabled) { background: #15803D; }
    .btn-pronto:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CozinhaComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  loading = true;
  advancing: Record<number, boolean> = {};
  agora = new Date();
  ultimaAtualizacao = '';
  private sub: Subscription | null = null;
  private clockSub: Subscription | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.sub = interval(15000).pipe(switchMap(() => this.api.getPedidosAtivos()))
      .subscribe(p => this.process(p));
    this.clockSub = interval(1000).subscribe(() => this.agora = new Date());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.clockSub?.unsubscribe();
  }

  get pendentes(): Pedido[] { return this.pedidos.filter(p => p.statusPedido === 'PENDENTE'); }
  get emPreparo(): Pedido[] { return this.pedidos.filter(p => p.statusPedido === 'EM_PREPARO'); }

  private load(): void {
    this.api.getPedidosAtivos().subscribe(p => { this.process(p); this.loading = false; });
  }

  private process(p: Pedido[]): void {
    this.pedidos = p;
    const now = new Date();
    this.ultimaAtualizacao = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  }

  isUrgent(p: Pedido): boolean {
    return (Date.now() - new Date(p.createdAt).getTime()) / 60000 > 15;
  }

  age(createdAt: string): string {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff === 1) return '1 min';
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }

  iniciar(p: Pedido): void {
    this.advancing[p.id] = true;
    this.api.alterarStatusPedido(p.id, 'EM_PREPARO').subscribe({
      next: () => { this.advancing[p.id] = false; this.load(); },
      error: () => { this.advancing[p.id] = false; }
    });
  }

  marcarPronto(p: Pedido): void {
    this.advancing[p.id] = true;
    this.api.alterarStatusPedido(p.id, 'PRONTO').subscribe({
      next: () => { this.advancing[p.id] = false; this.load(); },
      error: () => { this.advancing[p.id] = false; }
    });
  }
}
