import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap, map, catchError } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cliente-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"
    >
      <h3 class="mb-0">Ficha do Cliente</h3>
      <div class="d-flex flex-wrap gap-2">
        <a
          class="btn btn-outline-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
          [routerLink]="['/clientes']"
          >Voltar</a
        >
        <a
          *ngIf="cliente$ | async as cliente"
          class="btn btn-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
          [routerLink]="['/clientes', cliente.id]"
          >Editar</a
        >
      </div>
    </div>

    <!-- estado carregando -->
    <div
      *ngIf="loading"
      class="alert alert-light border d-flex align-items-center gap-2"
    >
      <span
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      Carregando...
    </div>

    <!-- não encontrado -->
    <div
      *ngIf="!loading && (cliente$ | async) === null"
      class="alert alert-warning"
    >
      Cliente não encontrado.
    </div>

    <!-- card -->
    <ng-container *ngIf="!loading && (cliente$ | async) as cliente">
      <div class="card shadow-sm">
        <div class="card-header bg-light">
          <strong class="d-block text-truncate">{{ cliente.nome }}</strong>
        </div>
        <div class="card-body">
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
              <div class="small text-muted">ID</div>
              <div class="font-monospace text-truncate">{{ cliente.id }}</div>
            </div>
          </div>

          <hr class="my-4" />

          <h5 class="mb-3">Endereços ({{ cliente.enderecos.length || 0 }})</h5>

          <div *ngIf="!cliente.enderecos?.length" class="alert alert-info">
            Nenhum endereço cadastrado.
          </div>

          <div
            class="row row-cols-1 row-cols-md-2 g-3"
            *ngIf="cliente.enderecos?.length"
          >
            <div class="col" *ngFor="let e of cliente.enderecos; let i = index">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="card-title mb-2">Endereço #{{ i + 1 }}</h6>
                    <span class="badge bg-secondary">{{ e.uf }}</span>
                  </div>
                  <p class="mb-1">
                    <strong>{{ e.logradouro }}</strong
                    >, {{ e.numero }}
                    <span *ngIf="e.complemento"> - {{ e.complemento }}</span>
                  </p>
                  <p class="mb-1">{{ e.bairro }} - {{ e.cidade }}/{{ e.uf }}</p>
                  <p class="mb-0">CEP: {{ formatCep(e.cep) }}</p>
                </div>
                <div class="card-footer bg-white">
                  <small class="text-muted">
                    ID:
                    <span
                      class="font-monospace text-truncate d-inline-block"
                      style="max-width: 100%;"
                      >{{ e.id }}</span
                    >
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex flex-wrap flex-sm-nowrap gap-2">
          <a
            class="btn btn-outline-secondary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
            [routerLink]="['/clientes']"
            >Voltar</a
          >
          <a
            class="btn btn-primary flex-fill flex-sm-grow-0 w-100 w-sm-auto"
            [routerLink]="['/clientes', cliente.id]"
            >Editar</a
          >
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
    private notify: NotificationService
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
}
