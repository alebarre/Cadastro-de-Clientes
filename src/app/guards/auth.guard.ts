import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const hasAccess = auth.hasValidToken();
  const hasRefresh = !!localStorage.getItem('refresh_token');

  // Com acesso ou refresh disponivel
  if (hasAccess || hasRefresh) return true;

  // Caso contrário, vai pro login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
