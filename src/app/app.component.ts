import { Component, computed, inject } from '@angular/core';
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
        <a class="navbar-brand" [routerLink]="['/']">ClientesApp</a>
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

    <app-toasts-container></app-toasts-container>
  `,
})
export class AppComponent {
  private auth = inject(AuthService);
  get loggedIn() {
    return this.auth.hasValidToken();
  }
  logout() {
    this.auth.logout();
  }
}
