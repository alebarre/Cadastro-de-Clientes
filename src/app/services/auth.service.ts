import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface AuthRegisterResponse { message: string };
interface AuthResponse { accessToken: string; expiresIn: number; username: string; refreshToken: string; };
interface RefreshResponse { accessToken: string; expiresIn: number; refreshToken: string; };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  private _loggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());
  loggedIn$ = this._loggedIn$.asObservable();

  constructor() {
  }

  // ===== Auth core =====
  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { username, password }).pipe(
      tap(res => {
        this.applyTokens(res.accessToken, res.expiresIn, res.username, res.refreshToken);
        const redirect = sessionStorage.getItem('redirect_after_login');
        if (redirect) {
          sessionStorage.removeItem('redirect_after_login');
          this.router.navigateByUrl(redirect);
        } else {
          this.router.navigate(['/app']);
        }
      })
    );
  }

  refresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return throwError(() => new Error('Sem refresh token'));
    return this.http.post<RefreshResponse>(`${this.base}/refresh`, { refreshToken }).pipe(
      tap(res => this.applyTokens(res.accessToken, res.expiresIn, localStorage.getItem('username') || '', res.refreshToken))
    );
  }

  logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) this.http.post(`${this.base}/logout`, { refreshToken }).subscribe({ next: () => { } });
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_exp');
    localStorage.removeItem('username');
    localStorage.removeItem('refresh_token');
    this._loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  // ===== Flows: register / verify / forgot / reset / resend =====
  register(nome: string, email: string, phone: string, password: string) {
    return this.http.post<AuthRegisterResponse>(
      `${this.base}/register`,
      { nome, email, phone, password }
    );
  }
  verify(email: string, code: string) {
    return this.http.post<{ message: string }>(`${this.base}/verify`, { email, code });
  }
  resendVerify(email: string) {
    return this.http.post<{ message: string }>(`${this.base}/resend-verify`, { email });
  }

  forgot(email: string) {
    return this.http.post<{ message: string }>(`${this.base}/forgot`, { email });
  }
  reset(email: string, code: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.base}/reset`, { email, code, newPassword });
  }
  resendReset(email: string) {
    return this.http.post<{ message: string }>(`${this.base}/resend-reset`, { email });
  }

  // ===== Helpers =====
  getToken(): string | null { return localStorage.getItem('access_token'); }
  hasValidToken(): boolean {
    const t = this.getToken(); const exp = Number(localStorage.getItem('token_exp') || 0);
    return !!t && Date.now() < exp;
  }

  rolesFromToken(token?: string): string[] {
    const t = token || this.getToken(); if (!t) return [];
    try {
      const payload = t.split('.')[1] || '';
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
      const json = atob(b64 + pad); const p = JSON.parse(json);
      const claim = p['roles'];
      if (!claim) return [];
      return Array.isArray(claim) ? claim : String(claim).split(',').map(s => s.trim()).filter(Boolean);
    } catch { return []; }
  }

  private applyTokens(accessToken: string, expiresIn: number, username: string, refreshToken: string) {
    const expMs = Date.now() + expiresIn * 1000;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('token_exp', String(expMs));
    localStorage.setItem('username', username);
    localStorage.setItem('refresh_token', refreshToken);
    this._loggedIn$.next(true);
  }
}
