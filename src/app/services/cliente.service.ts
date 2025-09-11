import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
// Update the import path below if your environment file is located elsewhere
import { environment } from '../../environments/environment';
import { Cliente, ClienteCard, ClienteRequest, ClienteSummary } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private base = `${environment.apiUrl}/clientes`;
  private _clientes$ = new BehaviorSubject<ClienteSummary[]>([]);
  clientes$ = this._clientes$.asObservable();

  constructor(private http: HttpClient) { }

  /** Card (separado, caso seu back tenha /{id}/card) */
  getCard(id: number): Observable<ClienteCard> {
    return this.http.get<ClienteCard>(`${this.base}/${id}/card`);
  }

  /** Excluir */
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => this.fetchAll().subscribe())
    );
  }

  /** Listagem (summary) */
  fetchAll(): Observable<ClienteSummary[]> {
    return this.http.get<ClienteSummary[]>(this.base).pipe(
      // NORMALIZA: se enderecosResumo não vier, monta a partir de cidades[]
      map(list => list.map(item => ({
        ...item,
        enderecosResumo: item.enderecosResumo ?? this.joinCidades(item.cidades)
      } as ClienteSummary))),
      tap(list => this._clientes$.next(list))
    );
  }

  private joinCidades(cidades?: string[]): string {
    if (!cidades || !cidades.length) return '';
    const unicas: string[] = [];
    for (const cid of cidades.map(s => s?.trim()).filter(Boolean) as string[]) {
      if (!unicas.includes(cid)) unicas.push(cid);
      if (unicas.length === 2) break;
    }
    return unicas.join(' | ');
  }

  /** Detalhe para edição ou card */
  getById(id: string | number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  /** Criar */
  create(cliente: Cliente): Observable<Cliente> {
    return this.http
      .post<Cliente>(this.base, this.toRequest(cliente))
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  /** Atualizar */
  update(id: string | number, cliente: Cliente): Observable<Cliente> {
    return this.http
      .put<Cliente>(`${this.base}/${id}`, this.toRequest(cliente))
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  remove(id: string | number) {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }


  /** Converte o modelo completo para o payload esperado pelo backend */
  private toRequest(c: Cliente): ClienteRequest {
    return {
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      enderecos: c.enderecos || [],
      modalidadesIds: (c.modalidades || []).map(m => m.id)
    };
  }
}
