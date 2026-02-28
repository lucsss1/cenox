import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Insumo } from '../../shared/models/models';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-boxes"></i> Insumos / Estoque</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Insumo</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Unidade</th><th>Estoque</th><th>Min.</th><th>Custo Medio</th><th>Status Est.</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let i of insumos">
              <td>{{i.id}}</td>
              <td><strong>{{i.nome}}</strong></td>
              <td>{{i.unidadeMedida}}</td>
              <td>{{i.quantidadeEstoque | number:'1.0-3'}}</td>
              <td>{{i.estoqueMinimo | number:'1.0-3'}}</td>
              <td>{{i.custoMedio ? 'R$ ' + (i.custoMedio | number:'1.2-2') : '-'}}</td>
              <td>
                <span [class]="i.abaixoEstoqueMinimo ? 'badge badge-danger' : 'badge badge-success'">
                  {{i.abaixoEstoqueMinimo ? 'BAIXO' : 'OK'}}
                </span>
              </td>
              <td>
                <button class="btn btn-warning btn-sm" (click)="editar(i)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" (click)="excluir(i.id)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="insumos.length === 0"><td colspan="8" style="text-align:center;color:var(--gray-500);">Nenhum insumo encontrado</td></tr>
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
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Insumo</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" class="form-control" formControlName="nome">
          </div>
          <div class="form-group">
            <label>Unidade de Medida</label>
            <select class="form-control" formControlName="unidadeMedida">
              <option value="">Selecione...</option>
              <option value="KG">KG</option><option value="G">G</option>
              <option value="L">L</option><option value="ML">ML</option><option value="UN">UN</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estoque Minimo</label>
            <input type="number" class="form-control" formControlName="estoqueMinimo" step="0.001">
          </div>
          <div class="form-group">
            <label>Custo Medio (R$)</label>
            <input type="number" class="form-control" formControlName="custoMedio" step="0.01">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InsumosComponent implements OnInit {
  insumos: Insumo[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], unidadeMedida: ['', Validators.required],
      estoqueMinimo: [0, [Validators.required, Validators.min(0)]], custoMedio: [null]
    });
  }

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getInsumos(page).subscribe({
      next: (p) => { this.insumos = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }
  editar(i: Insumo): void {
    this.editando = true; this.editId = i.id;
    this.form.patchValue({ nome: i.nome, unidadeMedida: i.unidadeMedida, estoqueMinimo: i.estoqueMinimo, custoMedio: i.custoMedio });
    this.showModal = true;
  }
  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const obs = this.editando ? this.api.updateInsumo(this.editId, this.form.value) : this.api.createInsumo(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Insumo salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar este insumo?')) return;
    this.api.deleteInsumo(id).subscribe({ next: () => { this.toast.success('Insumo desativado!'); this.carregar(this.currentPage); } });
  }
}
