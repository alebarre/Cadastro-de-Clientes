import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastsContainerComponent } from './shared/toast-container/toasts-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, ToastsContainerComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a
          class="navbar-brand"
          [routerLink]="['/']"
          style="font-size: 2rem; font-weight: bold;"
          >Cadastro de Clientes</a
        >
      </div>
    </nav>

    <div class="container py-4">
      <router-outlet></router-outlet>
    </div>

    <!-- Toats globais -->
    <app-toasts-container></app-toasts-container>
  `,
})
export class AppComponent {}
