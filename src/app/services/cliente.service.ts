import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
// Update the import path below if your environment file is located elsewhere
import { environment } from '../../environments/environment';
import { Cliente, ClienteCard, ClienteRequest, ClienteSummary, Modalidade } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private base = `${environment.apiUrl}/clientes`;
  private _clientes$ = new BehaviorSubject<ClienteSummary[]>([]);
  clientes$ = this._clientes$.asObservable();

  constructor(private http: HttpClient) { }
  /** Modalidades (para o combo do formulário) */
  getModalidades(): Observable<Modalidade[]> {
    return this.http.get<Modalidade[]>(`${environment.apiUrl}/modalidades`);
  }


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

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/email/${email}`);
  }

  /** Detalhe para edição ou card */
  getById(id: string | number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  /** Criar – aceita Cliente ou ClienteRequest;
   * se já vier com modalidadeIds, envia direto */
  create(clienteOrRequest: Cliente | ClienteRequest): Observable<Cliente> {
    const body: ClienteRequest = this.isRequest(clienteOrRequest)
      ? clienteOrRequest as ClienteRequest
      : this.toRequest(clienteOrRequest as Cliente);
    return this.http.post<Cliente>(this.base, body)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  /** Atualizar – idem ao create */
  update(id: string | number, clienteOrRequest: Cliente | ClienteRequest): Observable<Cliente> {
    const body: ClienteRequest = this.isRequest(clienteOrRequest)
      ? clienteOrRequest as ClienteRequest
      : this.toRequest(clienteOrRequest as Cliente);
    return this.http.put<Cliente>(`${this.base}/${id}`, body)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  remove(id: string | number) {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }


  /** Converte Cliente -> ClienteRequest (quando não vier pronto) */
  private toRequest(c: Cliente): ClienteRequest {
    return {
      nome: c.nome,
      email: c.email,
      telefone: c.telefone ?? null,
      cpf: c.cpf ?? null,
      dataNascimento: c.dataNascimento ?? null,
      enderecos: c.enderecos || [],
      modalidadeIds: (c.modalidades || []).map(m => m.id),
    };
  }

  /** Detecta se já é um DTO pronto (tem modalidadeIds) */
  private isRequest(obj: any): obj is ClienteRequest {
    return obj && Array.isArray(obj.modalidadeIds);
  }

}
