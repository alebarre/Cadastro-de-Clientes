// path: src/app/usuarios/usuario-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from "../../layout/sidebar.component";

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent],
  template: `
  <app-sidebar></app-sidebar>

  <div class="card">
    <div class="card-body">
      <h4 class="card-title mb-3">{{ editingId ? 'Editar Usuário' : 'Novo Usuário' }}</h4>

      <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Nome</label>
            <input class="form-control" formControlName="nome" [ngClass]="{'is-invalid': invalid('nome')}" />
            <div class="invalid-feedback">Informe um nome com ao menos 3 caracteres.</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" formControlName="email" [ngClass]="{'is-invalid': invalid('email')}" />
            <div class="invalid-feedback">Email inválido.</div>
          </div>

          <div class="col-12 col-md-6" *ngIf="!editingId">
            <label class="form-label">Senha</label>
            <input class="form-control" type="password" formControlName="senha" [ngClass]="{'is-invalid': invalid('senha')}" />
            <div class="invalid-feedback">Senha deve ter ao menos 6 caracteres.</div>
          </div>

          <div class="col-12 col-md-3">
            <label class="form-label d-block">Papéis</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" [checked]="hasRole('ROLE_USER')" (change)="toggleRole('ROLE_USER', $event)">
              <label class="form-check-label">USER</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" [checked]="hasRole('ROLE_ADMIN')" (change)="toggleRole('ROLE_ADMIN', $event)">
              <label class="form-check-label">ADMIN</label>
            </div>
            <div class="form-text">Selecione ao menos um papel.</div>
          </div>

          <div class="col-12 col-md-3">
            <label class="form-label d-block">Ativo</label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" formControlName="ativo">
              <label class="form-check-label">Ativo</label>
            </div>
          </div>
        </div>

        <div class="mt-3 d-flex flex-wrap flex-sm-nowrap gap-2">
          <button class="btn btn-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto" type="submit">Salvar</button>
          <a class="btn btn-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto" [routerLink]="['/usuarios']">Cancelar</a>
        </div>
      </form>
    </div>
  </div>
  `,
})
export class UsuariosFormComponent {
  form!: FormGroup;
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: UsuarioService,
    private notify: NotificationService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', this.isCreate() ? [Validators.required, Validators.minLength(6)] : []],
      roles: this.fb.array<string>([], [Validators.required]),
      ativo: [true],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      this.svc.getById(this.editingId).subscribe({
        next: (u) => {
          this.form.patchValue({
            nome: u.nome,
            email: u.email,
            ativo: u.ativo
          });
          // set roles checkboxes
          const fa = this.form.get('roles') as FormArray<any>;
          fa.clear();
          for (const r of u.roles || []) fa.push(this.fb.control(r));
        },
        error: () => {
          this.notify.error('Usuário não encontrado.');
          this.router.navigate(['/usuarios']);
        }
      });
    }
  }

  private isCreate() { return !this.route.snapshot.paramMap.get('id'); }

  invalid(path: string) {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  hasRole(role: string) {
    return (this.form.get('roles') as FormArray<any>).value.includes(role);
  }

  toggleRole(role: string, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const roles = this.form.get('roles') as FormArray<any>;
    const idx = roles.value.indexOf(role);
    if (checked && idx === -1) roles.push(this.fb.control(role));
    if (!checked && idx !== -1) roles.removeAt(idx);
    roles.updateValueAndValidity();
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Preencha os campos obrigatórios.');
      return;
    }
    const value = this.form.value as any;

    // monta request (não envia senha vazia no update)
    const body = {
      nome: value.nome,
      email: value.email,
      senha: this.editingId ? undefined : value.senha,
      roles: value.roles?.length ? value.roles : [],
      ativo: !!value.ativo,
    };

    const req$ = this.editingId
      ? this.svc.update(this.editingId, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => {
        this.notify.success('Usuário salvo com sucesso!');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao salvar.';
        this.notify.error(msg);
      }
    });
  }
}
