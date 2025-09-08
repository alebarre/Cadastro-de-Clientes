import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService, ClienteSummary } from '../../services/cliente.service'; // << usa ClienteSummary
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
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
      <table class="table table-striped table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th class="d-none d-sm-table-cell">Email</th>
            <th class="d-none d-md-table-cell">Telefone</th>
            <th style="width:1%; white-space:nowrap;">Endereço (Cidade)</th>
            <th style="width:1%; white-space:nowrap;">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of clientes">
            <td class="text-truncate" style="max-width: 220px;">
              {{ c.nome }}
            </td>
            <td
              class="d-none d-sm-table-cell text-truncate"
              style="max-width: 260px;"
            >
              {{ c.email }}
            </td>
            <td class="d-none d-md-table-cell">{{ c.telefone || '-' }}</td>
            <td class="text-truncate" style="max-width: 260px;">
              {{ formatCidades(c.cidades) }}
            </td>
            <td>
              <div class="d-flex flex-wrap flex-sm-nowrap gap-1 w-100">
                <a
                  [routerLink]="['/clientes', c.id, 'card']"
                  class="btn btn-sm btn-outline-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
                  >Ver</a
                >
                <a
                  [routerLink]="['/clientes', c.id]"
                  class="btn btn-sm btn-outline-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
                  >Editar</a
                >
                <button
                  class="btn btn-sm btn-outline-danger flex-fill flex-sm-grow-0 w-100 w-sm-auto"
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
  // << troque Cliente[] por ClienteSummary[]
  clientes: ClienteSummary[] = [];
  clienteSelecionado?: ClienteSummary;

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  constructor(
    private svc: ClienteService,
    private notify: NotificationService
  ) {
    this.svc.clientes$.subscribe((list) => (this.clientes = list));
    this.svc.fetchAll().subscribe(); // garante carregar a lista
  }

  formatCidades(cidades: string[] | undefined): string {
    if (!cidades || !cidades.length) return '-';
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
