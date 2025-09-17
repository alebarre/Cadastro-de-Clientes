import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap, map, catchError } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cliente-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <!-- estado carregando -->
  <div *ngIf="loading" class="alert alert-light border d-flex align-items-center gap-2">
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Carregando...
  </div>

  <!-- não encontrado -->
  <div *ngIf="!loading && (cliente$ | async) === null" class="alert alert-warning">
    Cliente não encontrado.
  </div>

  <!-- use UMA única fonte de cliente para tudo -->
  <ng-container *ngIf="!loading && (cliente$ | async) as cliente">

    <!-- Topo com os botões usando o mesmo 'cliente' -->
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
      <h3 class="mb-0">Ficha do Cliente</h3>
    </div>

    <!-- card -->
    <div class="card shadow-sm">
      <div class="card-header bg-light">
        <strong class="d-block text-truncate" style="font-size: 1.5rem;">{{ cliente.nome }}</strong>

          <h6>Atleta inscrito em {{ cliente.modalidades?.length }} modalidade(s) e com {{ cliente.enderecos.length }} endereço(s) cadastrado(s).</h6>
      </div>

      <div class="card-body">
        <!-- Infos básicas -->
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="small text-muted">Email</div>
            <div class="text-truncate">{{ cliente.email }}</div>
          </div>

          <div class="col-12 col-md-4">
            <div class="small text-muted">Telefone</div>
            <div>{{ cliente.telefone || '-' }}</div>
          </div>

          <div class="col-12 col-md-4">
            <div class="small text-muted">Nascimento</div>
            <div>
              <ng-container *ngIf="cliente.dataNascimento; else dash">
                {{ cliente.dataNascimento | date:'dd/MM/yyyy' }}
                <small class="text-muted"> ({{ idade(cliente.dataNascimento) }} anos)</small>
              </ng-container>
              <ng-template #dash>-</ng-template>
            </div>
          </div>
        </div>

        <hr class="my-4" />

        <!-- Modalidades -->
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h5 class="mb-0">
            Modalidades
            <small class="text-muted">({{ cliente.modalidades?.length || 0 }}/5)</small>
          </h5>
        </div>

        <div *ngIf="!(cliente.modalidades?.length) || cliente.modalidades?.length === 0" class="alert alert-info">
          Nenhuma modalidade vinculada.
        </div>

        <div *ngIf="cliente.modalidades?.length" class="d-flex flex-wrap gap-2">
          <span *ngFor="let m of cliente.modalidades"
                class="badge rounded-pill text-bg-light border"
                [title]="m.descricao || ''">
            <span class="fw-semibold">{{ m.descricao }}</span>
            <span class="text-muted ms-1">— {{ m.valor | currency:'BRL':'symbol':'1.2-2' }}</span>
          </span>
        </div>

        <hr class="my-4" />

        <!-- Endereços -->
        <div *ngIf="!cliente.enderecos?.length" class="alert alert-info">
          Nenhum endereço cadastrado.
        </div>

        <div class="row row-cols-1 row-cols-md-2 g-3" *ngIf="cliente.enderecos?.length">
          <div class="col" *ngFor="let e of cliente.enderecos; let i = index">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <h5 class="card-title mb-2">Endereço em {{ e.pais }}</h5>
                  <span class="badge bg-secondary">{{ e.uf }}</span>
                </div>
                <p class="mb-1">
                  <strong>{{ e.logradouro }}</strong>, {{ e.numero }}
                  <span *ngIf="e.complemento"> - {{ e.complemento }}</span>
                </p>
                <p class="mb-1">{{ e.bairro }} - {{ e.cidade }}/{{ e.uf }}</p>
                <p class="mb-0">CEP: {{ formatCep(e.cep) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- rodapé -->
      <div class="card-footer d-flex flex-wrap flex-sm-nowrap gap-2">
        <a class="btn btn-outline-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
           [routerLink]="['/app','clientes']">
          Voltar
        </a>

        <a class="btn btn-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
           *ngIf="auth.rolesFromToken(auth.getToken() || '').includes('ROLE_ADMIN')"
           [routerLink]="['/app','clientes', cliente.id]">
          Editar
        </a>
      </div>
    </div>
  </ng-container>
`,
})
export class ClienteCardComponent {
  loading = true;
  cliente$: Observable<Cliente | null>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ClienteService,
    private notify: NotificationService,
    public auth: AuthService
  ) {
    this.cliente$ = this.route.paramMap.pipe(
      map((pm) => Number(pm.get('id'))),
      switchMap((id) => {
        if (!id || Number.isNaN(id)) {
          this.notify.error('ID de cliente inválido.');
          this.router.navigate(['/clientes']);
          return of(null);
        }
        return this.svc.getById(id).pipe(
          catchError(() => {
            this.notify.error('Cliente não encontrado.');
            return of(null);
          })
        );
      })
    );

    // controlar spinner simples
    this.cliente$.subscribe(() => (this.loading = false));
  }

  formatCep(cep?: string) {
    const d = (cep || '').replace(/\D/g, '');
    return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep || '-';
  }

  idade(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

}
