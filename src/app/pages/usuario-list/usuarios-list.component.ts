// src/app/pages/usuario-list/usuarios-list.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioSummary } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  styles: [`
/* ===== Base ===== */
:host { display:block; }
.table { width:100%; }
td, th { vertical-align: middle; }

/* Card/tabela não “sangrar” para fora */
.card .card-body { padding: 0; }
.table { margin-bottom: 0; }

/* Container de botões */
.actions{
  display:flex;
  gap:.5rem;
  justify-content:flex-end;
  flex-wrap:wrap;
}
.actions .btn{ flex:0 0 auto; }

/* Nunca esconder por engano Ações */
thead th.col-actions,
tbody td.col-actions{ display: table-cell !important; }

/* ===== Colunas (ordem): 1 Nome | 2 Username | 3 Email | 4 Telefone | 5 Status | 6 Ações ===== */

/* < 992px: só Nome (1) + Ações (6); botões 100% */
@media (max-width: 991.98px){
  thead tr th:nth-child(2),
  thead tr th:nth-child(3),
  thead tr th:nth-child(4),
  thead tr th:nth-child(5),
  thead tr th:nth-child(n+7),
  tbody tr td:nth-child(2),
  tbody tr td:nth-child(3),
  tbody tr td:nth-child(4),
  tbody tr td:nth-child(5),
  tbody tr td:nth-child(n+7){
    display: none !important;
  }
  /* Botões empilhados ocupando 100% da célula de ações */
  tbody td.col-actions{ text-align:left; }
  .actions{
    display:grid;
    grid-template-columns:1fr;
    gap:.5rem;
    width:100%;
    min-width:0;
  }
  .actions .btn, .actions button{
    display:block;
    width:100%;
    min-width:0;
  }
  /* Estabilidade + truncamento */
  .table{ table-layout: fixed; }
  td:nth-child(1){ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
}

/* 992px–1999px: Nome, Username, Email, Status (+ Ações); botões 100% */
@media (min-width: 992px) and (max-width: 1999.98px){
  thead tr th:nth-child(-n+5),
  tbody tr td:nth-child(-n+5){
    display: table-cell !important;
  }
  thead tr th:nth-child(n+7),
  tbody tr td:nth-child(n+7){
    display: none !important;
  }
  /* Botões empilhados ocupando 100% */
  tbody td.col-actions{ text-align:left; }
  .actions{
    display:grid;
    grid-template-columns:1fr;
    gap:.5rem;
    width:100%;
  }
  .actions .btn, .actions button{
    display:block;
    width:100%;
  }
  /* Estabilidade + truncamento nas colunas textuais longas */
  .table{ table-layout: fixed; }
  td:nth-child(1), td:nth-child(2), td:nth-child(3){
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
}

/* ≥ 2000px: botões lado a lado compactos */
@media (min-width: 2000px){
  tbody td.col-actions{ text-align:right; white-space:nowrap; }
  .actions{
    display:inline-flex !important;
    gap:.5rem;
    flex-wrap:nowrap !important;
    align-items:center;
    width:auto;
  }
  .actions .btn, .actions button{
    width:auto !important;
    flex:0 0 auto !important;
    min-width:0;
  }
  .table{ table-layout: auto !important; }
}
  `],
  template: `
  <div class="container-xxl py-3">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h4 class="m-0">Usuários</h4>
      <a [routerLink]="['/app','usuarios','novo']" class="btn btn-primary">Novo usuário</a>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Username</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
                <th class="text-end col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarios">
                <td>{{ u.nome }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.telefone || '-' }}</td>
                <td class="text-center">
                  <span class="badge me-2" [ngClass]="u.enabled ? 'bg-success' : 'bg-secondary'">
                    {{ u.enabled ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="text-end col-actions">
                  <div class="actions">
                    <a [routerLink]="['/app','usuarios', u.id]" class="btn btn-sm btn-outline-secondary">Editar</a>
                    <button class="btn btn-sm btn-outline-danger" (click)="pedirConfirmacaoExclusao(u)">Excluir</button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="usuarios.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Nenhum usuário encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-confirm-dialog #confirmDialog
      [title]="'Excluir usuário'"
      [message]="'Tem certeza que deseja excluir este usuário?'"
      [confirmText]="'Excluir'"
      [variant]="'danger'">
    </app-confirm-dialog>
  </div>
  `
})
export class UsuariosListComponent {
  usuarios: UsuarioSummary[] = [];
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  constructor(
    private svc: UsuarioService,
    private notify: NotificationService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.svc.usuarios$.subscribe(list => this.usuarios = list);
    this.svc.fetchAll().subscribe();
  }

  async pedirConfirmacaoExclusao(u: UsuarioSummary) {
    const confirmed = await this.confirmDialog.open();
    if (confirmed) {
      this.svc.delete(u.id).subscribe({
        next: () => this.notify.success('Usuário excluído.'),
        error: () => this.notify.error('Erro ao excluir.')
      });
    }
  }
}
