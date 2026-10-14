import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PerfilResponse, CambioPasswordPropioRequest } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/perfil`;

  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(this.baseUrl).pipe(timeout(10000));
  }

  cambiarPassword(data: CambioPasswordPropioRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/cambiar-password`, data).pipe(timeout(10000));
  }
}
