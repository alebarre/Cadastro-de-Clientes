import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService, ClienteSummary } from '../../services/cliente.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  styles: [
    `
      .minw-0 {
        min-width: 0;
      }
      .break-any {
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      /* Range md (768–991): fixar layout e evitar overflow sem esconder header */
      @media (min-width: 768px) and (max-width: 991.98px) {
        table.table {
          table-layout: fixed;
        }
        thead th,
        tbody td {
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }
        /* Distribuição amigável para 3 colunas (Nome, Email, Ações) */
        thead th.th-nome,
        tbody td.td-nome {
          width: 44%;
        }
        thead th.th-email,
        tbody td.td-email {
          width: 36%;
        }
        thead th.th-acoes,
        tbody td.td-acoes {
          width: 20%;
        }
      }

      /* < md: liberar quebras livremente */
      @media (max-width: 767.98px) {
        .col-nowrap {
          white-space: normal !important;
        }
      }
    `,
  ],
  template: `
    <div
      class="d-flex flex-column flex-sm-row justify-content-between gap-2 align-items-sm-center mb-3"
    >
      <h3 class="mb-0">Clientes</h3>
      <a
        [routerLink]="['/clientes/novo']"
        class="btn btn-primary align-self-start align-self-sm-auto"
        >Novo</a
      >
    </div>

    <div *ngIf="!clientes.length" class="alert alert-info">
      Nenhum cliente cadastrado.
    </div>

    <div *ngIf="clientes.length" class="table-responsive">
      <table class="table table-striped table-bordered align-middle w-100">
        <thead class="table-light">
          <tr>
            <th class="th-nome">Nome</th>
            <th class="th-email d-none d-md-table-cell">Email</th>
            <th class="d-none d-lg-table-cell">Telefone</th>
            <th class="d-none d-lg-table-cell">Cidades</th>
            <th class="th-acoes col-nowrap">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let c of clientes">
            <td class="td-nome break-any text-truncate">{{ c.nome }}</td>

            <!-- md+: Email visível -->
            <td class="td-email d-none d-md-table-cell break-any text-truncate">
              {{ c.email }}
            </td>

            <!-- lg+: Telefone e Cidades -->
            <td class="d-none d-lg-table-cell break-any">
              {{ c.telefone || '-' }}
            </td>
            <td class="d-none d-lg-table-cell break-any text-truncate">
              {{ formatCidades(c.cidades) || '-' }}
            </td>

            <td class="td-acoes minw-0">
              <!-- até lg: botões podem quebrar; em lg+ ficam lado a lado -->
              <div class="d-flex flex-wrap flex-lg-nowrap gap-1">
                <a
                  [routerLink]="['/clientes', c.id, 'card']"
                  class="btn btn-sm btn-outline-primary flex-fill flex-lg-grow-0 w-100 w-lg-auto"
                >
                  Ver
                </a>
                <a
                  [routerLink]="['/clientes', c.id]"
                  class="btn btn-sm btn-outline-secondary flex-fill flex-lg-grow-0 w-100 w-lg-auto"
                >
                  Editar
                </a>
                <button
                  class="btn btn-sm btn-outline-danger flex-fill flex-lg-grow-0 w-100 w-lg-auto"
                  (click)="pedirConfirmacaoExclusao(c)"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-confirm-dialog
      [title]="'Confirmar Exclusão'"
      [confirmText]="'Excluir'"
      [cancelText]="'Cancelar'"
      [variant]="'danger'"
      (onConfirm)="excluirConfirmado()"
      (onCancel)="cancelarExclusao()"
    >
      <p class="mb-0">
        Tem certeza que deseja excluir
        <strong>{{ clienteSelecionado?.nome || 'este cliente' }}</strong
        >?
      </p>
      <small class="text-muted">Esta ação não pode ser desfeita.</small>
    </app-confirm-dialog>
  `,
})
export class ClientesListComponent {
  clientes: ClienteSummary[] = [];
  clienteSelecionado?: ClienteSummary;

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  constructor(
    private svc: ClienteService,
    private notify: NotificationService
  ) {
    this.svc.clientes$.subscribe((list) => (this.clientes = list));
    this.svc.fetchAll().subscribe();
  }

  formatCidades(cidades: string[] | undefined): string {
    if (!cidades || !cidades.length) return '';
    const unicas: string[] = [];
    for (const cid of cidades.map((s) => s.trim()).filter(Boolean)) {
      if (!unicas.includes(cid)) unicas.push(cid);
      if (unicas.length === 2) break;
    }
    return unicas.join(' | ');
  }

  pedirConfirmacaoExclusao(cliente: ClienteSummary) {
    this.clienteSelecionado = cliente;
    this.confirmDialog.open();
  }

  excluirConfirmado() {
    if (!this.clienteSelecionado) return;
    this.svc.remove(this.clienteSelecionado.id).subscribe({
      next: () => {
        this.notify.success('Cliente excluído com sucesso.');
        this.clienteSelecionado = undefined;
      },
      error: () => this.notify.error('Erro ao excluir.'),
    });
  }

  cancelarExclusao() {
    this.clienteSelecionado = undefined;
  }
}
