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
  styleUrls: ['./login.component.css'],
  template: `
    <div class="login-page">

      <!-- Ambient background floaters (purely decorative) -->
      <span class="bg-float bf-1" aria-hidden="true">🍕</span>
      <span class="bg-float bf-2" aria-hidden="true">🍜</span>
      <span class="bg-float bf-3" aria-hidden="true">☕</span>
      <span class="bg-float bf-4" aria-hidden="true">🍔</span>
      <span class="bg-float bf-5" aria-hidden="true">🥗</span>

      <div class="login-card">

        <!-- Painel esquerdo: formulário -->
        <div class="form-panel">

          <p class="brand-name">Cenox</p>
          <p class="brand-tagline">Gestão para restaurantes e dark kitchens</p>
          <div class="brand-divider" aria-hidden="true"></div>

          <h1 class="form-heading">Bem-vindo de volta</h1>
          <p class="form-subheading">Entre na sua conta para continuar</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="on">

            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-envelope"></i>
                </span>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  formControlName="email"
                  placeholder="seu@email.com"
                  autocomplete="email">
              </div>
              <span class="error-msg" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
                <i class="fas fa-exclamation-circle"></i> Email inválido
              </span>
            </div>

            <div class="form-group">
              <label for="senha">Senha</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-lock"></i>
                </span>
                <input
                  id="senha"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control input-with-action"
                  formControlName="senha"
                  placeholder="Sua senha"
                  autocomplete="current-password">
                <button type="button" class="input-action-btn" (click)="showPassword = !showPassword" tabindex="-1">
                  <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span class="error-msg" *ngIf="form.get('senha')?.invalid && form.get('senha')?.touched">
                <i class="fas fa-exclamation-circle"></i> Senha obrigatória
              </span>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading">
              <span class="spinner" *ngIf="loading"></span>
              <i class="fas fa-arrow-right" *ngIf="!loading"></i>
              {{ loading ? 'Entrando...' : 'Entrar na conta' }}
            </button>

          </form>

          <p class="form-footer">
            Não tem conta?
            <a routerLink="/registrar">Criar conta grátis</a>
          </p>

        </div>

        <!-- Painel direito: hero decorativo -->
        <div class="hero-panel">
          <div class="blob blob-large"></div>
          <div class="blob blob-medium"></div>
          <div class="blob blob-accent"></div>

          <!-- Food floaters in hero -->
          <span class="hero-float hf-1" aria-hidden="true">🍕</span>
          <span class="hero-float hf-2" aria-hidden="true">🍔</span>
          <span class="hero-float hf-3" aria-hidden="true">🥗</span>
          <span class="hero-float hf-4" aria-hidden="true">🍰</span>

          <div class="hero-icon-wrap">
            <div class="icon-glow" aria-hidden="true"></div>
            <div class="icon-ring" aria-hidden="true"></div>
            <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <!-- Garfo -->
              <rect x="28" y="14" width="4" height="20" rx="2" fill="white" opacity="0.9"/>
              <rect x="34" y="14" width="4" height="20" rx="2" fill="white" opacity="0.9"/>
              <rect x="40" y="14" width="4" height="20" rx="2" fill="white" opacity="0.9"/>
              <path d="M28 34 Q36 42 36 50 L36 80 Q36 82 34 82 L30 82 Q28 82 28 80 Z" fill="white" opacity="0.9"/>
              <!-- Faca -->
              <path d="M60 14 L64 14 L68 30 Q68 36 64 38 L64 80 Q64 82 62 82 L60 82 Q58 82 58 80 L58 14 Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
        </div>

      </div>

    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.toast.success('Bem-vindo de volta!');
        if (['ADMIN', 'GERENTE', 'COZINHEIRO'].includes(res.usuario.perfil)) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cardapio']);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Email ou senha inválidos');
      }
    });
  }
}
