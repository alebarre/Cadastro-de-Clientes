// src/app/pages/register/register.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordPolicyValidator } from '../../utils/password-validators';
import { MaskDirective } from '../../services/mask.directives';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MaskDirective],
  template: `
  <div class="d-flex justify-content-center align-items-center" style="min-height: 70vh;">
    <div class="card shadow-sm" style="max-width: 520px; width: 100%;">
      <div class="card-body">
        <h4 class="mb-3">Criar conta</h4>

        <div *ngIf="alert" class="alert" [ngClass]="alert.type" role="alert">
          {{ alert.text }}
        </div>

        <!-- Fase 1: Registro -->
        <form *ngIf="phase==='register'" [formGroup]="form" (ngSubmit)="submit()" autocomplete="off">
          <div class="mb-3">
            <label class="form-label">Nome</label>
            <input class="form-control"
                   formControlName="nome"
                   autocomplete="off"
                   [class.is-invalid]="invalid('nome')">
            <div class="invalid-feedback">Informe seu nome (mín. 3 caracteres).</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input class="form-control"
                   formControlName="email"
                   autocomplete="off"
                   autocapitalize="none"
                   autocorrect="off"
                   [class.is-invalid]="invalid('email')">
            <div class="invalid-feedback">Informe um e-mail válido.</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Telefone</label>
            <input class="form-control"
                   formControlName="phone"
                   appMask="phoneBr"
                   [maskSaveRaw]="true"
                   placeholder="(11) 91234-5678"
                   autocomplete="off"
                   [class.is-invalid]="invalid('phone')">
            <div class="invalid-feedback">Informe um phone válido (10 ou 11 dígitos).</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Senha</label>
            <input type="password"
                   class="form-control"
                   formControlName="password"
                   autocomplete="new-password"
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
            <input type="password"
                   class="form-control"
                   formControlName="confirm"
                   autocomplete="new-password"
                   [class.is-invalid]="mismatch || invalid('confirm')">
            <div class="invalid-feedback">As senhas não coincidem.</div>
          </div>

          <button class="btn btn-primary w-100" type="submit" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Registrar
          </button>
        </form>

        <!-- Fase 2: Verificação -->
        <div *ngIf="phase==='verify'" [formGroup]="form">
          <hr class="my-3" />
          <h6>Verificação</h6>
          <p>Enviamos um código para <strong>{{ email() }}</strong>.</p>

          <div class="mb-3">
            <label class="form-label">Código (6 dígitos)</label>
            <input class="form-control"
                   formControlName="code"
                   maxlength="6"
                   inputmode="numeric"
                   autocomplete="one-time-code"
                   (input)="digitsOnly('code')"
                   placeholder="000000">
          </div>

          <div class="d-flex gap-2">
            <button type="button"
                    class="btn btn-success w-100"
                    (click)="confirm()"
                    [disabled]="loading || codeLength() !== 6">
              Confirmar
            </button>
            <button type="button"
                    class="btn btn-outline-secondary"
                    (click)="resend()"
                    [disabled]="loading || cooldown>0">
              Reenviar <span *ngIf="cooldown>0">({{ cooldown }}s)</span>
            </button>
          </div>

          <div class="mt-3 text-center">
            <a [routerLink]="['/login']">Voltar ao login</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class RegisterComponent implements OnInit, AfterViewInit {
  loading = false;
  phase: 'register' | 'verify' = 'register';
  cooldown = 0;

  alert: { type: string; text: string } | null = null;

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      password: ['', [Validators.required, passwordPolicyValidator(8)]],
      confirm: ['', [Validators.required]],
      code: ['']
    });
  }

  ngOnInit(): void {
    // sempre inicia zerado
    this.phase = 'register';
    this.form.reset({ nome: '', email: '', phone: '', password: '', confirm: '', code: '' });
  }

  ngAfterViewInit(): void {
    // mata autofill tardio
    setTimeout(() => this.form.reset({ nome: '', email: '', phone: '', password: '', confirm: '', code: '' }), 0);
  }

  email() { return (this.form.value.email || '').toString(); }
  codeLength() { return (this.form.get('code')?.value || '').toString().trim().length; }
  get mismatch() { return this.form.value.password !== this.form.value.confirm; }
  invalid(n: string) { const c = this.form.get(n); return !!c && c.invalid && (c.dirty || c.touched); }

  digitsOnly(ctrlName: string) {
    const c = this.form.get(ctrlName);
    if (!c) return;
    const only = (c.value || '').toString().replace(/\D/g, '').slice(0, 6);
    if (only !== c.value) c.setValue(only);
  }

  private setAlert(type: 'success' | 'danger' | 'warning', text: string) {
    this.alert = { type: `alert-${type}`, text };
    if (type === 'success') setTimeout(() => this.alert = null, 3000);
  }

  submit() {
    if (this.form.invalid || this.mismatch) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { nome, email, phone, password } = this.form.value;

    // envia já com phone "raw" (10–11 dígitos) graças ao [maskSaveRaw]="true"
    this.auth.register(nome!, email!, phone!, password!).subscribe({
      next: res => {
        // limpa dados sensíveis e vai para a fase verify
        this.form.patchValue({ password: '', confirm: '', code: '' });
        this.setAlert('success', res.message || 'Verifique seu e-mail.');
        this.phase = 'verify';
      },
      error: err => {
        const fe = err?.error?.fieldErrors || {};
        if (fe.password) this.form.get('password')?.setErrors({ server: fe.password });
        if (fe.nome) this.form.get('nome')?.setErrors({ server: fe.nome });
        if (fe.email) this.form.get('email')?.setErrors({ server: fe.email });
        if (fe.phone) this.form.get('phone')?.setErrors({ server: fe.phone });
        this.setAlert('danger', err?.error?.message || 'Falha ao registrar.');
      }
    }).add(() => this.loading = false);
  }

  confirm() {
    const code = (this.form.get('code')?.value || '').toString().trim();
    if (code.length !== 6) { this.setAlert('warning', 'Informe o código de 6 dígitos.'); return; }

    this.loading = true;
    this.auth.verify(this.email(), code).subscribe({
      next: res => {
        this.setAlert('success', res.message || 'Cadastro verificado. Redirecionando…');
        setTimeout(() => this.router.navigateByUrl('/login', { replaceUrl: true }), 3500);
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
