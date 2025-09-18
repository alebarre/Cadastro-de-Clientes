// src/app/pages/usuario-form/usuarios-form.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule, Validators,
  AbstractControl, FormGroup
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { passwordPolicyValidator } from '../../utils/password-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="card">
    <div class="card-body">
      <h4 class="mb-3">{{ isEdit ? 'Editar usuário' : 'Novo usuário' }}</h4>

      <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Nome</label>
            <input class="form-control" formControlName="nome"
                   [class.is-invalid]="invalid('nome')">
            <div class="invalid-feedback">Informe o nome (mín. 3).</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Username</label>
            <input class="form-control" formControlName="username"
                   [class.is-invalid]="invalid('username')">
            <div class="invalid-feedback">Informe o username.</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Email</label>
            <input class="form-control" formControlName="email"
                   [class.is-invalid]="invalid('email')">
            <div class="invalid-feedback">Informe um e-mail válido.</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Telefone</label>
            <input class="form-control" formControlName="telefone">
          </div>

          <div class="col-12 col-md-3 d-flex align-items-end">
            <div class="form-check">
              <input type="checkbox" id="enabled" class="form-check-input" formControlName="enabled">
              <label class="form-check-label" for="enabled">Ativo</label>
            </div>
          </div>
        </div>

        <hr class="my-4" />

        <!-- Troca de senha -->
        <h5 class="mb-2">Trocar senha <small class="text-muted" *ngIf="isEdit">(opcional)</small></h5>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">{{ isEdit ? 'Nova senha (deixe em branco para manter)' : 'Senha' }}</label>
            <input type="password" class="form-control" formControlName="password"
                   [class.is-invalid]="invalid('password') || !!form.get('password')?.errors?.['server']">
            <div class="form-text" *ngIf="form.get('password')?.errors?.['policy']">
              Requisitos: {{ form.get('password')?.errors?.['policy'] }}
            </div>
            <div class="invalid-feedback" *ngIf="form.get('password')?.errors?.['server']">
              {{ form.get('password')?.errors?.['server'] }}
            </div>
            <div class="invalid-feedback" *ngIf="!form.get('password')?.errors?.['server'] && invalid('password')">
              Senha inválida.
            </div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">{{ isEdit ? 'Confirmar nova senha' : 'Confirmar senha' }}</label>
            <input type="password" class="form-control" formControlName="confirm"
                   [class.is-invalid]="(passwordTouchedOrFilled() || confirmTouched()) && mismatch()">
            <div class="invalid-feedback">As senhas não coincidem.</div>
          </div>
        </div>

        <div class="mt-3 d-flex flex-wrap flex-sm-nowrap gap-2">
          <button class="btn btn-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto" type="submit">
            Salvar
          </button>
          <a class="btn btn-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto" [routerLink]="['/app','usuarios']">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  </div>
  `
})
export class UsuariosFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  id?: number;
  subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: UsuarioService,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    if (this.isEdit) this.id = Number(idParam);

    // Sincroniza validadores de senha conforme modo / preenchimento
    this.syncPasswordValidators();

    // Reage quando o usuário digita/limpa senha/confirm
    this.subs.push(
      this.form.get('password')!.valueChanges.subscribe(() => this.syncPasswordValidators()),
      this.form.get('confirm')!.valueChanges.subscribe(() => this.syncPasswordValidators())
    );

    if (this.isEdit && this.id) {
      this.svc.getById(this.id).subscribe({
        next: u => {
          this.form.patchValue({
            nome: u.nome,
            username: u.username,
            email: u.email,
            telefone: u.telefone ?? '',
            enabled: u.enabled ?? true
          });
          // Em edição, deixa password/confirm vazios (opcional)
          this.syncPasswordValidators();
        },
        error: () => {
          this.notify.error('Usuário não encontrado.');
          this.router.navigate(['/app', 'usuarios']);
        }
      });
    }
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  /* ================== FORM ================== */
  buildForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      enabled: [true],
      password: [''], // dinâmica (obrigatória só em criação ou se preenchida)
      confirm: ['']   // idem
    });
  }

  /** Em criação: senha obrigatória + política.
   *  Em edição: se os dois campos estiverem vazios ⇒ sem validação.
   *             se preencher, aplica política e confirmação obrigatória. */
  private syncPasswordValidators() {
    const pwd = this.form.get('password')!;
    const conf = this.form.get('confirm')!;
    const p = (pwd.value ?? '').toString();
    const c = (conf.value ?? '').toString();

    if (!this.isEdit) {
      // criação
      pwd.setValidators([Validators.required, passwordPolicyValidator(8)]);
      conf.setValidators([Validators.required]);
    } else {
      // edição
      const wantsChange = p.trim().length > 0 || c.trim().length > 0;
      if (wantsChange) {
        pwd.setValidators([Validators.required, passwordPolicyValidator(8)]);
        conf.setValidators([Validators.required]);
      } else {
        // não quer trocar → sem erros/validação
        pwd.setValidators([]);
        conf.setValidators([]);
        // limpa erros antigos
        pwd.setErrors(null);
        conf.setErrors(null);
      }
    }
    pwd.updateValueAndValidity({ emitEvent: false });
    conf.updateValueAndValidity({ emitEvent: false });
  }

  /* ================== UI helpers ================== */
  invalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }
  mismatch(): boolean {
    const p = (this.form.value.password || '').toString();
    const c = (this.form.value.confirm || '').toString();
    // só acusa mismatch se houver “intenção” de trocar (algum preenchido)
    if (this.isEdit && !p && !c) return false;
    return p !== c;
  }
  passwordTouchedOrFilled() {
    const c = this.form.get('password');
    const v = (c?.value || '').toString();
    return (c?.touched || c?.dirty || v.length > 0);
  }
  confirmTouched() {
    const c = this.form.get('confirm');
    const v = (c?.value || '').toString();
    return (c?.touched || c?.dirty || v.length > 0);
  }

  /* ================== SUBMIT ================== */
  salvar() {
    // Se houver intenção de trocar senha, bloqueia mismatch/política
    if (this.mismatch()) {
      this.form.get('confirm')?.markAsTouched();
      this.notify.error('As senhas não coincidem.');
      return;
    }

    this.syncPasswordValidators();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Há campos inválidos.');
      return;
    }

    // Monta payload; omite password vazio em edição
    const { password, confirm, ...rest } = this.form.value;
    const body: any = { ...rest };
    const wantsChange = !!(password && password.toString().trim().length);

    if (!this.isEdit) {
      // criação → deve enviar senha
      body.password = password;
    } else if (wantsChange) {
      body.password = password;
    }

    const req$ = this.isEdit && this.id
      ? this.svc.update(this.id, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => {
        this.notify.success('Usuário salvo com sucesso!');
        this.router.navigate(['/app', 'usuarios']);
      },
      error: (err) => {
        const fe = err?.error?.fieldErrors;
        if (fe?.password) this.form.get('password')?.setErrors({ server: fe.password });
        this.notify.error(err?.error?.message || 'Falha ao salvar.');
      }
    });
  }
}
