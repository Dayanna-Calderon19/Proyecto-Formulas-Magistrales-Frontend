import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CitaResponse,
  CitaRequest,
  CitaReprogramarRequest,
  CitasStats
} from '../models/citas.model';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/citas`;

  listarCitas(
    search?: string,
    estado?: string,
    idMedico?: number,
    idPaciente?: number,
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<CitaResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (estado && estado.trim() && estado !== 'TODOS') {
      params = params.set('estado', estado.trim());
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

    return this.http.get<CitaResponse[]>(this.baseUrl, { params }).pipe(timeout(10000));
  }

  obtenerCita(id: number): Observable<CitaResponse> {
    return this.http.get<CitaResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  listarCitasDisponiblesConsulta(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.baseUrl}/disponibles-consulta`).pipe(timeout(10000));
  }

  registrarCita(data: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.baseUrl, data).pipe(timeout(10000));
  }

  actualizarCita(id: number, data: CitaRequest): Observable<CitaResponse> {
    return this.http.put<CitaResponse>(`${this.baseUrl}/${id}`, data).pipe(timeout(10000));
  }

  reprogramarCita(id: number, data: CitaReprogramarRequest): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.baseUrl}/${id}/reprogramar`, data).pipe(timeout(10000));
  }

  cancelarCita(id: number, motivo?: string): Observable<CitaResponse> {
    let params = new HttpParams();
    if (motivo && motivo.trim()) {
      params = params.set('motivo', motivo.trim());
    }
    return this.http.patch<CitaResponse>(`${this.baseUrl}/${id}/cancelar`, {}, { params }).pipe(timeout(10000));
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<CitaResponse> {
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);
    return this.http.patch<CitaResponse>(`${this.baseUrl}/${id}/estado`, {}, { params }).pipe(timeout(10000));
  }

  eliminarCita(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  obtenerEstadisticas(): Observable<CitasStats> {
    return this.http.get<CitasStats>(`${this.baseUrl}/stats`).pipe(timeout(10000));
  }
}
