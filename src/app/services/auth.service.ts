import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  expiresIn: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  private _loggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());
  loggedIn$ = this._loggedIn$.asObservable();

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { username, password })
      .pipe(
        tap((res) => {
          const expMs = Date.now() + res.expiresIn * 1000;
          localStorage.setItem('access_token', res.token);
          localStorage.setItem('token_exp', String(expMs));
          localStorage.setItem('username', res.username);
          this._loggedIn$.next(true);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_exp');
    localStorage.removeItem('username');
    this._loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  hasValidToken(): boolean {
    const t = localStorage.getItem('access_token');
    const exp = Number(localStorage.getItem('token_exp') || 0);
    return !!t && Date.now() < exp;
  }
}
