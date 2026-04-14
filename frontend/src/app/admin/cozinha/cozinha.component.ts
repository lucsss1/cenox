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
  styleUrls: ['./cozinha.component.css'],
  template: `
    <div class="cozinha-wrapper">
      <!-- Header -->
      <div class="cozinha-header">
        <div class="header-left">
          <i class="fas fa-fire" style="color:#D4531A;font-size:22px;"></i>
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
            <i class="fas fa-circle" style="font-size:6px;color:#22C55E;"></i>
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
            <i class="fas fa-check-circle" style="color:#22C55E;font-size:28px;display:block;margin-bottom:8px;"></i>
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
  `
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
