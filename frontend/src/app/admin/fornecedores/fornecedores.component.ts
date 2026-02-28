import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Fornecedor } from '../../shared/models/models';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-truck"></i> Fornecedores</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Fornecedor</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Razao Social</th><th>CNPJ</th><th>Email</th><th>Telefone</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let f of fornecedores">
              <td>{{f.id}}</td>
              <td><strong>{{f.razaoSocial}}</strong></td>
              <td>{{f.cnpj}}</td>
              <td>{{f.email || '-'}}</td>
              <td>{{f.telefone || '-'}}</td>
              <td>
                <button class="btn btn-warning btn-sm" (click)="editar(f)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" (click)="excluir(f.id)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr *ngIf="fornecedores.length === 0"><td colspan="6" style="text-align:center;color:var(--gray-500);">Nenhum fornecedor</td></tr>
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
          <h3>{{editando ? 'Editar' : 'Novo'}} Fornecedor</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group"><label>Razao Social</label><input type="text" class="form-control" formControlName="razaoSocial"></div>
          <div class="form-group"><label>CNPJ</label><input type="text" class="form-control" formControlName="cnpj" placeholder="00.000.000/0000-00"></div>
          <div class="form-group"><label>Email</label><input type="email" class="form-control" formControlName="email"></div>
          <div class="form-group"><label>Telefone</label><input type="text" class="form-control" formControlName="telefone"></div>
          <div class="form-group"><label>Endereco</label><input type="text" class="form-control" formControlName="endereco"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FornecedoresComponent implements OnInit {
  fornecedores: Fornecedor[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false; editando = false; editId = 0;
  form: FormGroup;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      razaoSocial: ['', Validators.required], cnpj: ['', Validators.required],
      email: [''], telefone: [''], endereco: ['']
    });
  }

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getFornecedores(page).subscribe({
      next: (p) => { this.fornecedores = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.editando = false; this.form.reset(); this.showModal = true; }
  editar(f: Fornecedor): void {
    this.editando = true; this.editId = f.id;
    this.form.patchValue(f); this.showModal = true;
  }
  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    const obs = this.editando ? this.api.updateFornecedor(this.editId, this.form.value) : this.api.createFornecedor(this.form.value);
    obs.subscribe({
      next: () => { this.toast.success('Fornecedor salvo!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar este fornecedor?')) return;
    this.api.deleteFornecedor(id).subscribe({ next: () => { this.toast.success('Fornecedor desativado!'); this.carregar(this.currentPage); } });
  }
}
