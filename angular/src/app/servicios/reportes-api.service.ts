import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ItemBiodiversidadApi {
  nombreComun: string;
  estadoConservacion: string | null;
  totalRegistros: number;
}

export interface ReporteGeneradoApi {
  idReporte: number;
  tipo: string;
  area: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaGeneracion: string;
  enlaceCompartido: string | null;
}

export interface ReporteDetalleApi {
  reporte: ReporteGeneradoApi;
  items?: ItemBiodiversidadApi[];
  meses?: { anio: number; mes: number; totalAvistamientos: number; totalEspecies: number }[];
  totalRegistros: number;
  totalEspecies: number;
}

export interface TendenciaEspecieApi {
  nombreComun: string;
  anio: number;
  mes: number;
  totalAvistamientos: number;
}

export interface ZonaActividadApi {
  direccion: string;
  totalAvistamientos: number;
}

export interface TendenciasApi {
  porEspecie: TendenciaEspecieApi[];
  zonasMasActivas: ZonaActividadApi[];
}

@Injectable({ providedIn: 'root' })
export class ReportesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  biodiversidad(desde: string, hasta: string, area = ''): Observable<ReporteDetalleApi> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (area.trim()) params = params.set('area', area.trim());
    // El backend guarda un reporte al ejecutar esta consulta.
    return this.http.get<ReporteDetalleApi>(`${this.url}/biodiversidad`, { params });
  }

  tendencias(): Observable<TendenciasApi> {
    return this.http.get<TendenciasApi>(`${this.url}/tendencias`);
  }
}
