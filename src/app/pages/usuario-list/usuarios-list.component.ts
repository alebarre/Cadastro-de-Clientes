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
    .actions { display:flex; gap:.5rem; flex-wrap:wrap; justify-content:flex-end; }
    @media (max-width: 575.98px){ .actions{ flex-direction:column; } .actions .btn{ width:100%; } }
    th.col-nome, td.col-nome { min-width: 180px; }
    th.col-email,td.col-email{ min-width: 220px; }
    th.col-roles,td.col-roles{ min-width: 160px; }
  `],
  template: `
    <div class="table-responsive-xl">
      <table class="table table-striped align-middle">
        <caption class="visually-hidden">Lista de usuários</caption>
        <thead>
          <tr>
            <th class="col-nome">Nome</th>
            <th class="col-email">Email</th>
            <th class="col-roles">Papéis</th>
            <th class="text-center">Ativo</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of usuarios">
            <td class="col-nome">{{ u.nome }}</td>
            <td class="col-email">{{ u.email }}</td>
            <td class="col-roles">
              <span class="badge bg-secondary me-1" *ngFor="let r of u.roles">{{ r.replace('ROLE_','') }}</span>
            </td>
            <td class="text-center">
              <span class="badge" [class.bg-success]="u.ativo" [class.bg-secondary]="!u.ativo">
                {{ u.ativo ? 'Sim' : 'Não' }}
              </span>
            </td>
            <td class="text-end">
              <div class="actions">
                <a [routerLink]="['/app','usuarios', u.id]" class="btn btn-sm btn-outline-secondary">Editar</a>
                <button class="btn btn-sm btn-outline-danger" (click)="pedirConfirmacaoExclusao(u)">Excluir</button>
              </div>
            </td>
          </tr>

          <tr *ngIf="usuarios.length === 0">
            <td colspan="5" class="text-center text-muted py-4">Nenhum usuário encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-confirm-dialog #confirmDialog
      [title]="'Excluir usuário'"
      [message]="'Tem certeza que deseja excluir este usuário?'"
      [confirmText]="'Excluir'"
      [variant]="'danger'">
    </app-confirm-dialog>
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
