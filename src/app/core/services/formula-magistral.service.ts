import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  FormulaMagistralResponse,
  FormulaMagistralRequest,
  ConsultaResumen
} from '../models/formula-magistral.model';

@Injectable({
  providedIn: 'root'
})
export class FormulaMagistralService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/formulas-magistrales`;

  listarFormulas(search?: string, estado?: string): Observable<FormulaMagistralResponse[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (estado && estado.trim() && estado !== 'TODOS') {
      params = params.set('estado', estado.trim());
    }
    return this.http.get<FormulaMagistralResponse[]>(this.baseUrl, { params }).pipe(timeout(10000));
  }

  obtenerFormula(id: number): Observable<FormulaMagistralResponse> {
    return this.http.get<FormulaMagistralResponse>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  listarConsultasDisponibles(): Observable<ConsultaResumen[]> {
    return this.http.get<ConsultaResumen[]>(`${this.baseUrl}/consultas-disponibles`).pipe(timeout(10000));
  }

  registrarFormula(data: FormulaMagistralRequest): Observable<FormulaMagistralResponse> {
    return this.http.post<FormulaMagistralResponse>(this.baseUrl, data).pipe(timeout(10000));
  }

  actualizarFormula(id: number, data: FormulaMagistralRequest): Observable<FormulaMagistralResponse> {
    return this.http.put<FormulaMagistralResponse>(`${this.baseUrl}/${id}`, data).pipe(timeout(10000));
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<FormulaMagistralResponse> {
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);
    return this.http.patch<FormulaMagistralResponse>(`${this.baseUrl}/${id}/estado`, {}, { params }).pipe(timeout(10000));
  }

  desactivarFormula(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  obtenerTotal(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/stats/total`).pipe(timeout(10000));
  }

  obtenerTotalActivas(): Observable<{ totalActivas: number }> {
    return this.http.get<{ totalActivas: number }>(`${this.baseUrl}/stats/activas`).pipe(timeout(10000));
  }
}
