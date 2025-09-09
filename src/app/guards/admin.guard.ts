import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (
    auth.hasValidToken() &&
    auth.rolesFromToken(auth.getToken() || '').includes('ROLE_ADMIN')
  )
    return true;
  router.navigate(['/clientes']); // ou uma página 403
  return false;
};
