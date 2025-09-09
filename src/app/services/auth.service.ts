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

  private _roles$ = new BehaviorSubject<string[]>([]);
  roles$ = this._roles$.asObservable();

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { username, password })
      .pipe(
        tap((res) => {
          const expMs = Date.now() + res.expiresIn * 1000;
          localStorage.setItem('access_token', res.token);
          localStorage.setItem('token_exp', String(expMs));
          localStorage.setItem('username', res.username);
          console.log('roles from token', this.rolesFromToken(res.token));
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
    const t = this.getToken();
    const exp = Number(localStorage.getItem('token_exp') || 0);
    return !!t && Date.now() < exp;
  }

  register(email: string, password: string) {
    return this.http.post<{ message: string }>(`${this.base}/register`, {
      email,
      password,
    });
  }
  verify(email: string, code: string) {
    return this.http.post<{ message: string }>(`${this.base}/verify`, {
      email,
      code,
    });
  }
  forgot(email: string) {
    return this.http.post<{ message: string }>(`${this.base}/forgot`, {
      email,
    });
  }
  reset(email: string, code: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.base}/reset`, {
      email,
      code,
      newPassword,
    });
  }

  // ===== helpers o token JWT =====
  private decodeJwtPayload(token: string): any {
    const payload = token.split('.')[1] || '';
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
    const json = atob(b64 + pad);
    return JSON.parse(json);
  }

  public rolesFromToken(token: string): string[] {
    try {
      const p = this.decodeJwtPayload(token);
      const claim = p['roles'];
      if (!claim) return [];
      if (Array.isArray(claim)) return claim as string[];
      if (typeof claim === 'string') {
        return claim
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }
}
