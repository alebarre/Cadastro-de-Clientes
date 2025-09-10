import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordPolicyValidator } from '../../utils/password-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="d-flex justify-content-center align-items-center" style="min-height: 70vh;">
    <div class="card shadow-sm" style="max-width: 520px; width: 100%;">
      <div class="card-body">
        <h4 class="mb-3">Criar conta</h4>

        <div *ngIf="alert" class="alert" [ngClass]="alert.type" role="alert">
          {{ alert.text }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="phase==='register'">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input class="form-control" formControlName="email"
                   [class.is-invalid]="invalid('email')">
            <div class="invalid-feedback">Informe um e-mail válido.</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Senha</label>
            <input type="password" class="form-control" formControlName="password"
                   [class.is-invalid]="invalid('password') || !!form.get('password')?.errors?.['server']">
            <div class="form-text" *ngIf="form.get('password')?.errors?.['policy']">
              Requisitos: {{ form.get('password')?.errors?.['policy'] }}
            </div>
            <div class="invalid-feedback" *ngIf="form.get('password')?.errors?.['server']">
              {{ form.get('password')?.errors?.['server'] }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Confirmar senha</label>
            <input type="password" class="form-control" formControlName="confirm"
                   [class.is-invalid]="mismatch || invalid('confirm')">
            <div class="invalid-feedback">As senhas não coincidem.</div>
          </div>

          <button class="btn btn-primary w-100" type="submit" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Registrar
          </button>
        </form>

        <div *ngIf="phase==='verify'">
          <hr class="my-3" />
          <h6>Verificação</h6>
          <p>Enviamos um código para <strong>{{ email() }}</strong>.</p>

          <div class="mb-3">
            <label class="form-label">Código (6 dígitos)</label>
            <input class="form-control" maxlength="6" inputmode="numeric"
                   formControlName="code" placeholder="000000">
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-success w-100" (click)="confirm()" [disabled]="loading">
              Confirmar
            </button>
            <button class="btn btn-outline-secondary" (click)="resend()" [disabled]="loading || cooldown>0">
              Reenviar <span *ngIf="cooldown>0">({{ cooldown }}s)</span>
            </button>
          </div>
        </div>

        <div class="mt-3 text-center">
          <a [routerLink]="['/login']">Já tem conta? Entrar</a>
        </div>
      </div>
    </div>
  </div>
  `
})
export class RegisterComponent {
  loading = false;
  phase: 'register' | 'verify' = 'register';
  cooldown = 0;

  alert: { type: string; text: string } | null = null; // { type: 'alert-success'|'alert-danger'|'alert-warning', text: '' }

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordPolicyValidator(8)]],
      confirm: ['', [Validators.required]],
      code: ['']
    });
  }

  email() { return this.form.value.email || ''; }
  get mismatch() { return this.form.value.password !== this.form.value.confirm; }
  invalid(n: string) { const c = this.form.get(n); return !!c && c.invalid && (c.dirty || c.touched); }

  private setAlert(type: 'success' | 'danger' | 'warning', text: string) {
    this.alert = { type: `alert-${type}`, text };
    if (type === 'success') setTimeout(() => this.alert = null, 3000);
  }

  submit() {
    if (this.form.invalid || this.mismatch) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.register(email!, password!).subscribe({
      next: res => {
        this.setAlert('success', res.message || 'Verifique seu e-mail.');
        this.phase = 'verify';
      },
      error: err => {
        const fe = err?.error?.fieldErrors;
        if (fe?.password) this.form.get('password')?.setErrors({ server: fe.password });
        this.setAlert('danger', err?.error?.message || 'Falha ao registrar.');
      }
    }).add(() => this.loading = false);
  }

  confirm() {
    const code = this.form.value.code;
    if (!code || code.length !== 6) { this.setAlert('warning', 'Informe o código de 6 dígitos.'); return; }
    this.loading = true;
    this.auth.verify(this.email(), code).subscribe({
      next: res => {
        this.setAlert('success', res.message || 'Cadastro verificado. Redirecionando…');
        setTimeout(() => this.router.navigateByUrl('/login', { replaceUrl: true }), 300);
      },
      error: err => this.setAlert('danger', err?.error?.message || 'Código inválido ou expirado.')
    }).add(() => this.loading = false);
  }

  resend() {
    if (this.cooldown > 0) return;
    const email = this.email();
    this.loading = true;
    this.auth.resendVerify(email).subscribe({
      next: () => { this.setAlert('success', 'Código reenviado.'); this.startCooldown(60); },
      error: (err) => {
        const msg = err?.error?.message || 'Falha ao reenviar.';
        this.setAlert('danger', msg);
        const m = /(\d+)s/.exec(msg);
        if (m) this.startCooldown(Number(m[1]));
      }
    }).add(() => this.loading = false);
  }

  startCooldown(sec: number) {
    this.cooldown = sec;
    const iv = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) clearInterval(iv);
    }, 1000);
  }
}
