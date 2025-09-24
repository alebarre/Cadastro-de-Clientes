import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioSummary } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cobrancas',
  standalone: true,
  imports: [CommonModule],
  styles: [``],
  template: `
  <div class="container-xxl py-3">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h4 class="m-0">Cobranças</h4>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped align-middle">

          </table>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ClientesCobrancasComponent {
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
