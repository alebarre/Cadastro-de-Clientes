import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
// Update the import path below if your environment file is located elsewhere
import { environment } from '../../environments/environment';
import { Cliente } from '../models/cliente.model';

export interface ClienteSummary {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cidades: string[];
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private base = `${environment.apiUrl}/clientes`;
  private _clientes$ = new BehaviorSubject<ClienteSummary[]>([]);
  clientes$ = this._clientes$.asObservable();

  constructor(private http: HttpClient) {}

  // LISTA (carrega no BehaviorSubject p/ sua lista)
  fetchAll() {
    return this.http
      .get<ClienteSummary[]>(this.base)
      .pipe(tap((list) => this._clientes$.next(list)));
  }

  getById(id: string | number) {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  create(cliente: Cliente) {
    return this.http
      .post<Cliente>(this.base, this.toRequest(cliente))
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  update(cliente: Cliente) {
    return this.http
      .put<Cliente>(`${this.base}/${cliente.id}`, this.toRequest(cliente))
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  remove(id: string | number) {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  // mapeia para DTO do backend (ClienteRequest)
  private toRequest(c: Cliente) {
    return {
      nome: c.nome,
      email: c.email,
      telefone: c.telefone ?? null,
      cpf: c.cpf ?? null,
      enderecos: (c.enderecos || []).map((e) => ({
        id: e.id ?? null, // backend ignora no create; usa no update se quiser evoluir
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento ?? null,
        bairro: e.bairro,
        cidade: e.cidade,
        uf: (e.uf || '').toUpperCase(),
        cep: (e.cep || '').replace(/\D/g, ''), // 8 dígitos
      })),
    };
  }
}
