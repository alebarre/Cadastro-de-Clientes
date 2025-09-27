import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  styles: [
    `
    /* ===== Base ===== */
    .actions {
      display: flex;
      gap: .5rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .actions .btn { flex: 0 0 auto; }

    /* larguras mínimas suaves */
    th.col-nome,     td.col-nome     { min-width: 160px; }
    th.col-email,    td.col-email    { min-width: 200px; }
    th.col-telefone, td.col-telefone { min-width: 120px; }
    th.col-mods,     td.col-mods     { min-width: 90px; text-align: center; }

    /* ===== XS (<576): esconder colunas pesadas, botões empilhados ===== */
    @media (max-width: 575.98px) {
      .col-email, .col-telefone, .col-endereco, .col-mods { display: none !important; }
      .actions { flex-direction: column; align-items: stretch; }
      .actions .btn { width: 100%; flex: 1 1 100%; }
    }

    /* ===== SM (576–767): mostrar Modalidades; 2 botões por linha ===== */
    @media (min-width: 576px) and (max-width: 767.98px) {
      .col-email, .col-telefone, .col-endereco { display: none !important; }
      .col-mods { display: table-cell !important; }
      .actions { flex-direction: row; flex-wrap: wrap; }
      .actions .btn { flex: 1 1 48%; min-width: 110px; }
    }

    /* ===== MD (768–991): Nome + Modalidades + Ações; sem scroll; botões 100% ===== */
    @media (min-width: 768px) and (max-width: 991.98px) {
      .col-mods, .col-telefone, .col-endereco { display: none !important; }
      .col-email { display: table-cell !important; }

      /* botões empilhados ocupando a largura da célula */
      td.text-end { text-align: left; }         /* evita “puxar” o grid pra direita */
      .actions { display: grid; grid-template-columns: 1fr; gap: .5rem; width: 100%; }
      .actions .btn, .actions button { display: block; width: 100%; min-width: 0; }

      /* estabilidade de largura + truncamento */
      .table { table-layout: fixed; }
      td.col-nome, td.col-email { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }

    /* 992–1199: esconder colunas pesadas para caber melhor */
    @media (min-width: 992px) and (max-width: 1199.98px) {
      .col-endereco { display: none !important; }
      .col-mods { display: none !important; }
      .col-telefone { display: none !important; }
    }

    /* ≥992: ações compactas lado a lado; coluna auto */
    @media (min-width: 992px) {
      th.text-end, td.text-end { width: auto !important; white-space: nowrap; text-align: right; }
      .actions { display: inline-flex !important; gap: .5rem; flex-wrap: nowrap !important; align-items: center; width: auto; }
      .actions .btn, .actions button { width: auto !important; flex: 0 0 auto !important; min-width: 0; }
      .table { table-layout: auto !important; }
      td.col-nome, td.col-email { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }
 `
  ],
  template: `
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h4 class="m-0">Clientes</h4>
      <a [routerLink]="['/app','clientes','novo']" class="btn btn-primary">Novo cliente</a>
    </div>

    <!-- Responsivo: só habilita scroll horizontal abaixo de 1200px -->
    <div class="table-responsive-xl">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col" class="col-nome">Nome</th>
            <th scope="col" class="col-status">Status</th>
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
            <td class="col-status">
              <span
                class="badge"
                [ngClass]="c.enabled ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'"
              >
                {{ c.enabled ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="col-email">{{ c.email }}</td>
            <td class="col-telefone">{{ c.telefone || '-' }}</td>
            <td class="col-endereco d-none d-xl-table-cell">{{ c.enderecosResumo || '-' }}</td>
            <td class="col-mods text-center">
              <span class="badge bg-secondary">{{ c.quantidadeModalidades }}</span>
            </td>
            <td class="text-end">
              <div class="actions">
                <a [routerLink]="['/app','clientes', c.id, 'card']" class="btn btn-sm btn-outline-primary">Ver</a>

                <a *ngIf="auth.rolesFromToken().includes('ROLE_ADMIN')"
                   [routerLink]="['/app','clientes', c.id]"
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
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
      <div class="text-muted small">
        Mostrando {{ page*size + 1 }}–{{ Math.min((page+1)*size, total) }} de {{ total }}
      </div>

      <div class="d-flex align-items-center gap-2">
        <select class="form-select form-select-sm" style="width:auto"
                [ngModel]="size" (ngModelChange)="changeSize($event)">
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
          <option [ngValue]="50">50</option>
        </select>

        <nav aria-label="Clientes paginação">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" [class.disabled]="page===0">
              <button class="page-link" (click)="prev()">«</button>
            </li>
            <li class="page-item" *ngFor="let i of [].constructor(totalPages); let idx = index"
                [class.active]="idx===page">
              <button class="page-link" (click)="go(idx)">{{ idx+1 }}</button>
            </li>
            <li class="page-item" [class.disabled]="page+1>=totalPages">
              <button class="page-link" (click)="next()">»</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
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
  Math = Math;
  clienteSelecionado?: ClienteSummary;
  clientes: ClienteSummary[] = [];
  total = 0;
  totalPages = 0;
  page = 0;
  size = 10;
  q = '';

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  constructor(
    private svc: ClienteService,
    private notify: NotificationService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.svc.clientes$.subscribe(list => this.clientes = list);
    this.svc.fetchAll().subscribe();
    this.svc.page$.subscribe(p => {
      this.clientes = p.content;
      this.page = p.number;
      this.size = p.size;
      this.total = p.totalElements;
      this.totalPages = p.totalPages;
    });
    this.load();
  }

  load() {
    this.svc.fetchPage({ page: this.page, size: this.size, q: this.q, sort: 'nome', dir: 'asc' }).subscribe();
  }

  go(i: number) {
    if (i < 0 || i >= this.totalPages) return;
    this.page = i; this.load();
  }
  prev() {
    if (this.page > 0) {
      this.page--; this.load();
    }
  }

  next() {
    if (this.page + 1 < this.totalPages) {
      this.page++; this.load();
    }
  }

  changeSize(s: number) {
    this.size = s;
    this.page = 0;
    this.load();
  }

  search(q: string) {
    this.q = q.trim(); this.page = 0; this.load();
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
