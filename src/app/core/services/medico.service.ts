import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MedicoResponse, MedicoRequest } from '../models/medico.model';
import { ConsultaHistorial } from '../models/paciente.model';
import { UsuarioResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/medicos`;

  listarMedicos(search?: string, especialidad?: string, estado?: boolean): Observable<MedicoResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (especialidad && especialidad !== 'TODAS') {
      params = params.set('especialidad', especialidad);
    }
    if (estado !== undefined && estado !== null) {
      params = params.set('estado', estado);
    }
    return this.http.get<MedicoResponse[]>(this.baseUrl, { params }).pipe(timeout(10000));
  }

  obtenerMedico(id: number): Observable<MedicoResponse> {
    return this.http.get<MedicoResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  buscarPorDni(dni: string): Observable<MedicoResponse> {
    return this.http.get<MedicoResponse>(`${this.baseUrl}/dni/${dni.trim()}`).pipe(timeout(10000));
  }

  listarEspecialidades(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/especialidades`).pipe(timeout(10000));
  }

  listarUsuariosDisponibles(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.baseUrl}/usuarios-disponibles`).pipe(timeout(10000));
  }

  obtenerConsultasMedico(id: number): Observable<ConsultaHistorial[]> {
    return this.http.get<ConsultaHistorial[]>(`${this.baseUrl}/${id}/consultas`).pipe(timeout(10000));
  }

  registrarMedico(data: MedicoRequest): Observable<MedicoResponse> {
    return this.http.post<MedicoResponse>(this.baseUrl, data).pipe(timeout(10000));
  }

  actualizarMedico(id: number, data: MedicoRequest): Observable<MedicoResponse> {
    return this.http.put<MedicoResponse>(`${this.baseUrl}/${id}`, data).pipe(timeout(10000));
  }

  activarMedico(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/activar`, {}).pipe(timeout(10000));
  }

  desactivarMedico(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/desactivar`, {}).pipe(timeout(10000));
  }

  eliminarMedico(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  desvincularUsuario(id: number): Observable<MedicoResponse> {
    return this.http.delete<MedicoResponse>(`${this.baseUrl}/${id}/usuario`).pipe(timeout(10000));
  }

  totalMedicos(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/stats/total`).pipe(timeout(10000));
  }

  totalMedicosActivos(): Observable<{ totalActivos: number }> {
    return this.http.get<{ totalActivos: number }>(`${this.baseUrl}/stats/activos`).pipe(timeout(10000));
  }
}
