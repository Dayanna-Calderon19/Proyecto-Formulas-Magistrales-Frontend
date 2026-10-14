import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RolResponse, RolCreateRequest } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  listarRoles(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(this.baseUrl).pipe(timeout(10000));
  }

  obtenerRol(id: number): Observable<RolResponse> {
    return this.http.get<RolResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  registrarRol(data: RolCreateRequest): Observable<RolResponse> {
    return this.http.post<RolResponse>(this.baseUrl, data).pipe(timeout(10000));
  }
}
