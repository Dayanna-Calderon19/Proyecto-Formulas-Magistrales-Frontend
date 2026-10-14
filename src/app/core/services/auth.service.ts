import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient, private router: Router) {}

  /** Attempt login, store token on success */
  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials).pipe(
      tap(res => TokenService.setToken(res.token)),
      map(() => true),
      catchError(err => {
        console.error('Login error', err);
        return of(false);
      })
    );
  }

  /** Logout: clear token and navigate to login */
  logout(): void {
    TokenService.removeToken();
    this.router.navigate(['/auth']);
  }

  /** Simple token existence and expiration check */
  isAuthenticated(): boolean {
    if (!TokenService.isValid()) {
      TokenService.removeToken();
      return false;
    }
    return true;
  }


  /** Obtiene el nombre de usuario autenticado desde el token */
  getUsername(): string | null {
    return TokenService.getUsername();
  }

  /** Obtiene la lista de roles del usuario autenticado */
  getRoles(): string[] {
    return TokenService.getRoles();
  }

  /** Comprueba si el usuario tiene un rol determinado */
  hasRole(role: string): boolean {
    const roles = this.getRoles();
    if (roles.length === 0) return false;
    const target = role.toUpperCase();
    return roles.some(r => r === target || r === `ROLE_${target}`);
  }
}

