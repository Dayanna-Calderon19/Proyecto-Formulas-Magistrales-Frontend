import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PacienteResponse, PacienteRequest, ConsultaHistorial } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pacientes`;

  listarPacientes(search?: string, estado?: boolean): Observable<PacienteResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (estado !== undefined && estado !== null) {
      params = params.set('estado', estado);
    }
    return this.http.get<PacienteResponse[]>(this.baseUrl, { params }).pipe(timeout(10000));
  }

  obtenerPaciente(id: number): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  buscarPorDni(dni: string): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.baseUrl}/dni/${dni.trim()}`).pipe(timeout(10000));
  }

  obtenerHistorial(id: number): Observable<ConsultaHistorial[]> {
    return this.http.get<ConsultaHistorial[]>(`${this.baseUrl}/${id}/historial`).pipe(timeout(10000));
  }

  registrarPaciente(data: PacienteRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.baseUrl, data).pipe(timeout(10000));
  }

  actualizarPaciente(id: number, data: PacienteRequest): Observable<PacienteResponse> {
    return this.http.put<PacienteResponse>(`${this.baseUrl}/${id}`, data).pipe(timeout(10000));
  }

  activarPaciente(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/activar`, {}).pipe(timeout(10000));
  }

  desactivarPaciente(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/desactivar`, {}).pipe(timeout(10000));
  }

  eliminarPaciente(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  totalPacientes(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/stats/total`).pipe(timeout(10000));
  }

  totalPacientesActivos(): Observable<{ totalActivos: number }> {
    return this.http.get<{ totalActivos: number }>(`${this.baseUrl}/stats/activos`).pipe(timeout(10000));
  }
}
