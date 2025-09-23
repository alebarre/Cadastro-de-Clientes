import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 70vh;">
      <div class="card shadow-sm" style="max-width: 420px; width: 100%;">
        <div class="card-body">
          <h4 class="mb-3">Entrar</h4>

          <!-- aviso de bloqueio -->
          <div *ngIf="isLocked()" class="alert alert-warning py-2">
            Muitas tentativas. Tente novamente em <strong>{{ remaining }}s</strong>.
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <label class="form-label">Usuário</label>
              <input
                class="form-control"
                formControlName="username"
                autocomplete="username"
                [disabled]="isLocked()"
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
                [disabled]="isLocked()"
                [ngClass]="{ 'is-invalid': isInvalid('password') }"
              />
              <div class="invalid-feedback">Informe a senha.</div>
            </div>

            <button
              class="btn btn-primary w-100"
              type="submit"
              [disabled]="loading || isLocked()"
            >
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              Entrar
            </button>
          </form>

          <div class="mt-3 d-flex justify-content-between">
            <a [routerLink]="['/register']">Não tem cadastro? Clique aqui</a>
            <a [routerLink]="['/forgot']">Esqueci a senha</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  loading = false;
  returnUrl: string;
  remaining = 0;                       // segundos restantes do bloqueio
  private lockUntil = 0;               // timestamp (ms) do fim do bloqueio
  private lockTimer: any;              // setInterval handler

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
      this.route.snapshot.queryParamMap.get('returnUrl') ||
      window.history.state?.returnUrl ||
      '/app';

    // Se já está logado, manda pro Shell
    if (this.auth.hasValidToken()) {
      this.router.navigateByUrl('/app', { replaceUrl: true });
    }
  }

  ngOnInit(): void {
    // zera o form ao abrir
    this.form.reset({ username: '', password: '' });

    // restaura bloqueio, se existir
    const saved = Number(localStorage.getItem('login_lock_until') || 0);
    if (saved && saved > Date.now()) {
      this.beginLockUntil(saved);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.form.reset({ username: '', password: '' }), 0);
  }

  ngOnDestroy(): void {
    if (this.lockTimer) clearInterval(this.lockTimer);
  }

  isInvalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  isLocked(): boolean {
    return Date.now() < this.lockUntil;
  }

  private beginLock(seconds: number) {
    this.beginLockUntil(Date.now() + seconds * 1000);
  }

  private beginLockUntil(untilMs: number) {
    this.lockUntil = untilMs;
    localStorage.setItem('login_lock_until', String(this.lockUntil));
    this.tick();
    if (this.lockTimer) clearInterval(this.lockTimer);
    this.lockTimer = setInterval(() => this.tick(), 1000);
  }

  private tick() {
    const ms = this.lockUntil - Date.now();
    if (ms <= 0) {
      this.remaining = 0;
      this.lockUntil = 0;
      localStorage.removeItem('login_lock_until');
      if (this.lockTimer) { clearInterval(this.lockTimer); this.lockTimer = null; }
      return;
    }
    this.remaining = Math.ceil(ms / 1000);
  }

  submit() {
    if (this.isLocked()) {
      this.notify.warn(`Muitas tentativas. Aguarde ${this.remaining}s.`);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, password } = this.form.value;

    // destino para pós-login
    const target = this.returnUrl || '/app';
    sessionStorage.setItem('redirect_after_login', target);

    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.notify.success('Login realizado com sucesso!');
        // navegação no AuthService
      },
      error: (err: any) => {
        const status = err?.status;

        // pode ser objeto, string ou indefinido
        const body = err?.error;
        const bodyObj = (body && typeof body === 'object') ? body : null;

        // mensagem do back
        const backendMsg =
          (bodyObj?.detail ?? bodyObj?.message ?? bodyObj?.title ?? '') ||
          (typeof body === 'string' ? body : '') ||
          err?.message || '';

        // Retry-After: se não vier nada no Json, pega o do header
        const retryFromBody = Number(bodyObj?.retry_after);
        const retryHeaderRaw = err?.headers?.get?.('Retry-After');
        const retryFromHeader = retryHeaderRaw != null ? Number(retryHeaderRaw) : NaN;

        if (status === 429) {
          const seconds =
            (Number.isFinite(retryFromBody) && retryFromBody > 0) ? retryFromBody
              : (Number.isFinite(retryFromHeader) && retryFromHeader > 0) ? retryFromHeader
                : 60;

          this.beginLock(seconds);
          const msg = backendMsg || 'Muitas tentativas de login.';
          if (backendMsg) {
            this.notify.warn(`${msg}`);
          } else {
            this.notify.warn(`Muitas tentativas de login. Tente novamente em ${seconds}s.`);
          }
          return;
        }

        // demais erros
        const msg = backendMsg || 'Falha no login.';
        this.notify.error(msg);
      },
    }).add(() => (this.loading = false));
  }
}
