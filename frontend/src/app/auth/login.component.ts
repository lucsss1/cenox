import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-icon"><i class="fas fa-fire"></i></div>
        <h2>Entrar</h2>
        <p class="auth-sub">Acesse sua conta na Comanda Digital</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="seu@email.com">
            <span class="error-msg" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Email invalido</span>
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input type="password" class="form-control" formControlName="senha" placeholder="Sua senha">
            <span class="error-msg" *ngIf="form.get('senha')?.invalid && form.get('senha')?.touched">Senha obrigatoria</span>
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <p class="auth-footer">Nao tem conta? <a routerLink="/registrar">Cadastre-se</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
    .auth-card {
      background: #1A1A1A; padding: 36px; border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4); width: 100%; max-width: 420px;
      border: 1px solid #2A2A2A;
    }
    .auth-icon { text-align: center; margin-bottom: 8px; }
    .auth-icon i { font-size: 36px; color: #DC2626; }
    .auth-card h2 { text-align: center; margin-bottom: 4px; color: #F9FAFB; font-size: 24px; }
    .auth-sub { text-align: center; color: #6B7280; margin-bottom: 28px; font-size: 14px; }
    .btn-block { width: 100%; justify-content: center; padding: 12px; font-size: 15px; margin-top: 4px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #6B7280; }
    .auth-footer a { color: #DC2626; text-decoration: none; font-weight: 600; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.toast.success('Login realizado com sucesso!');
        if (['ADMIN', 'GERENTE', 'COZINHEIRO'].includes(res.usuario.perfil)) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cardapio']);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Email ou senha invalidos');
      }
    });
  }
}
