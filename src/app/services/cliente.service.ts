import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from '../models/cliente.model';

const STORAGE_KEY = 'clientes_db';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private _clientes$ = new BehaviorSubject<Cliente[]>(this.load());
  clientes$ = this._clientes$.asObservable();

  private load(): Cliente[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }
  private persist(list: Cliente[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    this._clientes$.next(list);
  }

  list(): Cliente[] {
    return this._clientes$.value;
  }
  getById(id: string) {
    return this.list().find((c) => c.id === id);
  }

  upsert(cliente: Cliente) {
    const exists = this.getById(cliente.id);
    const list = exists
      ? this.list().map((c) => (c.id === cliente.id ? cliente : c))
      : [...this.list(), cliente];
    this.persist(list);
  }

  remove(id: string) {
    this.persist(this.list().filter((c) => c.id !== id));
  }
}
