import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Backdrop: só no mobile e quando aberto -->
    <div
      class="sidebar-backdrop d-md-none"
      *ngIf="open"
      (click)="close()"
      aria-hidden="true">
    </div>

    <!-- Painel -->
    <nav class="sidebar-panel" [class.open]="open" role="navigation" aria-label="Menu lateral">
  <!-- Top bar só no mobile: título + botão X -->
  <div class="panel-top d-md-none">
    <div class="panel-title">ClientesApp</div>
    <button type="button" class="panel-close" (click)="close()" aria-label="Fechar menu">×</button>
  </div>

  <!-- Brand no desktop -->
  <div class="sidebar-brand d-none d-md-block">ClientesApp</div>

  <ul class="menu">
    <li>
      <a routerLink="/app/clientes" routerLinkActive="active">Clientes</a>
    </li>
    <li>
      <a routerLink="/app/relatorios" routerLinkActive="active">Relatórios</a>
    </li>
    <li *ngIf="isAdmin">
      <a routerLink="/app/usuarios" routerLinkActive="active">Usuários</a>
    </li>
    <li *ngIf="isAdmin">
      <a routerLink="/app/cobrancas" routerLinkActive="active">Cobranças</a>
    </li>
  </ul>
</nav>

  `,
  styles: [
    `:host {
  /* Largura e camadas (header do Shell = 1050) */
  --sidebar-width: 240px;
  --z-header:   1050;
  --z-backdrop: 1060;
  --z-panel:    1070;
  --z-topbar:   1075;

  display: contents; /* não cria wrapper extra */
  }

  /* Backdrop (mobile) */
  .sidebar-backdrop{
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    z-index: var(--z-backdrop);
  }

  /* Painel */
  .sidebar-panel{
    position: fixed;
    top: 0; bottom: 0; left: 0;
    width: var(--sidebar-width);
    max-width: 85vw;
    background: #111;
    color: #fff;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    /* Off-canvas no mobile */
    transform: translateX(-100%);
    transition: transform .25s ease;
    z-index: var(--z-panel);

    /* sem padding-top; a topbar cuida disso no mobile */
    padding: 0 .5rem .75rem .5rem;
    box-sizing: border-box;
  }
  .sidebar-panel.open{ transform: translateX(0); }

  /* Top bar (mobile): título + botão X, evita overlap com a lista */
  .panel-top{
    position: sticky;
    top: 0;
    z-index: var(--z-topbar);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem .25rem;
    background: #111;
    border-bottom: 1px solid rgba(255,255,255,.12);
    min-height: 44px;
  }
  .panel-title{
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 0 .25rem;
  }
  .panel-close{
    background: transparent;
    border: 0;
    color: #fff;
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: .375rem;
  }
  .panel-close:focus-visible{
    outline: 2px solid #6ea8fe;
    outline-offset: 2px;
  }

  /* Brand (desktop) */
  .sidebar-brand{
    font-weight: 600;
    font-size: 1rem;
    margin: 1rem .25rem .75rem;
    color: #adb5bd;
  }

  /* Menu */
  .menu{
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: .25rem;
  }
  .menu a{
    display: block;
    padding: .5rem .75rem;
    border-radius: .5rem;
    color: #e9ecef;
    text-decoration: none;
  }
  .menu a:hover,
  .menu a.active{
    background: #1f2937;
    color: #fff;
  }
  .menu a:focus-visible{
    outline: 2px solid #6ea8fe;
    outline-offset: 2px;
  }

  /* Desktop (>= md): painel fixo, sem backdrop, sem topbar/X */
  @media (min-width: 768px){
    .sidebar-backdrop{ display: none !important; }
    .sidebar-panel{
      transform: none !important;   /* sempre visível */
      max-width: none;
      width: var(--sidebar-width);
      z-index: 1040;                /* abaixo do header desktop, se houver */
      padding-top: 1rem;            /* sem topbar no desktop */
    }
    .panel-top{ display: none !important; }
  }

  `]
})
export class SidebarComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  constructor(public auth: AuthService) { }

  get isAdmin(): boolean {
    return this.auth.rolesFromToken().includes('ROLE_ADMIN');
  }

  close() {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(ev: KeyboardEvent) {
    if (this.open) {
      ev.preventDefault();
      this.close();
    }
  }
}
