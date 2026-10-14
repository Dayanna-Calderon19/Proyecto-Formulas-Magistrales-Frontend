import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../services/token.service';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const router = inject(Router);
  const token = TokenService.getToken();

  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 (token expirado, no autenticado o firma inválida)
      // y no es la petición de login en sí, limpiar sesión y redirigir a /auth
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        TokenService.removeToken();
        router.navigate(['/auth'], {
          queryParams: { sessionExpired: 'true' }
        });
      }
      return throwError(() => error);
    })
  );
}

