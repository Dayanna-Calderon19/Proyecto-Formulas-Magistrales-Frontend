import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardResumen } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  obtenerResumen(
    periodo: string = '30_DIAS',
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<DashboardResumen> {
    let params = new HttpParams().set('periodo', periodo);

    if (fechaDesde && fechaDesde.trim()) {
      params = params.set('fechaDesde', fechaDesde.trim());
    }
    if (fechaHasta && fechaHasta.trim()) {
      params = params.set('fechaHasta', fechaHasta.trim());
    }

    return this.http
      .get<DashboardResumen>(`${this.baseUrl}/resumen`, { params })
      .pipe(timeout(10000));
  }
}
