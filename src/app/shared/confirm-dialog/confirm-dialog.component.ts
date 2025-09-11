import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .cd-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1060; /* acima de nav/footer (bootstrap usa 1050/1055) */
    }
    .cd-modal {
      background: #fff;
      border-radius: .5rem;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
      transform: translateZ(0);
    }
    .cd-header { padding: .75rem 1rem; border-bottom: 1px solid rgba(0,0,0,.125); }
    .cd-body   { padding: 1rem; }
    .cd-footer { padding: .75rem 1rem; border-top: 1px solid rgba(0,0,0,.125); display:flex; justify-content:flex-end; gap:.5rem; }
    .btn-block { min-width: 100px; }
    @media (max-width: 575.98px) {
      .cd-modal { margin: 0 1rem; max-width: 100%; }
      .cd-footer { flex-wrap: wrap; }
      .cd-footer .btn { flex: 1 1 48%; }
    }
  `],
  template: `
  <div *ngIf="visible" class="cd-backdrop" (click)="backdropClose ? cancel() : null" role="dialog" aria-modal="true">
    <div class="cd-modal" (click)="$event.stopPropagation()">
      <div class="cd-header">
        <h5 class="m-0">{{ effectiveTitle }}</h5>
      </div>

      <div class="cd-body">
        <p class="m-0">{{ effectiveMessage }}</p>
      </div>

      <div class="cd-footer">
        <button type="button" class="btn btn-outline-secondary btn-sm btn-block" (click)="cancel()">
          {{ cancelText || 'Cancelar' }}
        </button>
        <button type="button"
                class="btn btn-sm btn-block"
                [ngClass]="effectiveConfirmClass"
                (click)="confirm()">
          {{ confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
  `
})
export class ConfirmDialogComponent {
  /** Suporte a dois nomes para compatibilidade */
  @Input() title?: string;
  @Input() titulo?: string;

  @Input() message?: string;
  @Input() mensagem?: string;

  @Input() confirmText?: string;
  @Input() cancelText?: string;

  @Input() variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';
  @Input() confirmClass?: string;

  /** Fecha ao clicar no backdrop (default: true) */
  @Input() backdropClose: boolean = true;

  visible = false;
  private resolver?: (v: boolean) => void;

  get effectiveTitle() { return this.title ?? this.titulo ?? 'Confirmação'; }
  get effectiveMessage() { return this.message ?? this.mensagem ?? 'Deseja confirmar esta ação?'; }

  get effectiveConfirmClass() {
    if (this.confirmClass) return this.confirmClass;
    const v = this.variant ?? 'danger';
    return 'btn-' + v;
  }

  /** Abertura: retorna Promise<boolean> */
  open(): Promise<boolean> {
    this.visible = true;
    return new Promise<boolean>(resolve => this.resolver = resolve);
  }

  confirm() { this.close(true); }
  cancel() { this.close(false); }

  private close(result: boolean) {
    this.visible = false;
    this.resolver?.(result);
    this.resolver = undefined;
  }

  /** Fecha com ESC */
  @HostListener('document:keydown.escape', ['$event'])
  onEsc(ev: KeyboardEvent) {
    if (this.visible) {
      ev.preventDefault();
      this.cancel();
    }
  }
}
