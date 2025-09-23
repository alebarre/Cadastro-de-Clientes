// src/app/layout/shell.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <!-- Header mobile (visível < 992px): hambúrguer à esquerda, título central, Sair à direita -->
    <header class="shell-mobile-header d-lg-none">
      <div class="mobile-bar">
        <button class="burger" type="button"
                (click)="sidebarOpen = true" aria-label="Abrir menu">
          &#9776;
        </button>

        <div class="brand-title" title="ClientesApp">ClientesApp</div>

        <button class="logout" type="button" (click)="logout()" aria-label="Sair">
          Sair
        </button>
      </div>
    </header>

    <!-- Sidebar fixa (≥992) e off-canvas (<992) -->
    <app-sidebar
      [open]="sidebarOpen"
      (closed)="sidebarOpen = false">
    </app-sidebar>

    <!-- Conteúdo principal -->
    <main class="shell-main">
      <div class="container-fluid py-3">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: [`
    :host {
      --sidebar-width: 240px;
      --mobile-header-h: calc(48px + env(safe-area-inset-top, 0px));
      display: block;
    }

    /* Header mobile fixo e com centralização absoluta do título */
    .shell-mobile-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1050;
      background: #212529;
      color: #fff;
    }
    .shell-mobile-header .mobile-bar {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: .5rem;
      padding: .25rem .75rem;
      padding-top: calc(.25rem + env(safe-area-inset-top, 0px));
      height: var(--mobile-header-h);
      box-sizing: border-box;
    }
    .shell-mobile-header .burger,
    .shell-mobile-header .logout {
      height: 32px;
      min-width: 44px;              /* bom p/ acessibilidade e equilíbrio visual */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,.35);
      border-radius: .375rem;
      background: transparent;
      color: #fff;
      line-height: 1;
      cursor: pointer;
      padding: 0 .5rem;
      user-select: none;
    }

    /* Título centralizado “de verdade” */
    .shell-mobile-header .brand-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 50%;
      transform-origin: center;
      translate: -50% -50%;
      max-width: 60%;
      text-align: center;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none; /* evita clique acidental no título ao tocar nos botões */
    }

    /* Conteúdo principal */
    .shell-main {
      min-height: 100vh;
      background: #f8f9fa;
      margin-left: 0;                       /* <992 não desloca pelo sidebar */
      padding-top: var(--mobile-header-h);  /* reserva espaço do header mobile */
    }

    /* A partir de 992px, sidebar fixa e sem header mobile */
    @media (min-width: 992px) {
      .shell-main {
        margin-left: var(--sidebar-width);
        padding-top: 0;
      }
    }
  `]
})
export class ShellComponent {
  sidebarOpen = false;
  constructor(private auth: AuthService) { }
  logout() { this.auth.logout(); }
}
