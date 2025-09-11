import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ClienteSummary } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  styles: [`
  /* ===== Botões de ação sempre visíveis ===== */
  .actions {
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .actions .btn { flex: 0 0 auto; }

  /* XS (<576px): botões empilhados, largura total, todos iguais */
  @media (max-width: 575.98px) {
    .actions {
      flex-direction: column;
      align-items: stretch;   /* força ocupar a largura da coluna */
      justify-content: flex-start;
    }
    .actions .btn {
      width: 100%;
      flex: 1 1 100%;
    }
  }

  /* SM (576–767px): garantir que APAREÇAM e fiquem lado a lado (quebram se faltar espaço) */
  @media (min-width: 576px) and (max-width: 767.98px) {
    .actions {
      flex-direction: row;
      justify-content: flex-end;
      flex-wrap: wrap;        /* essencial para não sumir/estourar */
    }
    .actions .btn {
      flex: 1 1 48%;          /* duas por linha quando couber */
      min-width: 110px;       /* evita encolher demais */
    }
  }

  /* MD+ (>=768px): lado a lado sem empilhar */
  @media (min-width: 768px) {
    .actions .btn { flex: 0 0 auto; }
  }

  /* Larguras mínimas suaves para estabilidade (sem word-break) */
  th.col-nome,     td.col-nome      { min-width: 160px; }
  th.col-email,    td.col-email     { min-width: 200px; }
  th.col-telefone, td.col-telefone  { min-width: 120px; }
  th.col-mods,     td.col-mods      { min-width: 90px;  text-align: center; }

  /* ===== Visibilidade por breakpoint =====
     xs  (<576): Nome + Ações (+ badge modalidades no Nome)
     sm  (576–767): Nome, Modalidades, Ações
     md  (768–991): Nome, Modalidades, Ações (esconde Email/Telefone/Endereços)
     lg  (992–1199): Nome, Email, Telefone, Modalidades, Ações (Endereços oculto)
     xl+ (>=1200): tudo visível
  */

  /* xs: esconder todas menos nome e ações */
  @media (max-width: 575.98px) {
    .col-email, .col-telefone, .col-endereco, .col-mods { display: none; }
    .badge-inline { display: inline-block; margin-left: .5rem; vertical-align: middle; }
  }

  /* sm: mostra modalidades; esconde email/telefone/endereços */
  @media (min-width: 576px) and (max-width: 767.98px) {
    .col-email, .col-telefone, .col-endereco { display: none; }
    .col-mods { display: table-cell; }
    .badge-inline { display: none; }
  }

  /* md: caber sem scroll → esconde email/telefone/endereços */
  @media (min-width: 768px) and (max-width: 991.98px) {
    .col-email, .col-telefone, .col-endereco { display: none; }
    .col-mods { display: table-cell; }
    .badge-inline { display: none; }
  }

  /* lg: mostra email/telefone; esconde endereços */
  @media (min-width: 992px) and (max-width: 1199.98px) {
    .col-endereco { display: none; }
    .badge-inline { display: none; }
  }
  /* Corrige: em telas >=992px, todos os botões de ação devem ficar lado a lado */
  @media (min-width: 992px) {
    .actions {
      flex-direction: row !important;
      align-items: center !important;
      flex-wrap: nowrap !important;
    }
    .actions .btn {
      width: auto !important;
      flex: 0 0 auto !important;
      margin-bottom: 0 !important;
    }
  }
`],
  template: `
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h4 class="m-0">Clientes</h4>
      <a [routerLink]="['/clientes','novo']" class="btn btn-primary">Novo cliente</a>
    </div>

    <!-- Responsivo: só habilita scroll horizontal abaixo de 1200px -->
    <div class="table-responsive-xl">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col" class="col-nome">Nome</th>
            <th scope="col" class="col-email">Email</th>
            <th scope="col" class="col-telefone">Telefone</th>
            <th scope="col" class="col-endereco d-none d-xl-table-cell">Endereços (cidades)</th>
            <th scope="col" class="col-mods text-center">Modalidades</th>
            <th scope="col" class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of clientes">
            <td class="col-nome">{{ c.nome }}</td>
            <td class="col-email">{{ c.email }}</td>
            <td class="col-telefone">{{ c.telefone || '-' }}</td>
            <td class="col-endereco d-none d-xl-table-cell">{{ c.enderecosResumo || '-' }}</td>
            <td class="col-mods text-center">
              <span class="badge bg-secondary">{{ c.quantidadeModalidades }}</span>
            </td>
            <td class="text-end">
              <div class="actions">
                <a [routerLink]="['/clientes', c.id, 'card']" class="btn btn-sm btn-outline-primary">Ver</a>

                <a *ngIf="auth.rolesFromToken().includes('ROLE_ADMIN')"
                   [routerLink]="['/clientes', c.id]"
                   class="btn btn-sm btn-outline-secondary">Editar</a>

                <button *ngIf="auth.rolesFromToken().includes('ROLE_ADMIN')"
                        class="btn btn-sm btn-outline-danger"
                        (click)="pedirConfirmacaoExclusao(c)">Excluir</button>
              </div>
            </td>
          </tr>

          <tr *ngIf="clientes.length === 0">
            <td colspan="6" class="text-center text-muted py-4">Nenhum cliente encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-confirm-dialog #confirmDialog
      [title]="'Excluir cliente'"
      [message]="'Tem certeza que deseja excluir este cliente?'"
      [confirmText]="'Excluir'"
      [variant]="'danger'">
    </app-confirm-dialog>
  </div>
  `
})
export class ClientesListComponent {
  clientes: ClienteSummary[] = [];
  clienteSelecionado?: ClienteSummary;

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  constructor(
    private svc: ClienteService,
    private notify: NotificationService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.svc.clientes$.subscribe(list => this.clientes = list);
    this.svc.fetchAll().subscribe();
  }

  async pedirConfirmacaoExclusao(c: ClienteSummary) {
    this.clienteSelecionado = c;
    const confirmed = await this.confirmDialog.open();
    if (confirmed && this.clienteSelecionado) {
      this.svc.delete(this.clienteSelecionado.id).subscribe({
        next: () => this.svc.fetchAll().subscribe(),
        error: () => this.notify.error('Erro ao excluir.')
      });
    }
  }
}
