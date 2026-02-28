import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { Usuario } from '../../shared/models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h2><i class="fas fa-users"></i> Usuarios</h2>
      <button class="btn btn-primary" (click)="abrirModal()"><i class="fas fa-plus"></i> Novo Usuario</button>
    </div>

    <div class="card">
      <div class="loading" *ngIf="loading"><div class="spinner"></div></div>
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Acoes</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of usuarios">
              <td>{{u.id}}</td>
              <td><strong>{{u.nome}}</strong></td>
              <td>{{u.email}}</td>
              <td><span class="badge badge-info">{{u.perfil}}</span></td>
              <td><span class="badge badge-success">{{u.status}}</span></td>
              <td>
                <button class="btn btn-danger btn-sm" (click)="excluir(u.id)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
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
          <h3>Novo Usuario</h3>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group"><label>Nome</label><input type="text" class="form-control" formControlName="nome"></div>
          <div class="form-group"><label>Email</label><input type="email" class="form-control" formControlName="email"></div>
          <div class="form-group"><label>Senha</label><input type="password" class="form-control" formControlName="senha"></div>
          <div class="form-group">
            <label>Perfil</label>
            <select class="form-control" formControlName="perfil">
              <option value="ADMIN">ADMIN</option>
              <option value="GERENTE">GERENTE</option>
              <option value="COZINHEIRO">COZINHEIRO</option>
              <option value="CLIENTE">CLIENTE</option>
            </select>
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
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  currentPage = 0; totalPages = 0; pages: number[] = [];
  showModal = false;
  form: FormGroup;

  constructor(private api: ApiService, private toast: ToastService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]], perfil: ['CLIENTE', Validators.required]
    });
  }

  ngOnInit(): void { this.carregar(0); }

  carregar(page: number): void {
    this.currentPage = page; this.loading = true;
    this.api.getUsuarios(page).subscribe({
      next: (p) => { this.usuarios = p.content; this.totalPages = p.totalPages; this.pages = Array.from({length: p.totalPages}, (_, i) => i); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void { this.form.reset({ perfil: 'CLIENTE' }); this.showModal = true; }
  fecharModal(): void { this.showModal = false; }

  salvar(): void {
    if (this.form.invalid) return;
    this.api.createUsuario(this.form.value).subscribe({
      next: () => { this.toast.success('Usuario criado!'); this.fecharModal(); this.carregar(this.currentPage); },
      error: () => {}
    });
  }

  excluir(id: number): void {
    if (!confirm('Desativar este usuario?')) return;
    this.api.deleteUsuario(id).subscribe({ next: () => { this.toast.success('Usuario desativado!'); this.carregar(this.currentPage); } });
  }
}
