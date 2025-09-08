import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="d-flex justify-content-center align-items-center"
      style="min-height: 70vh;"
    >
      <div class="card shadow-sm" style="max-width: 420px; width: 100%;">
        <div class="card-body">
          <h4 class="mb-3">Entrar</h4>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Usuário</label>
              <input
                class="form-control"
                formControlName="username"
                autocomplete="username"
                [ngClass]="{ 'is-invalid': isInvalid('username') }"
              />
              <div class="invalid-feedback">Informe o usuário.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Senha</label>
              <input
                class="form-control"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                [ngClass]="{ 'is-invalid': isInvalid('password') }"
              />
              <div class="invalid-feedback">Informe a senha.</div>
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
              Entrar
            </button>
          </form>

          <div class="mt-3 text-center">
            <small class="text-muted"
              >Use <code>admin / admin123</code> (seed de exemplo)</small
            >
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loading = false;
  returnUrl: string;

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/clientes';
  }

  isInvalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { username, password } = this.form.value;

    this.auth
      .login(username!, password!)
      .subscribe({
        next: () => {
          this.notify.success('Login realizado com sucesso!');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Falha no login.';
          this.notify.error(msg);
        },
      })
      .add(() => (this.loading = false));
  }
}
