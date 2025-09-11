import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Cliente, Endereco } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { ViaCepService } from '../../services/viacep.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';
import { MaskDirective } from '../../services/mask.directives';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent,
    MaskDirective,
  ],
  template: `
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-3">
          {{ editingId ? 'Editar Cliente' : 'Novo Cliente' }}
        </h4>

        <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label">Nome</label>
              <input
                class="form-control"
                formControlName="nome"
                [ngClass]="{ 'is-invalid': isInvalid('nome') }"
              />
              <div class="invalid-feedback">
                {{
                  serverError('nome') ||
                    'Informe um nome com ao menos 3 caracteres.'
                }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label">Email</label>
              <input
                class="form-control"
                type="email"
                formControlName="email"
                autocomplete="email"
                [ngClass]="{ 'is-invalid': isInvalid('email') }"
              />
              <div class="invalid-feedback">
                {{ serverError('email') || 'Email inválido.' }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label">Telefone</label>
              <input
                class="form-control"
                formControlName="telefone"
                appMask="phoneBr"
                [maskSaveRaw]="true"
                placeholder="(11) 91234-5678"
                [ngClass]="{ 'is-invalid': isInvalid('telefone') }"
              />
              <div class="invalid-feedback">
                {{
                  serverError('telefone') ||
                    'Telefone deve ter 10 ou 11 dígitos.'
                }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label class="form-label">CPF (opcional)</label>
              <input
                class="form-control"
                formControlName="cpf"
                appMask="cpf"
                [maskSaveRaw]="true"
                placeholder="000.000.000-00"
                [ngClass]="{ 'is-invalid': isInvalid('cpf') }"
              />
              <div class="invalid-feedback">
                {{ serverError('cpf') || 'CPF deve ter 11 dígitos.' }}
              </div>
            </div>
          </div>

          <hr class="my-4" />

          <div
            class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-2 gap-2"
          >
            <h5 class="mb-0">Endereços</h5>
            <button
              *ngIf="enderecos.length < 2"
              class="btn btn-sm btn-outline-primary align-self-start align-self-sm-auto"
              type="button"
              (click)="addEndereco()"
            >
              + Adicionar endereço
            </button>
            <span *ngIf="enderecos.length >= 2" class="text-muted small"
              >Máximo de 2 endereços.</span
            >
          </div>

          <div formArrayName="enderecos">
            <div
              class="card mb-3"
              *ngFor="let e of enderecos.controls; let i = index"
              [formGroupName]="i"
            >
              <div class="card-body">
                <div class="row g-3">
                  <!-- 1) CEP -->
                  <div class="col-12 col-sm-6 col-md-3">
                    <label
                      class="form-label d-flex align-items-center justify-content-between"
                    >
                      <span>CEP</span>
                      <span
                        *ngIf="loadingCep[i]"
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    </label>
                    <input
                      class="form-control"
                      formControlName="cep"
                      appMask="cep"
                      [maskSaveRaw]="true"
                      (blur)="onCepBlur(i)"
                      (keyup.enter)="onCepBlur(i)"
                      autocomplete="postal-code"
                      [ngClass]="{ 'is-invalid': isInvalidEndereco(i, 'cep') }"
                      placeholder="00000-000"
                    />
                    <div class="invalid-feedback">
                      {{
                        serverErrorEndereco(i, 'cep') ||
                          'CEP inválido (8 dígitos).'
                      }}
                    </div>
                    <div class="form-text">
                      Preencha o CEP para autocompletar o endereço.
                    </div>
                  </div>

                  <!-- 2) Logradouro -->
                  <div class="col-12 col-md-6">
                    <label class="form-label">Logradouro</label>
                    <input
                      class="form-control"
                      formControlName="logradouro"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'logradouro')
                      }"
                    />
                    <div class="invalid-feedback">
                      {{
                        serverErrorEndereco(i, 'logradouro') || 'Obrigatório.'
                      }}
                    </div>
                  </div>

                  <!-- 3) Número (somente números) -->
                  <div class="col-6 col-md-3">
                    <label class="form-label">Número</label>
                    <input
                      class="form-control"
                      type="number"
                      inputmode="numeric"
                      formControlName="numero"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'numero')
                      }"
                      oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    />
                    <div class="invalid-feedback">
                      {{
                        serverErrorEndereco(i, 'numero') ||
                          'Somente números são permitidos.'
                      }}
                    </div>
                  </div>

                  <!-- 4) Complemento -->
                  <div class="col-12 col-md-4">
                    <label class="form-label">Complemento</label>
                    <input class="form-control" formControlName="complemento" />
                  </div>

                  <!-- 5) Bairro -->
                  <div class="col-12 col-md-4">
                    <label class="form-label">Bairro</label>
                    <input
                      class="form-control"
                      formControlName="bairro"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'bairro')
                      }"
                    />
                    <div class="invalid-feedback">
                      {{ serverErrorEndereco(i, 'bairro') || 'Obrigatório.' }}
                    </div>
                  </div>

                  <!-- 6) Cidade -->
                  <div class="col-8 col-md-3">
                    <label class="form-label">Cidade</label>
                    <input
                      class="form-control"
                      formControlName="cidade"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'cidade')
                      }"
                    />
                    <div class="invalid-feedback">
                      {{ serverErrorEndereco(i, 'cidade') || 'Obrigatório.' }}
                    </div>
                  </div>

                  <!-- 7) UF -->
                  <div class="col-4 col-md-1">
                    <label class="form-label">UF</label>
                    <input
                      class="form-control text-uppercase"
                      maxlength="2"
                      formControlName="uf"
                      autocapitalize="characters"
                      [ngClass]="{ 'is-invalid': isInvalidEndereco(i, 'uf') }"
                    />
                    <div class="invalid-feedback">
                      {{ serverErrorEndereco(i, 'uf') || 'UF (2 letras).' }}
                    </div>
                  </div>
                </div>

                <div
                  class="d-flex flex-wrap flex-sm-nowrap justify-content-end gap-2 mt-3"
                >
                  <button
                    class="btn btn-sm btn-outline-danger"
                    type="button"
                    (click)="pedirConfirmacaoRemoverEndereco(i)"
                    *ngIf="enderecos.length > 1"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-3 d-flex flex-wrap flex-sm-nowrap gap-2">
            <button
              class="btn btn-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
              type="submit"
            >
              Salvar
            </button>
            <a
              class="btn btn-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
              [routerLink]="['/clientes']"
              >Cancelar</a
            >
          </div>
        </form>
      </div>
    </div>

    <!-- Modal confirmação (remover endereço) -->
    <app-confirm-dialog
      [title]="'Remover endereço'"
      [confirmText]="'Remover'"
      [variant]="'danger'"
      (onConfirm)="removerEnderecoConfirmado()"
      (onCancel)="cancelarRemocaoEndereco()"
      #confirmRemoveEndereco
    >
      <p class="mb-0">
        Tem certeza que deseja remover o endereço
        <strong>#{{ indexEnderecoParaRemover! + 1 }}</strong
        >?
      </p>
      <small class="text-muted">Esta ação não pode ser desfeita.</small>
    </app-confirm-dialog>
  `,
})
export class ClienteFormComponent implements OnInit {
  form!: FormGroup;
  editingId: number | null = null;

  loadingCep: boolean[] = [];
  indexEnderecoParaRemover: number | null = null;

  private subs: Subscription[] = [];

  @ViewChild('confirmRemoveEndereco')
  confirmDialogEndereco!: ConfirmDialogComponent;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: ClienteService,
    private notify: NotificationService,
    private viacep: ViaCepService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    // limpa erros do servidor ao editar QUALQUER campo
    this.subs.push(
      this.form.valueChanges.subscribe(() => this.clearAllServerErrors())
    );

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editingId = id;

      this.svc.getById(id).subscribe({
        next: (c) => {
          this.form.patchValue({
            nome: c.nome,
            email: c.email,
            telefone: c.telefone ?? '',
          });
          (c.enderecos || []).forEach((e) =>
            this.enderecos.push(this.buildEnderecoGroup(e))
          );
          if (this.enderecos.length === 0) this.addEndereco();
          this.loadingCep = new Array(this.enderecos.length).fill(false);
        },
        error: () => {
          this.notify.error('Cliente não encontrado.');
          this.router.navigate(['/clientes']);
        },
      });
    } else {
      this.addEndereco();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ====== BUILDERS ======
  buildForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.pattern(/^\d{10,11}$/)]],
      cpf: ['', [Validators.pattern(/^\d{11}$/)]],
      enderecos: this.fb.array([]),
    });
  }

  buildEnderecoGroup(e?: Partial<Endereco>) {
    return this.fb.group({
      id: [e?.id ?? null],
      logradouro: [e?.logradouro ?? '', Validators.required],
      numero: [
        e?.numero ?? '',
        [Validators.required, Validators.pattern(/^[0-9]+$/)],
      ],
      complemento: [e?.complemento ?? ''],
      bairro: [e?.bairro ?? '', Validators.required],
      cidade: [e?.cidade ?? '', Validators.required],
      uf: [
        e?.uf ?? '',
        [Validators.required, Validators.maxLength(2), Validators.minLength(2)],
      ],
      cep: [e?.cep ?? '', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    });
  }

  // ====== GETTERS ======
  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }

  // ====== UI HELPERS ======
  isInvalid(path: string): boolean {
    const c = this.resolveControl(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  isInvalidEndereco(index: number, controlName: keyof Endereco): boolean {
    return this.isInvalid(`enderecos[${index}].${controlName as string}`);
  }

  serverError(path: string): string | null {
    const c = this.resolveControl(path);
    return (c?.errors as any)?.server ?? null;
  }

  serverErrorEndereco(
    index: number,
    controlName: keyof Endereco
  ): string | null {
    return this.serverError(`enderecos[${index}].${controlName as string}`);
  }

  // ====== CEP / ViaCEP ======
  private patchEnderecoFromCep(
    index: number,
    data: {
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      complemento?: string;
    }
  ) {
    const g = this.enderecos.at(index) as FormGroup;
    const setIfEmpty = (ctrl: string, value?: string) => {
      const c = g.get(ctrl);
      if (c && (!c.value || String(c.value).trim() === '') && value) {
        c.patchValue(value);
        c.markAsDirty();
      }
    };
    setIfEmpty('logradouro', data.logradouro);
    setIfEmpty('bairro', data.bairro);
    setIfEmpty('cidade', data.localidade);
    setIfEmpty('uf', (data.uf || '').toUpperCase());
    setIfEmpty('complemento', data.complemento);
  }

  onCepBlur(index: number) {
    const g = this.enderecos.at(index) as FormGroup;
    const cepCtrl = g.get('cep');
    if (!cepCtrl) return;

    const digits = String(cepCtrl.value || '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(digits)) return;

    this.loadingCep[index] = true;
    this.viacep.find(digits).subscribe({
      next: (res) => {
        this.loadingCep[index] = false;
        if (!res) {
          this.notify.warn('CEP não encontrado.');
          return;
        }
        this.patchEnderecoFromCep(index, res);
      },
      error: () => {
        this.loadingCep[index] = false;
        this.notify.error('Falha ao consultar o CEP.');
      },
    });
  }

  // ====== AÇÕES ======
  addEndereco() {
    if (this.enderecos.length >= 2) {
      this.notify.warn('Só é permitido cadastrar até 2 endereços.');
      return;
    }
    this.enderecos.push(this.buildEnderecoGroup());
    this.loadingCep[this.enderecos.length - 1] = false;

    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        'input[formcontrolname="cep"]'
      );
      inputs[inputs.length - 1]?.focus();
    });
  }

  pedirConfirmacaoRemoverEndereco(index: number) {
    this.indexEnderecoParaRemover = index;
    this.confirmDialogEndereco.open();
  }

  removerEnderecoConfirmado() {
    if (this.indexEnderecoParaRemover === null) return;
    this.enderecos.removeAt(this.indexEnderecoParaRemover);
    this.indexEnderecoParaRemover = null;
    this.notify.success('Endereço removido com sucesso.');
  }

  cancelarRemocaoEndereco() {
    this.indexEnderecoParaRemover = null;
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error(
        'Existem campos obrigatórios não preenchidos ou inválidos.'
      );
      return;
    }

    const payload: Cliente = {
      id: this.editingId ?? undefined,
      ...this.form.value,
    };

    const req$ = this.editingId
      ? this.svc.update(this.editingId, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => {
        this.notify.success('Cliente salvo com sucesso!');
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        // Esperado do back:
        // {
        //   status: 400,
        //   error: "Validation Error",
        //   message: "Campos inválidos",
        //   timestamp: "...",
        //   fieldErrors: { "telefone": "...", "enderecos[0].cidade": "..." }
        // }
        const fe = err?.error?.fieldErrors;
        const msg = err?.error?.message || 'Ocorreu um erro ao salvar.';
        if (fe && typeof fe === 'object') {
          this.applyServerErrors(fe);
        }
        this.notify.error(msg);
      },
    });
  }

  // ====== SERVER-ERROR HELPERS ======
  /** Define erro 'server' nos controles conforme o mapa de fieldErrors. Ex.: { 'telefone': 'msg', 'enderecos[0].cidade': 'msg' } */
  private applyServerErrors(fieldErrors: Record<string, string>) {
    Object.entries(fieldErrors).forEach(([path, message]) => {
      const control = this.resolveControl(path);
      if (control) {
        const existing = control.errors || {};
        control.setErrors({ ...existing, server: message || 'Campo inválido' });
        control.markAsTouched();
      }
    });
  }

  /** Remove apenas os erros 'server' de todos os controles do form */
  private clearAllServerErrors() {
    const clear = (ctrl: AbstractControl | null | undefined): void => {
      if (!ctrl) return;

      // limpa a chave 'server' se existir, mantendo demais validações
      const errs = ctrl.errors;
      if (errs && Object.prototype.hasOwnProperty.call(errs, 'server')) {
        const { server, ...rest } = errs as Record<string, any>;
        ctrl.setErrors(Object.keys(rest).length ? rest : null);
      }

      // desce recursivamente
      if (ctrl instanceof FormGroup) {
        Object.values(ctrl.controls).forEach((child) => clear(child));
      } else if (ctrl instanceof FormArray) {
        ctrl.controls.forEach((child) => clear(child));
      }
      // FormControl: nada a fazer
    };

    clear(this.form);
  }

  /** Resolve caminho estilo 'email' ou 'enderecos[0].cidade' para o AbstractControl */
  private resolveControl(path: string): AbstractControl | null {
    // Suporta notação com colchetes e pontos.
    // Ex.: 'enderecos[1].cep' -> ['enderecos', 1, 'cep']
    const tokens: (string | number)[] = [];
    const regex = /([^[.\]]+)|\[(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(path)) !== null) {
      if (m[1] !== undefined) tokens.push(m[1]);
      else if (m[2] !== undefined) tokens.push(Number(m[2]));
    }

    let ctrl: AbstractControl | null = this.form;
    for (const tk of tokens) {
      if (!ctrl) return null;
      if (typeof tk === 'number') {
        // FormArray index
        const fa = ctrl as unknown as {
          at: (i: number) => AbstractControl | null;
        };
        ctrl = fa?.at ? fa.at(tk) : null;
      } else {
        // FormGroup control
        ctrl = (ctrl as any).get ? (ctrl as any).get(tk) : null;
      }
    }
    return ctrl;
  }
}
