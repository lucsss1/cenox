import { Injectable, OnDestroy } from '@angular/core';
import { interval, Subscription, BehaviorSubject } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Pedido } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderRealtimeService implements OnDestroy {
  private _pedidos$ = new BehaviorSubject<Pedido[]>([]);
  private _newOrderIds$ = new BehaviorSubject<Set<number>>(new Set());
  private sub: Subscription | null = null;
  private knownIds = new Set<number>();
  private initialized = false;

  readonly pedidos$ = this._pedidos$.asObservable();
  readonly newOrderIds$ = this._newOrderIds$.asObservable();

  constructor(private api: ApiService) {}

  start(intervalMs = 30000): void {
    if (this.sub) return;
    this.load();
    this.sub = interval(intervalMs).pipe(
      switchMap(() => this.api.getPedidosAtivos())
    ).subscribe(pedidos => this.process(pedidos));
  }

  stop(): void {
    this.sub?.unsubscribe();
    this.sub = null;
    this.initialized = false;
    this.knownIds.clear();
    this._newOrderIds$.next(new Set());
  }

  refresh(): void {
    this.load();
  }

  clearNew(id: number): void {
    const s = new Set(this._newOrderIds$.value);
    s.delete(id);
    this._newOrderIds$.next(s);
  }

  private load(): void {
    this.api.getPedidosAtivos().subscribe(pedidos => this.process(pedidos));
  }

  private process(pedidos: Pedido[]): void {
    this._pedidos$.next(pedidos);

    if (!this.initialized) {
      pedidos.forEach(p => this.knownIds.add(p.id));
      this.initialized = true;
      return;
    }

    const newIds = new Set<number>();
    pedidos.forEach(p => {
      if (!this.knownIds.has(p.id)) {
        newIds.add(p.id);
        this.knownIds.add(p.id);
        this.notifyNewOrder(p);
      }
    });

    if (newIds.size > 0) {
      const current = new Set([...this._newOrderIds$.value, ...newIds]);
      this._newOrderIds$.next(current);
    }

    // Remove IDs that are no longer active (delivered/cancelled)
    const activeIds = new Set(pedidos.map(p => p.id));
    this.knownIds.forEach(id => {
      if (!activeIds.has(id)) this.knownIds.delete(id);
    });
  }

  private notifyNewOrder(pedido: Pedido): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Novo Pedido!', {
        body: `Pedido #${pedido.id} — ${pedido.clienteNome} — R$ ${pedido.total.toFixed(2)}`,
        icon: '/favicon.ico'
      });
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
