import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div
      class="d-flex justify-content-center align-items-center"
      style="min-height: 70vh;"
    >
      <div class="card shadow-sm" style="max-width: 480px; width: 100%;">
        <div class="card-body">
          <h4 class="mb-3">Esqueci a senha</h4>

          <form [formGroup]="form" (ngSubmit)="request()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                class="form-control"
                formControlName="email"
                [ngClass]="{ 'is-invalid': invalid('email') }"
              />
              <div class="invalid-feedback">Informe um e-mail válido.</div>
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
              Enviar código
            </button>
          </form>

          <div *ngIf="phase === 'code'" class="mt-4">
            <hr class="my-3" />
            <h6>Redefinir senha</h6>

            <div class="mb-3">
              <label class="form-label">Código (6 dígitos)</label>
              <input
                class="form-control"
                maxlength="6"
                inputmode="numeric"
                [(ngModel)]="code"
                name="code"
                placeholder="000000"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Nova senha</label>
              <input
                class="form-control"
                type="password"
                [(ngModel)]="newPassword"
                name="newPassword"
              />
            </div>

            <div class="d-flex gap-2">
              <button
                class="btn btn-success w-100"
                (click)="reset()"
                [disabled]="loading"
              >
                Confirmar
              </button>
              <button class="btn btn-outline-secondary"
                      (click)="resend()"
                      [disabled]="loading || cooldown>0">
                Reenviar <span *ngIf="cooldown>0">({{ cooldown }}s)</span>
              </button>
            </div>
          </div>

          <div class="mt-3 text-center">
            <a [routerLink]="['/login']">Voltar para login</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ForgotComponent {
  loading = false;
  phase: 'request' | 'code' = 'request';
  code = '';
  newPassword = '';
  cooldown = 0; // em segundos

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  invalid(n: string) {
    const c = this.form.get(n);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  request() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const email = this.form.value.email!;
    this.auth
      .forgot(email)
      .subscribe({
        next: (res) => {
          this.notify.success(res.message || 'Código enviado.');
          this.phase = 'code';
        },
        error: (err) =>
          this.notify.error(err?.error?.message || 'Falha ao enviar código.'),
      })
      .add(() => (this.loading = false));
  }

  reset() {
    const email = this.form.value.email!;
    if (!this.code || this.code.length !== 6 || !this.newPassword) {
      this.notify.warn('Informe código de 6 dígitos e nova senha.');
      return;
    }
    this.loading = true;
    this.auth
      .reset(email, this.code, this.newPassword)
      .subscribe({
        next: (res) => {
          this.notify.success(res.message || 'Senha redefinida.');
          this.router.navigate(['/login']);
        },
        error: (err) =>
          this.notify.error(err?.error?.message || 'Falha ao redefinir.'),
      })
      .add(() => (this.loading = false));
  }

  resend() {
    if (this.cooldown > 0) return;
    const email = this.form.value.email!;
    this.loading = true;
    this.auth.resendReset(email).subscribe({
      next: () => {
        this.notify.success('Código reenviado.');
        this.startCooldown(60); // mantenha em sincronia com app.code.cooldown-seconds
      },
      error: (err) => {
        const msg = err?.error?.message || 'Falha ao reenviar.';
        this.notify.error(msg);
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
