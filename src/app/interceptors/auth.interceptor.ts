import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

let refreshing = false;
const refreshSubject = new BehaviorSubject<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  const isAuthUrl = req.url.includes('/api/auth/');

  const token = auth.getToken();
  const authReq =
    !isAuthUrl && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // se 401 em endpoints protegidos, tenta refresh (uma vez), depois repete a request
      if (err.status === 401 && !isAuthUrl) {
        // tenta refresh mesmo sem access token
        if (!refreshing) {
          refreshing = true;
          refreshSubject.next(false);
          return auth.refresh().pipe(
            switchMap(() => {
              refreshing = false;
              refreshSubject.next(true);
              const newToken = auth.getToken();
              const retried = newToken
                ? req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
                : req;
              return next(retried);
            }),
            catchError((e) => {
              refreshing = false;
              notify.error('Sessão expirada. Faça login novamente.');
              auth.logout();
              router.navigate(['/login'], {
                queryParams: { returnUrl: router.url },
              });
              return throwError(() => e);
            })
          );
        } else {
          // aguarda refresh em andamento e depois repete
          return refreshSubject.pipe(
            filter((ok) => ok === true),
            take(1),
            switchMap(() => {
              const newToken = auth.getToken();
              const retried = newToken
                ? req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
                : req;
              return next(retried);
            })
          );
        }
      }
      return throwError(() => err);
    })
  );
};
