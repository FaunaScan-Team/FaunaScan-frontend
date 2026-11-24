import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Contratos basados en ReporteController y los DTO de FaunaScan (Spring Boot). */
export interface ReporteApi {
  idReporte: number;
  tipo: string;
  area: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaGeneracion: string;
  enlaceCompartido: string | null;
}

export interface ItemBiodiversidadApi {
  nombreComun: string;
  estadoConservacion: string | null;
  totalRegistros: number;
}

export interface ResumenMensualApi {
  anio: number;
  mes: number;
  totalAvistamientos: number;
  totalEspecies: number;
}

export interface ReporteDetalleApi {
  reporte: ReporteApi;
  items?: ItemBiodiversidadApi[];
  meses?: ResumenMensualApi[];
  totalRegistros: number;
  totalEspecies: number;
}

export interface EnlaceReporteApi {
  idReporte: number;
  token: string;
  enlace: string;
}

@Injectable({ providedIn: 'root' })
export class MisReportesApiService {
  private readonly http = inject(HttpClient);
  private readonly ruta = `${environment.apiUrl}/reportes`;

  obtenerMios(): Observable<ReporteApi[]> {
    return this.http.get<ReporteApi[]>(`${this.ruta}/mios`);
  }

  descargarPdf(idReporte: number): Observable<Blob> {
    return this.http.get(`${this.ruta}/${idReporte}/exportar/pdf`, { responseType: 'blob' });
  }

  compartir(idReporte: number): Observable<EnlaceReporteApi> {
    return this.http.post<EnlaceReporteApi>(`${this.ruta}/compartir-link`, { idReporte });
  }

  obtenerCompartido(token: string): Observable<ReporteDetalleApi> {
    return this.http.get<ReporteDetalleApi>(`${this.ruta}/compartido/${encodeURIComponent(token)}`);
  }
}
