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
    <div class="auth-page">

      <!-- Left panel -->
      <div class="auth-panel">
        <div class="panel-glow"></div>
        <div class="panel-content">
          <div class="panel-logo">
            <i class="fas fa-fire"></i>
          </div>
          <h2 class="panel-title">Comanda Digital</h2>
          <p class="panel-desc">Sistema completo de gestão para restaurantes e dark kitchens</p>

          <div class="panel-features">
            <div class="feature-item">
              <i class="fas fa-chart-pie"></i>
              <span>Dashboard em tempo real</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-clipboard-list"></i>
              <span>Gestão de pedidos e kanban</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-boxes"></i>
              <span>Controle de estoque</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-chart-bar"></i>
              <span>Relatórios financeiros</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel / form -->
      <div class="auth-form-side">
        <div class="auth-form-card">

          <div class="form-header">
            <h1>Bem-vindo de volta</h1>
            <p>Entre na sua conta para continuar</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="on">
            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input
                  id="email"
                  type="email"
                  class="form-control input-with-icon"
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
                <i class="fas fa-lock input-icon"></i>
                <input
                  id="senha"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control input-with-icon input-with-action"
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

            <button type="submit" class="btn btn-primary btn-block submit-btn" [disabled]="loading">
              <div class="spinner" *ngIf="loading" style="width:16px;height:16px;border-width:2px;"></div>
              <i class="fas fa-arrow-right" *ngIf="!loading"></i>
              {{ loading ? 'Entrando...' : 'Entrar na conta' }}
            </button>
          </form>

          <p class="form-footer">
            Não tem conta?
            <a routerLink="/registrar">Criar conta grátis</a>
          </p>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
      background: #080808;
    }

    /* ---- Left panel ---- */
    .auth-panel {
      width: 44%;
      background: #0C0C0C;
      border-right: 1px solid #161616;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .panel-glow {
      position: absolute;
      top: -80px; left: -80px;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .panel-content {
      position: relative;
      z-index: 1;
      max-width: 340px;
      width: 100%;
    }
    .panel-logo {
      width: 52px; height: 52px;
      border-radius: 14px;
      background: rgba(220,38,38,0.12);
      border: 1px solid rgba(220,38,38,0.22);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
    }
    .panel-logo i { color: #DC2626; font-size: 22px; }
    .panel-title {
      font-size: 26px;
      font-weight: 800;
      color: #F3F4F6;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .panel-desc {
      font-size: 14px;
      color: #6B7280;
      line-height: 1.6;
      margin-bottom: 36px;
    }
    .panel-features { display: flex; flex-direction: column; gap: 14px; }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #6B7280;
      font-size: 13.5px;
    }
    .feature-item i {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid #1E1E1E;
      display: flex; align-items: center; justify-content: center;
      color: #DC2626; font-size: 12px; flex-shrink: 0;
    }

    /* ---- Right side / form ---- */
    .auth-form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }
    .auth-form-card {
      width: 100%;
      max-width: 400px;
    }

    .form-header { margin-bottom: 32px; }
    .form-header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #F3F4F6;
      margin-bottom: 6px;
    }
    .form-header p { font-size: 14px; color: #6B7280; }

    /* Input with icon */
    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #4B5563;
      font-size: 13px;
      pointer-events: none;
    }
    .input-with-icon { padding-left: 40px !important; }
    .input-with-action { padding-right: 44px !important; }
    .input-action-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #4B5563;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.18s;
      font-size: 13px;
    }
    .input-action-btn:hover { color: #9CA3AF; }

    .submit-btn {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 14px;
      margin-top: 8px;
      border-radius: 9px;
      gap: 8px;
    }

    .form-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 13.5px;
      color: #6B7280;
    }
    .form-footer a {
      color: #DC2626;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }
    .form-footer a:hover { text-decoration: underline; }

    /* ---- Mobile ---- */
    @media (max-width: 768px) {
      .auth-page { flex-direction: column; }
      .auth-panel { width: 100%; padding: 32px 24px; min-height: auto; }
      .panel-features { display: none; }
      .panel-desc { display: none; }
      .auth-form-side { padding: 32px 20px; }
    }
  `]
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
