import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Prato, Categoria } from '../../shared/models/models';

@Component({
  selector: 'app-pratos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-hamburger"></i> Pratos</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Prato</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Preco</th><th>Custo</th><th>Food Cost</th><th>Ficha Tec.</th><th>Status</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of pratos">
              <td>{{p.id}}</td>
              <td><strong>{{p.nome}}</strong></td>
              <td>{{p.categoriaNome}}</td>
              <td>R$ {{p.precoVenda | number:'1.2-2'}}</td>
              <td>{{p.custoProducao ? 'R$ ' + (p.custoProducao | number:'1.2-2') : '-'}}</td>
              <td>
                <span *ngIf="p.foodCost" [class]="p.foodCostAlto ? 'badge badge-danger' : 'badge badge-success'">
                  {{p.foodCost | number:'1.1-1'}}%
                </span>
                <span *ngIf="!p.foodCost">-</span>
              </td>
              <td>
                <span [class]="p.temFichaTecnica ? 'badge badge-success' : 'badge badge-danger'">
                  {{p.temFichaTecnica ? 'Sim' : 'Nao'}}
                </span>
              </td>
              <td><span [class]="p.status === 'ATIVO' ? 'badge badge-success' : 'badge badge-secondary'">{{p.status}}</span></td>
              <td style="white-space:nowrap;">
                <button class="btn btn-warning btn-sm" (click)="editar(p)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-success btn-sm" *ngIf="p.status === 'INATIVO' && p.temFichaTecnica" (click)="ativar(p.id)" title="Ativar"><i class="fas fa-check"></i></button>
                <button class="btn btn-danger btn-sm" *ngIf="p.status === 'ATIVO'" (click)="desativar(p.id)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="pratos.length === 0"><td colspan="9" style="text-align:center;color:var(--gray-500);">Nenhum prato encontrado</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="carregar(currentPage - 1)" [disabled]="currentPage === 0">Anterior</button>
        <button *ngFor="let pg of pages" (click)="carregar(pg)" [class.active]="pg === currentPage">{{pg + 1}}</button>
        <button (click)="carregar(currentPage + 1)" [disabled]="currentPage === totalPages - 1">Proximo</button>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{editando ? 'Editar' : 'Novo'}} Prato</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" class="form-control" formControlName="nome">
          </div>
          <div class="form-group">
            <label>Descricao</label>
            <textarea class="form-control" formControlName="descricao" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Preco de Venda (R$)</label>
            <input type="number" class="form-control" formControlName="precoVenda" step="0.01">
          </div>
          <div class="form-group">
            <label>Tempo Preparo (min)</label>
            <input type="number" class="form-control" formControlName="tempoPreparo">
          </div>
          <div class="form-group">
            <label>Categoria</label>
            <select class="form-control" formControlName="categoriaId">
              <option value="">Selecione...</option>
              <option *ngFor="let c of categorias" [value]="c.id">{{c.nome}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>URL da Imagem</label>
            <input type="text" class="form-control" formControlName="imagemUrl">
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
export class PratosComponent implements OnInit {
  pratos: Prato[] = [];
  categorias: Categoria[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], descricao: [''], precoVenda: [0, [Validators.required, Validators.min(0.01)]],
      tempoPreparo: [null], categoriaId: ['', Validators.required], imagemUrl: ['']
    });
  }

  ngOnInit(): void {
    this.api.getCategoriasPublico().subscribe(c => this.categorias = c);
    this.carregar(0);
  }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getPratos(page).subscribe({
      next: (p) => { this.pratos = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }

  editar(p: Prato): void {
    this.editando = true; this.editId = p.id;
    this.form.patchValue({ nome: p.nome, descricao: p.descricao, precoVenda: p.precoVenda, tempoPreparo: p.tempoPreparo, categoriaId: p.categoriaId, imagemUrl: p.imagemUrl });
    this.showModal = true;
  }

  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const val = { ...this.form.value, categoriaId: +this.form.value.categoriaId };
    const obs = this.editando ? this.api.updatePrato(this.editId, val) : this.api.createPrato(val);
    obs.subscribe({
      next: () => { this.toast.success('Prato salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  ativar(id: number): void {
    this.api.ativarPrato(id).subscribe({
      next: () => { this.toast.success('Prato ativado!'); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  desativar(id: number): void {
    if (!confirm('Desativar este prato?')) return;
    this.api.deletePrato(id).subscribe({
      next: () => { this.toast.success('Prato desativado!'); this.carregar(this.currentPage); }
    });
  }
}
