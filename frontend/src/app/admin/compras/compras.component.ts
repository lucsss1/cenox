import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Compra, Fornecedor, Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-shopping-bag"></i> Compras</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Registrar Compra</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Fornecedor</th><th>Data</th><th>NF</th><th>Itens</th><th>Total</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of compras">
              <td>{{c.id}}</td>
              <td><strong>{{c.fornecedorNome}}</strong></td>
              <td>{{c.dataCompra | date:'dd/MM/yyyy'}}</td>
              <td>{{c.notaFiscal || '-'}}</td>
              <td>{{c.itens.length}} itens</td>
              <td><strong>R$ {{c.valorTotal | number:'1.2-2'}}</strong></td>
            </tr>
            <tr *ngIf="compras.length === 0"><td colspan="6" style="text-align:center;color:var(--gray-500);">Nenhuma compra registrada</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let p of pages" (click)="carregar(p)" [class.active]="p === currentPage">{{p + 1}}</button>
        <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width:700px;">
        <div class="modal-header">
          <h3>Registrar Compra</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div style="display:flex;gap:12px;">
            <div class="form-group" style="flex:2;">
              <label>Fornecedor</label>
              <select class="form-control" formControlName="fornecedorId">
                <option value="">Selecione...</option>
                <option *ngFor="let f of fornecedores" [value]="f.id">{{f.razaoSocial}}</option>
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label>Data</label>
              <input type="date" class="form-control" formControlName="dataCompra">
            </div>
            <div class="form-group" style="flex:1;">
              <label>Nota Fiscal</label>
              <input type="text" class="form-control" formControlName="notaFiscal">
            </div>
          </div>

          <h4 style="margin:12px 0 8px;">Itens da Compra</h4>
          <div formArrayName="itens">
            <div *ngFor="let item of itensArray.controls; let i=index" [formGroupName]="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:end;">
              <div class="form-group" style="flex:2;margin:0;">
                <label *ngIf="i===0">Insumo</label>
                <select class="form-control" formControlName="insumoId">
                  <option value="">Sel...</option>
                  <option *ngFor="let ins of insumos" [value]="ins.id">{{ins.nome}} ({{ins.unidadeMedida}})</option>
                </select>
              </div>
              <div class="form-group" style="flex:1;margin:0;">
                <label *ngIf="i===0">Quantidade</label>
                <input type="number" class="form-control" formControlName="quantidade" step="0.001">
              </div>
              <div class="form-group" style="flex:1;margin:0;">
                <label *ngIf="i===0">Preco Unit.</label>
                <input type="number" class="form-control" formControlName="precoUnitario" step="0.01">
              </div>
              <button type="button" class="btn btn-danger btn-sm" (click)="removerItem(i)"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" (click)="adicionarItem()"><i class="fas fa-plus"></i> Item</button>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || itensArray.length === 0">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ComprasComponent implements OnInit {
  compras: Compra[] = [];
  fornecedores: Fornecedor[] = [];
  insumos: Insumo[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false;
  form: FormGroup;

  get itensArray(): FormArray { return this.form.get('itens') as FormArray; }

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      fornecedorId: ['', Validators.required],
      dataCompra: ['', Validators.required],
      notaFiscal: [''],
      itens: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.api.getFornecedoresTodos().subscribe(f => this.fornecedores = f);
    this.api.getInsumos(0).subscribe(p => this.insumos = p.content);
    this.carregar(0);
  }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getCompras(page).subscribe({
      next: (p) => { this.compras = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void {
    this.form.reset(); this.itensArray.clear(); this.adicionarItem(); this.showModal = true;
  }
  fecharModal(): void { this.showModal = false; }

  adicionarItem(): void {
    this.itensArray.push(this.fb.group({
      insumoId: ['', Validators.required],
      quantidade: [0, [Validators.required, Validators.min(0.001)]],
      precoUnitario: [0, [Validators.required, Validators.min(0.01)]]
    }));
  }
  removerItem(i: number): void { this.itensArray.removeAt(i); }

  salvar(): void {
    if (this.form.invalid) return;
    const val = {
      ...this.form.value,
      fornecedorId: +this.form.value.fornecedorId,
      itens: this.form.value.itens.map((i: any) => ({ ...i, insumoId: +i.insumoId }))
    };
    this.api.createCompra(val).subscribe({
      next: () => {
        this.toast.success('Compra registrada! Estoque e custos atualizados.');
        this.fecharModal(); this.carregar(this.currentPage);
      },
      error: () => {}
    });
  }
}
