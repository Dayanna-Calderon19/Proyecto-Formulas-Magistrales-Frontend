import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ConsultaResponse,
  ConsultaRequest,
  ConsultasStats
} from '../models/consultas.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/consultas`;

  listarConsultas(
    search?: string,
    idMedico?: number,
    idPaciente?: number,
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<ConsultaResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (idMedico) {
      params = params.set('idMedico', idMedico);
    }
    if (idPaciente) {
      params = params.set('idPaciente', idPaciente);
    }
    if (fechaDesde && fechaDesde.trim()) {
      params = params.set('fechaDesde', fechaDesde.trim());
    }
    if (fechaHasta && fechaHasta.trim()) {
      params = params.set('fechaHasta', fechaHasta.trim());
    }

    return this.http.get<ConsultaResponse[]>(this.baseUrl, { params }).pipe(timeout(10000));
  }

  obtenerConsulta(id: number): Observable<ConsultaResponse> {
    return this.http.get<ConsultaResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  registrarConsulta(data: ConsultaRequest): Observable<ConsultaResponse> {
    return this.http.post<ConsultaResponse>(this.baseUrl, data).pipe(timeout(10000));
  }

  actualizarConsulta(id: number, data: ConsultaRequest): Observable<ConsultaResponse> {
    return this.http.put<ConsultaResponse>(`${this.baseUrl}/${id}`, data).pipe(timeout(10000));
  }

  eliminarConsulta(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  obtenerEstadisticas(): Observable<ConsultasStats> {
    return this.http.get<ConsultasStats>(`${this.baseUrl}/stats`).pipe(timeout(10000));
  }
}
