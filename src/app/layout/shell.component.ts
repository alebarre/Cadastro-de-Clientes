// src/app/layout/shell.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <!-- Header mobile (apenas < md): hambúrguer à esquerda, título CENTRALIZADO -->
    <header class="shell-mobile-header d-md-none">
      <div class="mobile-bar">
        <button class="burger" type="button"
                (click)="sidebarOpen = true" aria-label="Abrir menu">
          &#9776;
        </button>

        <div class="brand-title" title="ClientesApp">ClientesApp</div>

        <!-- Espaçador com mesma largura do botão para centralização real -->
        <div class="spacer" aria-hidden="true"></div>
      </div>
    </header>

    <!-- Sidebar fixa (md+) e off-canvas (mobile) -->
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
      /* altura do header mobile (48px) + área segura de notches */
      --mobile-header-h: calc(48px + env(safe-area-inset-top, 0px));
      display: block;
    }

    /* Header mobile FIXO e com grid (botão | título | espaçador) */
    .shell-mobile-header {
      position: fixed;           /* ✅ fica sempre no topo da viewport */
      top: 0;
      left: 0;
      right: 0;
      z-index: 1050;             /* acima do conteúdo e backdrop */
      background: #212529;
      color: #fff;
    }
    .shell-mobile-header .mobile-bar {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: .5rem;
      padding: .25rem .75rem;
      padding-top: calc(.25rem + env(safe-area-inset-top, 0px));
      height: var(--mobile-header-h); /* ✅ altura consistente */
      box-sizing: border-box;
    }
    .shell-mobile-header .burger {
      width: 40px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,.35);
      border-radius: .375rem;
      background: transparent;
      color: #fff;
      line-height: 1;
    }

    .shell-mobile-header .burger { cursor: pointer; }
    .shell-mobile-header .brand-title {
      text-align: center;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Conteúdo principal */
    .shell-main {
      min-height: 100vh;
      background: #f8f9fa;
      margin-left: 0;            /* mobile não desloca pelo sidebar */
      padding-top: var(--mobile-header-h); /* ✅ reserva o espaço do header fixo */
    }

    /* Em telas >= md, sidebar fixa e sem header mobile */
    @media (min-width: 768px) {
      .shell-main {
        margin-left: var(--sidebar-width);
        padding-top: 0;          /* header mobile não aparece em md+ */
      }
    }
  `]
})
export class ShellComponent {
  sidebarOpen = false;
}
