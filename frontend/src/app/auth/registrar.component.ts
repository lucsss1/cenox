import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Criar Conta</h2>
        <p class="auth-sub">Cadastre-se para fazer pedidos</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" class="form-control" formControlName="nome" placeholder="Seu nome completo">
            <span class="error-msg" *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched">Nome obrigatorio</span>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="seu@email.com">
            <span class="error-msg" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Email invalido</span>
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input type="password" class="form-control" formControlName="senha" placeholder="Minimo 6 caracteres">
            <span class="error-msg" *ngIf="form.get('senha')?.invalid && form.get('senha')?.touched">Minimo 6 caracteres</span>
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </form>
        <p class="auth-footer">Ja tem conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
    .auth-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); width: 100%; max-width: 400px; }
    .auth-card h2 { text-align: center; margin-bottom: 4px; }
    .auth-sub { text-align: center; color: var(--gray-500); margin-bottom: 24px; font-size: 14px; }
    .btn-block { width: 100%; justify-content: center; padding: 10px; font-size: 15px; }
    .auth-footer { text-align: center; margin-top: 16px; font-size: 14px; color: var(--gray-500); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 500; }
  `]
})
export class RegistrarComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      perfil: ['CLIENTE']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.registrar(this.form.value).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso! Faca login.');
        this.router.navigate(['/login']);
      },
      error: () => { this.loading = false; }
    });
  }
}
