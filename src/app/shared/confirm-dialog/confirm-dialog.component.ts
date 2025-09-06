import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        z-index: 1050;
      }
      .modal-wrap {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1060;
        padding: 1rem;
      }
      .modal-card {
        background: #fff;
        border-radius: 0.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 520px;
        overflow: hidden;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
      }
      .modal-body {
        padding: 1rem;
      }
      .modal-footer {
        padding: 0.75rem 1rem;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      .show {
        display: flex;
      }
      .btn {
        display: inline-block;
        border: 1px solid transparent;
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
      }
      .btn-secondary {
        background: #6c757d;
        color: #fff;
      }
      .btn-danger {
        background: #dc3545;
        color: #fff;
      }
      .btn-outline-secondary {
        background: #fff;
        color: #6c757d;
        border-color: #6c757d;
      }
      .btn-outline-danger {
        background: #fff;
        color: #dc3545;
        border-color: #dc3545;
      }
      .modal-title {
        margin: 0;
        font-weight: 600;
      }
      .close {
        border: none;
        background: transparent;
        font-size: 1.25rem;
        line-height: 1;
      }
      .header-danger {
        background: #f8d7da;
        color: #842029;
      }
      .header-warning {
        background: #fff3cd;
        color: #664d03;
      }
      .header-info {
        background: #cff4fc;
        color: #055160;
      }
    `,
  ],
  template: `
    <div
      class="modal-backdrop"
      [class.show]="openState"
      (click)="onBackdropClick()"
    ></div>

    <div
      class="modal-wrap"
      role="dialog"
      aria-modal="true"
      [class.show]="openState"
    >
      <div class="modal-card" [attr.aria-labelledby]="'confirm-title'">
        <div
          class="modal-header"
          [ngClass]="{
            'header-danger': variant === 'danger',
            'header-warning': variant === 'warning',
            'header-info': variant === 'info'
          }"
        >
          <h5 id="confirm-title" class="modal-title">{{ title }}</h5>
          <button class="close" aria-label="Fechar" (click)="close()">×</button>
        </div>

        <div class="modal-body">
          <ng-content></ng-content>
          <p *ngIf="!hasProjectedContent">{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary" (click)="cancel()">
            {{ cancelText }}
          </button>
          <button
            class="btn"
            [ngClass]="{
              'btn-danger': variant === 'danger',
              'btn-secondary': variant !== 'danger'
            }"
            (click)="confirm()"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmar ação';
  @Input() message = 'Tem certeza?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  openState = false;
  hasProjectedContent = false;

  // API público
  open() {
    this.openState = true;
    setTimeout(() => (this.hasProjectedContent = this.checkProjected()), 0);
  }
  close() {
    this.openState = false;
  }

  confirm() {
    this.onConfirm.emit();
    this.close();
  }
  cancel() {
    this.onCancel.emit();
    this.close();
  }

  onBackdropClick() {
    this.close();
  }

  private checkProjected(): boolean {
    // detecta se o usuário colocou conteúdo dentro do <app-confirm-dialog>...</app-confirm-dialog>
    const el = document.querySelector(
      'app-confirm-dialog .modal-body'
    ) as HTMLElement;
    if (!el) return false;
    // há nodes além do <p> default?
    return (
      el.childElementCount > 1 ||
      (el.firstElementChild
        ? el.firstElementChild.tagName.toLowerCase() !== 'p'
        : false)
    );
  }
}
