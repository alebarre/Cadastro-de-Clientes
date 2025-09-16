import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ok = auth.hasValidToken() &&
    auth.rolesFromToken(auth.getToken() || '').includes('ROLE_ADMIN');
  if (ok) return true;
  sessionStorage.setItem('redirect_after_login', state.url); // rota alvo
  return router.createUrlTree(['/login']);
};

export const adminMatchGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.hasValidToken() && auth.rolesFromToken(auth.getToken() || '').includes('ROLE_ADMIN')
    ? true
    : router.createUrlTree(['/clientes']);
};
