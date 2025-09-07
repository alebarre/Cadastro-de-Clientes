import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Cliente, Endereco } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { ViaCepService } from '../../services/viacep.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MaskDirective } from '../../services/mask.directives';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmDialogComponent,
    MaskDirective
  ],
  template: `
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-3">
          {{ editingId ? 'Editar Cliente' : 'Novo Cliente' }}
        </h4>

        <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Nome</label>
              <input
                class="form-control"
                formControlName="nome"
                [ngClass]="{ 'is-invalid': isInvalid('nome') }"
              />
              <div class="invalid-feedback">
                Informe um nome com ao menos 3 caracteres.
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input
                class="form-control"
                type="email"
                formControlName="email"
                [ngClass]="{ 'is-invalid': isInvalid('email') }"
              />
              <div class="invalid-feedback">Email inválido.</div>
            </div>
            <div class="col-md-6">

              <label class="form-label">Telefone</label>
                <input class="form-control"
                  formControlName="telefone"
                  appMask="phoneBr"
                  [maskSaveRaw]="true"
                  placeholder="(11) 91234-5678" />
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
                  <div class="col-md-3">
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
                    <input class="form-control"
                      formControlName="cep"
                      appMask="cep"
                      [maskSaveRaw]="true"
                      (blur)="onCepBlur(i)"
                      (keyup.enter)="onCepBlur(i)"
                      [ngClass]="{'is-invalid': isInvalidEndereco(i, 'cep')}"
                      placeholder="00000-000" />
                    <div class="invalid-feedback">
                      CEP inválido (ex.: 01001-000).
                    </div>
                    <div class="form-text">
                      Preencha o CEP para autocompletar o endereço.
                    </div>
                  </div>

                  <!-- 2) Logradouro -->
                  <div class="col-md-6">
                    <label class="form-label">Logradouro</label>
                    <input
                      class="form-control"
                      formControlName="logradouro"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'logradouro')
                      }"
                    />
                    <div class="invalid-feedback">Obrigatório.</div>
                  </div>

                  <!-- 3) Número (somente números) -->
                  <div class="col-md-3">
                    <label class="form-label">Número</label>
                    <input
                      class="form-control"
                      type="number"
                      formControlName="numero"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'numero')
                      }"
                      oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    />
                    <div class="invalid-feedback">
                      Somente números são permitidos.
                    </div>
                  </div>

                  <!-- 4) Complemento -->
                  <div class="col-md-4">
                    <label class="form-label">Complemento</label>
                    <input class="form-control" formControlName="complemento" />
                  </div>

                  <!-- 5) Bairro -->
                  <div class="col-md-4">
                    <label class="form-label">Bairro</label>
                    <input
                      class="form-control"
                      formControlName="bairro"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'bairro')
                      }"
                    />
                    <div class="invalid-feedback">Obrigatório.</div>
                  </div>

                  <!-- 6) Cidade -->
                  <div class="col-md-3">
                    <label class="form-label">Cidade</label>
                    <input
                      class="form-control"
                      formControlName="cidade"
                      [ngClass]="{
                        'is-invalid': isInvalidEndereco(i, 'cidade')
                      }"
                    />
                    <div class="invalid-feedback">Obrigatório.</div>
                  </div>

                  <!-- 7) UF -->
                  <div class="col-md-1">
                    <label class="form-label">UF</label>
                    <input
                      class="form-control text-uppercase"
                      maxlength="2"
                      formControlName="uf"
                      [ngClass]="{ 'is-invalid': isInvalidEndereco(i, 'uf') }"
                    />
                    <div class="invalid-feedback">UF (2 letras).</div>
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

    <!-- Modal de confirmação para remover ENDEREÇO -->
    <app-confirm-dialog
      [title]="'Remover endereço'"
      [confirmText]="'Remover'"
      [cancelText]="'Cancelar'"
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
  editingId: string | null = null;

  loadingCep: boolean[] = [];
  indexEnderecoParaRemover: number | null = null;

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const c = this.svc.getById(id);
      if (c) {
        this.editingId = id;
        this.form.patchValue({
          nome: c.nome,
          email: c.email,
          telefone: c.telefone ?? '',
        });
        c.enderecos.forEach((e) =>
          this.enderecos.push(this.buildEnderecoGroup(e))
        );
        this.loadingCep = new Array(this.enderecos.length).fill(false);
      }
    } else {
      this.addEndereco();
    }
  }

  // ====== BUILDERS ======
  buildForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      cpf: ['', [Validators.pattern(/^\d{11}$/)]],  // armazena só dígitos (11)
      enderecos: this.fb.array([])
    });
  }

  buildEnderecoGroup(e?: Partial<Endereco>) {
    return this.fb.group({
      id: [e?.id ?? crypto.randomUUID()],
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
      cep: [
        e?.cep ?? '',
        [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)],
      ],
    });
  }

  // ====== GETTERS ======
  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }

  // ====== UI HELPERS ======
  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  isInvalidEndereco(index: number, controlName: keyof Endereco): boolean {
    const group = this.enderecos.at(index) as FormGroup;
    const c = group.get(controlName as string);
    return !!c && c.invalid && (c.touched || c.dirty);
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
      if (c && (!c.value || c.value.trim() === '') && value) {
        c.patchValue(value);
        c.markAsDirty();
      }
    };
    setIfEmpty('logradouro', data.logradouro);
    setIfEmpty('bairro', data.bairro);
    setIfEmpty('cidade', data.localidade);
    setIfEmpty('uf', data.uf);
    setIfEmpty('complemento', data.complemento);
  }

  onCepBlur(index: number) {
    const g = this.enderecos.at(index) as FormGroup;
    const cepCtrl = g.get('cep');
    if (!cepCtrl) return;

    const formatted = this.viacep.format(cepCtrl.value);
    cepCtrl.patchValue(formatted, { emitEvent: false });

    if (cepCtrl.invalid) return;

    this.loadingCep[index] = true;
    this.viacep.find(cepCtrl.value).subscribe(
      (res) => {
        this.loadingCep[index] = false;
        if (!res) {
          this.notify.warn('CEP não encontrado.');
          return;
        }
        this.patchEnderecoFromCep(index, res);
      },
      (_) => {
        this.loadingCep[index] = false;
        this.notify.error('Falha ao consultar o CEP.');
      }
    );
  }

  // ====== AÇÕES ======
  addEndereco() {
    if (this.enderecos.length >= 2) {
      this.notify.warn('Só é permitido cadastrar até 2 endereços.');
      return;
    }
    this.enderecos.push(this.buildEnderecoGroup());
    this.loadingCep[this.enderecos.length - 1] = false;

    // foco automático no CEP do novo endereço
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        'input[formcontrolname="cep"]'
      );
      inputs[inputs.length - 1]?.focus();
    });
  }

  // Confirmação de remoção de endereço
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
      id: this.editingId ?? crypto.randomUUID(),
      ...this.form.value,
    };

    try {
      this.svc.upsert(payload);
      this.notify.success('Cliente salvo com sucesso!');
      this.router.navigate(['/clientes']);
    } catch {
      this.notify.error('Ocorreu um erro ao salvar. Tente novamente.');
    }
  }
}
