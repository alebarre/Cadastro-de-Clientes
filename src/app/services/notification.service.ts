import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'danger' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  text: string;
  delay?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _events = new Subject<Toast>();
  events$ = this._events.asObservable();

  private makeId() {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  }

  show(type: ToastType, text: string, delay = 4000) {
    this._events.next({ id: this.makeId(), type, text, delay });
  }
  success(text: string, delay = 4000) {
    this.show('success', text, delay);
  }
  error(text: string, delay = 5000) {
    this.show('danger', text, delay);
  }
  info(text: string, delay = 4000) {
    this.show('info', text, delay);
  }
  warn(text: string, delay = 5000) {
    this.show('warning', text, delay);
  }
}
