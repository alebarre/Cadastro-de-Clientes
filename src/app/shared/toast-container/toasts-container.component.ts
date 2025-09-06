import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Toast,
} from '../../services/notification.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-toasts-container',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .toast-wrapper {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1080; /* acima do navbar */
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .toast {
        min-width: 300px;
      }
    `,
  ],
  template: `
    <div class="toast-wrapper">
      <div *ngFor="let t of toasts" class="toast show border-0">
        <div
          class="toast-header"
          [ngClass]="{
            'bg-success text-white': t.type === 'success',
            'bg-danger text-white': t.type === 'danger',
            'bg-info text-dark': t.type === 'info',
            'bg-warning text-dark': t.type === 'warning'
          }"
        >
          <strong class="me-auto">
            {{
              t.type === 'success'
                ? 'Sucesso'
                : t.type === 'danger'
                ? 'Erro'
                : t.type === 'info'
                ? 'Info'
                : 'Aviso'
            }}
          </strong>
          <button
            type="button"
            class="btn-close"
            aria-label="Fechar"
            (click)="close(t.id)"
          ></button>
        </div>
        <div class="toast-body">
          {{ t.text }}
        </div>
      </div>
    </div>
  `,
})
export class ToastsContainerComponent implements OnDestroy {
  toasts: Toast[] = [];
  private sub: Subscription;

  constructor(private notify: NotificationService) {
    this.sub = this.notify.events$.subscribe((t) => {
      this.toasts = [...this.toasts, t];
      // auto-hide
      const delay = t.delay ?? 4000;
      timer(delay).subscribe(() => this.close(t.id));
    });
  }

  close(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
