import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastsContainerComponent } from './shared/toast-container/toasts-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ToastsContainerComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <div class="ms-auto d-flex gap-2">
          <a
            *ngIf="!loggedIn"
            class="btn btn-outline-light"
            [routerLink]="['/login']"
            >Entrar</a
          >
          <button
            *ngIf="loggedIn"
            class="btn btn-outline-light"
            (click)="logout()"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>

    <div class="container py-4">
      <router-outlet></router-outlet>
    </div>

    <!-- footer fixo -->
      <footer class="footer bg-light border-top py-2 text-muted">
        <div class="container-fluid d-flex justify-content-between small">
          <span>{{ today | date:'dd/MM/yyyy HH:mm' }}</span>
          <span *ngIf="username">
            {{ username }} ({{ roleLabel }})
          </span>
        </div>
      </footer>

    <app-toasts-container></app-toasts-container>
  `,
  styles: [`
    .app-wrapper { min-height: 100vh; }
    .footer {
      font-size: .875rem;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 1030; /* acima do conteúdo */
    }
    main { padding-bottom: 50px; } /* evita que conteúdo esconda o footer */
  `]
})
export class AppComponent implements OnInit {
  today = new Date();
  username = localStorage.getItem('username');
  private auth = inject(AuthService);
  roles = this.auth.rolesFromToken();

  ngOnInit(): void {
    this.auth.loggedIn$.subscribe(loggedIn => {
      this.username = loggedIn ? localStorage.getItem('username') : null;
      this.roles = this.auth.rolesFromToken();
    });
  }

  get loggedIn() {
    return this.auth.hasValidToken();
  }

  get roleLabel(): string {
    return this.roles.includes('ROLE_ADMIN') ? 'Admin' : 'Usuário';
  }

  logout() {
    this.auth.logout();
  }

}
