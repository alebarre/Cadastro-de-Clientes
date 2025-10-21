import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioRequest, UsuarioSummary } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = environment.apiUrl.replace(/\/$/, '');
  private base = `${this.api}/usuarios`;

  private _usuarios$ = new BehaviorSubject<UsuarioSummary[]>([]);
  usuarios$ = this._usuarios$.asObservable();

  constructor(private http: HttpClient) { }

  fetchAll(): Observable<UsuarioSummary[]> {
    return this.http.get<UsuarioSummary[]>(this.base).pipe(
      tap(list => this._usuarios$.next(list))
    );
  }

  getById(id: number | string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  getLoggedUser(): Observable<Usuario | null> {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return of(user);
  }

  create(body: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, body)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  update(id: number | string, body: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, body)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.fetchAll().subscribe()));
  }
}
