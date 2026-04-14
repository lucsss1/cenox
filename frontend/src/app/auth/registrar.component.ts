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
    <div class="register-page">
      <div class="register-card">

        <!-- ── Painel esquerdo: formulário ── -->
        <div class="form-panel">

          <p class="brand-name">Cenox</p>
          <p class="brand-tagline">Gestão para restaurantes e dark kitchens</p>

          <h1 class="form-heading">Criar conta</h1>
          <p class="form-subheading">Cadastre-se e comece a fazer pedidos agora</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="on">

            <div class="form-group">
              <label for="nome">Nome completo</label>
              <div class="input-wrapper">
                <span class="input-icon"><i class="fas fa-user"></i></span>
                <input
                  id="nome"
                  type="text"
                  class="form-control"
                  formControlName="nome"
                  placeholder="Seu nome completo"
                  autocomplete="name">
              </div>
              <span class="error-msg" *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched">
                <i class="fas fa-exclamation-circle"></i> Nome obrigatório
              </span>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <span class="input-icon"><i class="fas fa-envelope"></i></span>
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
                <span class="input-icon"><i class="fas fa-lock"></i></span>
                <input
                  id="senha"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control input-with-action"
                  formControlName="senha"
                  placeholder="Mínimo 6 caracteres"
                  autocomplete="new-password">
                <button type="button" class="input-action-btn"
                        (click)="showPassword = !showPassword" tabindex="-1">
                  <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span class="error-msg" *ngIf="form.get('senha')?.invalid && form.get('senha')?.touched">
                <i class="fas fa-exclamation-circle"></i> Mínimo 6 caracteres
              </span>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading">
              <span class="spinner" *ngIf="loading"></span>
              <i class="fas fa-arrow-right" *ngIf="!loading"></i>
              {{ loading ? 'Cadastrando...' : 'Criar conta grátis' }}
            </button>

          </form>

          <p class="form-footer">
            Já tem conta?
            <a routerLink="/login">Entrar</a>
          </p>

        </div>

        <!-- ── Painel direito: cardápio decorativo ── -->
        <div class="hero-panel">
          <div class="blob blob-large"></div>
          <div class="blob blob-medium"></div>
          <div class="blob blob-accent"></div>

          <div class="hero-content">
            <p class="hero-eyebrow">O que te espera</p>

            <div class="food-pills">
              <div class="pills-row">
                <span class="food-pill fp-1">🍕 Pizza</span>
                <span class="food-pill fp-2">🍔 Burgers</span>
              </div>
              <div class="pills-row">
                <span class="food-pill fp-3">🥗 Saladas</span>
                <span class="food-pill fp-4">🍝 Massas</span>
              </div>
              <div class="pills-row">
                <span class="food-pill fp-5">🍰 Sobremesas</span>
                <span class="food-pill fp-6">☕ Café</span>
              </div>
            </div>

            <p class="hero-cta">Peça quando quiser, onde quiser.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

    :host {
      --brand:          #D4531A;
      --brand-hover:    #B84412;
      --brand-shadow:   rgba(212, 83, 26, 0.30);
      --brand-focus:    rgba(212, 83, 26, 0.12);
      --page-bg:        #EDE8E0;
      --card-bg:        #FFFFFF;
      --input-bg:       #F5F0EB;
      --text-heading:   #1A1A1A;
      --text-body:      #4A4A4A;
      --text-muted:     #9A9A9A;
      --border-input:   #E0D8D0;
      font-family: 'Poppins', sans-serif;
      display: block;
      min-height: 100vh;
    }

    /* ── Animations ──────────────────────────── */
    @keyframes cardIn {
      from { transform: translateY(24px) scale(0.97); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
    @keyframes heroIn {
      from { transform: translateX(30px) scale(0.95); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
    @keyframes pillFloat {
      0%, 100% { transform: translateY(0)    rotate(var(--r, -2deg)); }
      50%       { transform: translateY(-9px) rotate(var(--r, -2deg)); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Page wrapper ────────────────────────── */
    .register-page {
      width: 100vw;
      height: 100vh;
      background: var(--page-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      overflow: hidden;
    }

    /* ── Card ────────────────────────────────── */
    .register-card {
      display: flex;
      width: 100%;
      max-width: 880px;
      min-height: 540px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
      overflow: hidden;
      animation: cardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    /* ── Form panel (left 42%) ───────────────── */
    .form-panel {
      width: 42%;
      flex-shrink: 0;
      background: var(--card-bg);
      padding: 36px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Brand */
    .brand-name {
      font-size: 22px;
      font-weight: 700;
      color: var(--brand);
      font-family: 'Poppins', sans-serif;
      margin: 0 0 4px;
      line-height: 1.2;
    }
    .brand-tagline {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.01em;
      margin: 0 0 24px;
    }

    .form-heading {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-heading);
      line-height: 1.2;
      margin: 0 0 6px;
    }
    .form-subheading {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 20px;
    }

    /* Form groups */
    .form-group { margin-bottom: 14px; }
    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-body);
      margin-bottom: 6px;
    }

    /* Input wrapper */
    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute;
      left: 16px; top: 50%;
      transform: translateY(-50%);
      width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      font-size: 13px;
      pointer-events: none;
    }
    .form-control {
      width: 100%;
      height: 46px;
      border-radius: 50px;
      background: var(--input-bg);
      border: 1px solid var(--border-input);
      padding: 0 16px 0 44px;
      font-size: 14px;
      font-family: 'Poppins', sans-serif;
      color: var(--text-body);
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-control::placeholder { color: var(--text-muted); }
    .form-control:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-focus);
    }
    .form-control.input-with-action { padding-right: 48px; }

    /* Toggle password */
    .input-action-btn {
      position: absolute; right: 14px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--text-muted); cursor: pointer;
      padding: 4px; border-radius: 4px;
      font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.18s;
    }
    .input-action-btn:hover { color: var(--text-body); }

    /* Error */
    .error-msg {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; color: #E53E3E;
      margin-top: 5px; padding-left: 4px;
    }

    /* Submit button */
    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; height: 48px; border-radius: 50px;
      background: var(--brand);
      color: #fff; border: none;
      font-size: 15px; font-weight: 600;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.02em; cursor: pointer; margin-top: 8px;
      transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    }
    .submit-btn:hover:not(:disabled) {
      background: var(--brand-hover);
      box-shadow: 0 4px 16px var(--brand-shadow);
      transform: translateY(-1px);
    }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

    /* Spinner */
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    /* Footer */
    .form-footer {
      text-align: center; margin-top: 20px;
      font-size: 12px; color: var(--text-muted);
    }
    .form-footer a {
      color: var(--brand); font-weight: 600;
      text-decoration: none; margin-left: 4px;
      transition: color 0.2s;
    }
    .form-footer a:hover { color: var(--brand-hover); text-decoration: underline; }

    /* ── Hero panel (right 58%) ──────────────── */
    .hero-panel {
      flex: 1;
      background: linear-gradient(135deg, #D4531A 0%, #C14510 40%, #EDE8E0 100%);
      border-radius: 0 20px 20px 0;
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      animation: heroIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
    }

    /* Blobs */
    .blob { position: absolute; border-radius: 50%; pointer-events: none; }
    .blob-large {
      width: 200px; height: 200px;
      background: rgba(212,83,26,0.22);
      top: -60px; right: -60px;
    }
    .blob-medium {
      width: 130px; height: 130px;
      background: #C14510; opacity: 0.55;
      bottom: 30px; left: -35px;
    }
    .blob-accent {
      width: 70px; height: 70px;
      background: rgba(212,83,26,0.28);
      bottom: 120px; right: 60px;
    }

    /* Hero content */
    .hero-content {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      align-items: center; gap: 20px;
      padding: 24px;
    }

    .hero-eyebrow {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: rgba(255,255,255,0.68);
      margin: 0;
    }

    /* Food pills */
    .food-pills {
      display: flex; flex-direction: column; gap: 10px; align-items: center;
    }
    .pills-row {
      display: flex; gap: 8px;
    }
    .food-pill {
      padding: 9px 18px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.26);
      border-radius: 50px;
      color: #fff;
      font-size: 14px; font-weight: 600;
      font-family: 'Poppins', sans-serif;
      backdrop-filter: blur(4px);
      white-space: nowrap;
      animation: pillFloat ease-in-out infinite;
      cursor: default;
      transition: background 0.2s, transform 0.2s;
    }
    .food-pill:hover {
      background: rgba(255,255,255,0.26);
      transform: translateY(-3px) scale(1.04) rotate(0deg) !important;
    }

    .fp-1 { --r: -3deg;  animation-duration: 3.2s; animation-delay: 0.0s; }
    .fp-2 { --r:  2deg;  animation-duration: 3.9s; animation-delay: 0.4s; }
    .fp-3 { --r: -2deg;  animation-duration: 4.1s; animation-delay: 0.7s; }
    .fp-4 { --r:  3deg;  animation-duration: 3.6s; animation-delay: 0.2s; }
    .fp-5 { --r: -1deg;  animation-duration: 4.4s; animation-delay: 1.0s; }
    .fp-6 { --r:  2deg;  animation-duration: 3.7s; animation-delay: 0.5s; }

    .hero-cta {
      font-size: 12px;
      color: rgba(255,255,255,0.62);
      margin: 0; font-style: italic;
      letter-spacing: 0.02em;
    }

    /* ── Responsive ──────────────────────────── */
    @media (max-width: 640px) {
      .register-card {
        flex-direction: column;
        min-height: unset;
        border-radius: 16px;
      }
      .form-panel {
        width: 100%;
        padding: 32px 24px;
      }
      .hero-panel { display: none; }
    }
  `]
})
export class RegistrarComponent {
  form: FormGroup;
  loading = false;
  showPassword = false; // UI state only

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      nome:   ['', Validators.required],
      email:  ['', [Validators.required, Validators.email]],
      senha:  ['', [Validators.required, Validators.minLength(6)]],
      perfil: ['CLIENTE']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.registrar(this.form.value).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: () => { this.loading = false; }
    });
  }
}
