import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-entrada-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-arrow-up"></i> Entrada de Estoque</h2>
        <p class="page-subtitle">Registre rapidamente a entrada de mercadorias</p>
      </div>
    </div>

    <div class="card" style="max-width:600px;">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <form *ngIf="!loading" (ngSubmit)="registrar()">
        <div class="form-group">
          <label>Produto *</label>
          <select class="form-control" [(ngModel)]="insumoId" name="insumoId" required>
            <option [ngValue]="0">Selecione o produto...</option>
            <option *ngFor="let i of insumos" [ngValue]="i.id">
              {{i.nome}} ({{i.unidadeMedida}}) — Estoque: {{i.quantidadeEstoque | number:'1.0-3'}}
            </option>
          </select>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label>Quantidade *</label>
            <input type="number" class="form-control" [(ngModel)]="quantidade" name="quantidade"
              step="0.001" min="0.001" required placeholder="0.000">
          </div>
          <div class="form-group">
            <label>Unidade</label>
            <input type="text" class="form-control" [value]="unidadeSelecionada" disabled>
          </div>
        </div>

        <div class="form-group">
          <label>Observacao</label>
          <input type="text" class="form-control" [(ngModel)]="observacao" name="observacao"
            placeholder="Ex: NF 12345, Fornecedor X..." maxlength="255">
        </div>

        <div *ngIf="insumoSelecionado" style="background:var(--primary-subtle);border:1px solid var(--primary-muted);border-radius:8px;padding:12px;margin-bottom:16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:13px;">
            <div>
              <span style="color:#6B7280;">Estoque atual</span><br>
              <strong style="color:var(--text-primary);">{{insumoSelecionado.quantidadeEstoque | number:'1.0-3'}} {{insumoSelecionado.unidadeMedida}}</strong>
            </div>
            <div>
              <span style="color:#6B7280;">Estoque minimo</span><br>
              <strong style="color:var(--text-primary);">{{insumoSelecionado.estoqueMinimo | number:'1.0-3'}} {{insumoSelecionado.unidadeMedida}}</strong>
            </div>
            <div>
              <span style="color:#6B7280;">Apos entrada</span><br>
              <strong style="color:#10B981;">{{(insumoSelecionado.quantidadeEstoque + quantidade) | number:'1.0-3'}} {{insumoSelecionado.unidadeMedida}}</strong>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" (click)="limpar()">Limpar</button>
          <button type="submit" class="btn btn-primary" [disabled]="salvando || !insumoId || quantidade <= 0">
            <i class="fas fa-check"></i> {{salvando ? 'Registrando...' : 'Registrar Entrada'}}
          </button>
        </div>
      </form>
    </div>

    <!-- Ultimas entradas -->
    <div class="card" style="margin-top:20px;" *ngIf="ultimasEntradas.length > 0">
      <h3 style="margin-bottom:12px;color:var(--text-primary);"><i class="fas fa-history" style="color:var(--primary);margin-right:8px;"></i>Entradas registradas nesta sessao</h3>
      <table>
        <thead><tr><th>Produto</th><th>Quantidade</th><th>Observacao</th></tr></thead>
        <tbody>
          <tr *ngFor="let e of ultimasEntradas">
            <td><strong style="color:var(--text-primary);">{{e.nome}}</strong></td>
            <td>{{e.quantidade | number:'1.0-3'}} {{e.unidade}}</td>
            <td>{{e.observacao || '&mdash;'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class EntradaEstoqueComponent implements OnInit {
  insumos: Insumo[] = [];
  loading = true;
  salvando = false;

  insumoId = 0;
  quantidade = 0;
  observacao = '';

  ultimasEntradas: { nome: string; quantidade: number; unidade: string; observacao: string }[] = [];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.api.getInsumosTodos().subscribe({
      next: (data) => { this.insumos = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get insumoSelecionado(): Insumo | null {
    return this.insumos.find(i => i.id === this.insumoId) || null;
  }

  get unidadeSelecionada(): string {
    return this.insumoSelecionado?.unidadeMedida || '—';
  }

  registrar(): void {
    if (!this.insumoId || this.quantidade <= 0) return;
    this.salvando = true;
    const insumo = this.insumoSelecionado!;
    this.api.entradaEstoque(this.insumoId, { quantidade: this.quantidade, observacao: this.observacao }).subscribe({
      next: () => {
        this.ultimasEntradas.unshift({
          nome: insumo.nome,
          quantidade: this.quantidade,
          unidade: insumo.unidadeMedida,
          observacao: this.observacao
        });
        this.toast.success(`Entrada de ${this.quantidade} ${insumo.unidadeMedida} de ${insumo.nome} registrada!`);
        insumo.quantidadeEstoque += this.quantidade;
        this.limpar();
        this.salvando = false;
      },
      error: () => { this.salvando = false; }
    });
  }

  limpar(): void {
    this.insumoId = 0;
    this.quantidade = 0;
    this.observacao = '';
  }
}
