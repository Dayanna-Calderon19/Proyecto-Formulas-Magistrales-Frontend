import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  UsuarioResponse,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  PasswordResetRequest
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  listarUsuarios(search?: string, rol?: string, activo?: boolean): Observable<UsuarioResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (rol && rol !== 'TODOS') {
      params = params.set('rol', rol);
    }
    if (activo !== undefined && activo !== null) {
      params = params.set('activo', activo);
    }
    return this.http.get<UsuarioResponse[]>(this.baseUrl, { params }).pipe(timeout(10000));
  }

  obtenerUsuario(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  registrarUsuario(data: UsuarioCreateRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.baseUrl, data).pipe(timeout(10000));
  }

  actualizarUsuario(id: number, data: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.baseUrl}/${id}`, data).pipe(timeout(10000));
  }

  activarUsuario(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/activar`, {}).pipe(timeout(10000));
  }

  desactivarUsuario(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/desactivar`, {}).pipe(timeout(10000));
  }

  restablecerPassword(id: number, data: PasswordResetRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/password`, data).pipe(timeout(10000));
  }
}
