import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="d-flex justify-content-center align-items-center"
      style="min-height: 70vh;"
    >
      <div class="card shadow-sm" style="max-width: 480px; width: 100%;">
        <div class="card-body">
          <h4 class="mb-3">Criar conta</h4>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                class="form-control"
                formControlName="email"
                [ngClass]="{ 'is-invalid': invalid('email') }"
              />
              <div class="invalid-feedback">Informe um e-mail válido.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Senha</label>
              <input
                class="form-control"
                type="password"
                formControlName="password"
                [ngClass]="{ 'is-invalid': invalid('password') }"
              />
              <div class="invalid-feedback">Mínimo 6 caracteres.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Confirmar senha</label>
              <input
                class="form-control"
                type="password"
                formControlName="confirm"
                [ngClass]="{ 'is-invalid': invalid('confirm') || mismatch }"
              />
              <div class="invalid-feedback">As senhas não coincidem.</div>
            </div>

            <button
              class="btn btn-primary w-100"
              type="submit"
              [disabled]="loading"
            >
              <span
                *ngIf="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Registrar
            </button>
          </form>

          <div *ngIf="phase === 'verify'" class="mt-4">
            <hr class="my-3" />
            <h6>Verificação</h6>
            <p>
              Enviamos um código para <strong>{{ email() }}</strong
              >.
            </p>

            <div class="mb-3">
              <label class="form-label">Código (6 dígitos)</label>
              <input
                class="form-control"
                maxlength="6"
                inputmode="numeric"
                [formControl]="codeControl"
                name="code"
                placeholder="000000"
              />
            </div>

            <div class="d-flex gap-2">
              <button
                class="btn btn-success w-100"
                (click)="confirm()"
                [disabled]="loading"
              >
                Confirmar
              </button>
              <button class="btn btn-outline-secondary"
                      (click)="resend()"
                      [disabled]="loading || cooldown>0">
                Reenviar <span *ngIf="cooldown>0">({{cooldown}}s)</span>
              </button>
            </div>
          </div>
          <div class="mt-3 text-center">
            <a [routerLink]="['/login']">Já tem conta? Entrar</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  loading = false;
  phase: 'register' | 'verify' = 'register';
  code = '';
  codeControl;
  form;
  cooldown = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router
  ) {
    this.codeControl = this.fb.control('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]);

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    });
  }

  email() {
    return this.form.value.email || '';
  }
  get mismatch() {
    return this.form.value.password !== this.form.value.confirm;
  }
  invalid(n: string) {
    const c = this.form.get(n);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit() {
    if (this.form.invalid || this.mismatch) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth
      .register(email!, password!)
      .subscribe({
        next: (res) => {
          this.notify.success(res.message || 'Verifique seu e-mail.');
          this.phase = 'verify';
        },
        error: (err) =>
          this.notify.error(err?.error?.message || 'Falha ao registrar.'),
      })
      .add(() => (this.loading = false));
  }
  confirm() {
    const codeValue = this.codeControl.value;
    if (!codeValue || codeValue.length !== 6) {
      this.notify.warn('Informe o código de 6 dígitos.');
      return;
    }
    this.loading = true;
    this.auth
      .verify(this.email(), codeValue)
      .subscribe({
        next: (res) => {
          this.notify.success(
            res.message || 'Cadastro verificado. Faça login.'
          );
          this.router.navigate(['/login']);
        },
        error: (err) =>
          this.notify.error(
            err?.error?.message || 'Código inválido ou expirado.'
          ),
      })
      .add(() => (this.loading = false));
  }

  resend() {
    if (this.cooldown > 0) return;
    const email = this.email();
    this.loading = true;
    this.auth.resendVerify(email).subscribe({
      next: () => {
        this.notify.success('Código reenviado.');
        this.startCooldown(60); // deve bater com app.code.cooldown-seconds
      },
      error: (err) => {
        const msg = err?.error?.message || 'Falha ao reenviar.';
        this.notify.error(msg);
        // se o back devolveu 429 com "Aguarde Xs", podemos extrair X por regex:
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
