import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Categoria } from '../../shared/models/models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-tags"></i> Categorias</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Nova Categoria</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Descricao</th><th>Status</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let cat of categorias">
              <td>{{cat.id}}</td>
              <td><strong>{{cat.nome}}</strong></td>
              <td>{{cat.descricao || '-'}}</td>
              <td><span class="badge badge-success">{{cat.status}}</span></td>
              <td>
                <button class="btn btn-warning btn-sm" (click)="editar(cat)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" (click)="excluir(cat.id)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="categorias.length === 0"><td colspan="5" style="text-align:center;color:var(--gray-500);">Nenhuma categoria encontrada</td></tr>
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
          <h3>{{editando ? 'Editar' : 'Nova'}} Categoria</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" class="form-control" formControlName="nome">
            <span class="error-msg" *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched">Nome obrigatorio</span>
          </div>
          <div class="form-group">
            <label>Descricao</label>
            <input type="text" class="form-control" formControlName="descricao">
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
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({ nome: ['', Validators.required], descricao: [''] });
  }

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getCategorias(page).subscribe({
      next: (p) => { this.categorias = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: (err) => { console.error('Erro ao carregar categorias:', err); this.toast.error('Erro ao carregar categorias'); this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }

  editar(cat: Categoria): void {
    this.editando = true; this.editId = cat.id;
    this.form.patchValue({ nome: cat.nome, descricao: cat.descricao });
    this.showModal = true;
  }

  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const obs = this.editando
      ? this.api.updateCategoria(this.editId, this.form.value)
      : this.api.createCategoria(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Categoria salva!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: (err) => { console.error('Erro ao salvar categoria:', err); this.toast.error('Erro ao salvar categoria'); }
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar esta categoria?')) return;
    this.api.deleteCategoria(id).subscribe({
      next: () => { this.toast.success('Categoria desativada!'); this.carregar(this.currentPage); }
    });
  }
}
