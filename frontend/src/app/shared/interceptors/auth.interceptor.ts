import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.navigate(['/login']);
        toast.error('Sessao expirada. Faca login novamente.');
      } else if (error.status === 403) {
        toast.error('Acesso negado.');
      } else if (error.status === 409) {
        toast.error(error.error?.erro || 'Recurso duplicado.');
      } else if (error.status === 422) {
        toast.error(error.error?.erro || 'Erro de validacao.');
      } else if (error.status === 0) {
        toast.error('Servidor indisponivel.');
      }
      return throwError(() => error);
    })
  );
};
